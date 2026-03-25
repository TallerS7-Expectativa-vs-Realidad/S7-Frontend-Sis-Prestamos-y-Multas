# HU-04 Frontend - Data Flow Debugging Guide

## Problem Fixed
Backend envía respuesta anidada, pero frontend esperaba datos planos.

### Backend Response Structure
```json
{
  "success": true,
  "data": {
    "loan": {
      "loan_id": 1,
      "id_book": "BOOK001",
      "title": "Harry Potter",
      "type_id_reader": "CI",
      "id_reader": "123456",
      "name_reader": "Juan Pérez",
      "date_loan": "2026-03-18 19:21:28",
      "date_limit": "2026-04-01 19:21:28",
      "date_return": "2026-05-14T00:00:00.000Z",
      "state": "RETURNED"
    },
    "debt": {
      "dept_id": 5,
      "loan_id": 1,
      "id_reader": "123456",
      "name_reader": "Juan Pérez",
      "units_fib": 20,
      "amount_dept": 20.00,
      "state_dept": "PENDING",
      "created_at": "2026-05-14T12:30:00.000Z",
      "updated_at": "2026-05-14T12:30:00.000Z"
    },
    "days_late": 42,
    "message": "Loan returned with 42 days late. Debt created."
  }
}
```

## Solution: Service Normalization

### File: `frontend/src/services/loanService.js`

**Updated `returnLoan()` function** now:
1. Receives nested response from backend
2. Extracts `loan`, `debt`, and `days_late` from `data` object
3. Normalizes into flat structure:

```javascript
// Normalized output to frontend
{
  loan_id: 1,
  id_book: "BOOK001",
  title: "Harry Potter",
  id_reader: "123456",
  name_reader: "Juan Pérez",
  date_return: "2026-05-14T00:00:00.000Z",
  state: "RETURNED",
  days_late: 42,
  dept_id: 5,
  units_fib: 20,
  amount_dept: 20.00,
  state_dept: "PENDING"
}
```

## Data Flow Through Components

### 1. ReturnForm → useLoan Hook
```jsx
const result = await returnLoan(returnData);  // Calls normalized service
```

### 2. useLoan Hook → ReturnForm
```javascript
setLoanData(response);  // response is normalized from service
return response;
```

### 3. ReturnForm → UI Rendering
```jsx
{success && loanData && loanData.days_late && (
  <DebtSummary debt={loanData} />
)}
```

### 4. DebtSummary Component Processing
```javascript
const { days_late, units_fib, amount_dept, dept_id } = debt;
const weeks = calculateWeeks(days_late);  // Calculates weeks from days
```

## Calculation Logic

### Weeks Calculation
```javascript
function calculateWeeks(daysLate) {
  return Math.floor((daysLate - 1) / 7) + 1;
}

// Examples:
// 1 day   → 1 week
// 7 days  → 1 week
// 8 days  → 2 weeks
// 14 days → 2 weeks
// 15 days → 3 weeks
// 42 days → 6 weeks
```

## UI Conditional Logic

### Scenario 1: On-Time Return (no debt)
```
success = true
loanData = { 
  loan_id: 1, 
  state: "RETURNED", 
  date_return: "2026-05-14",
  days_late: null  // ← Null or missing
}

Renders:
✓ Devolución registrada exitosamente
  ID del préstamo: 1
  No hay multa por esta devolución.
```

### Scenario 2: Late Return (with debt)
```
success = true
loanData = { 
  loan_id: 1, 
  state: "RETURNED", 
  date_return: "2026-05-14",
  days_late: 42,      // ← Present and > 0
  units_fib: 20,
  amount_dept: 20.00,
  dept_id: 5
}

Renders:
✓ Devolución registrada exitosamente
  ID del préstamo: 1

[DebtSummary Component]:
📋 Resumen de Multa
El libro fue devuelto 42 días después de la fecha límite
(equivalente a 6 semanas completas).

Días de retraso: 42 días
Semanas completas: 6 semanas
Unidades Fibonacci acumuladas: 20 unidades
Monto de la multa: $20.00

ID de deuda: 5

⚠️ Importante: Esta multa debe ser pagada antes de poder 
   solicitar nuevos préstamos.
```

## Testing Checklist

- [ ] Late return (42 days) shows DebtSummary with correct data
- [ ] On-time return (0 days) shows "No hay multa" message
- [ ] Weeks calculation correct: 1-7 days = 1 week, 8-14 days = 2 weeks, etc.
- [ ] Currency formatting: $20.00 (2 decimal places, locale-aware)
- [ ] Singular/plural forms: "1 día" vs "42 días", "1 semana" vs "6 semanas"
- [ ] Debt ID displays when present
- [ ] Mobile responsive (test at 600px)

## Debugging Tips

1. **Check Network Response**: Open DevTools → Network, filter by `/api/v1/loan` PATCH request
   - Verify response in "Response" tab has correct structure

2. **Check Normalized Data**: Add console log in hook:
   ```javascript
   const response = await returnLoanService(data);
   console.log('Normalized response:', response);
   setLoanData(response);
   ```

3. **Check Component Props**: Add debug in DebtSummary:
   ```jsx
   console.log('DebtSummary received debt:', debt);
   ```

4. **Verify Conditional Rendering**: 
   - Check `loanData.days_late` is a number > 0, not `null` or `undefined`
   - Check `success === true` before rendering DebtSummary

## Backend Integration Notes

- Response structure expected: `{ success, data: { loan, debt, days_late } }`
- Service automatically extracts and normalizes this
- If backend changes response structure, update the normalization logic in `returnLoan()`
- For on-time returns, `debt` field may be `null` or missing entirely
- `days_late` will be `null`, `undefined`, or `0` for on-time returns
