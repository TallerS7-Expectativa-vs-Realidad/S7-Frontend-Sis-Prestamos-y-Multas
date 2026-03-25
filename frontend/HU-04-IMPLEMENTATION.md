# HU-04 Frontend Implementation - Registrar Devolución Tardía y Generar Multa

## Spec
- **ID**: SPEC-004
- **Status**: APPROVED
- **Feature**: hu-04-registrar-devolucion-tardia-generar-multa

## Components Implemented

### 1. DebtSummary Component (`/src/components/DebtSummary.jsx`)
Displays late return fee details with:
- **Days Late**: Number of days the book was returned past due date
- **Fibonacci Units**: Number of Fibonacci units accumulated for the fee
- **Fee Amount**: Total fee amount formatted in currency
- **Debt ID**: Reference ID for the debt record
- **Warning Message**: Informs that debt must be paid before new loans

**Props**:
```javascript
{
  debt: {
    days_late: number,      // Days returned late
    units_fib: number,      // Fibonacci units accumulated
    amount_dept: number,    // Fee amount in currency
    dept_id?: string        // Optional: Debt record ID
  }
}
```

### 2. Updated ReturnForm Component (`/src/components/ReturnForm.jsx`)
Enhanced to:
- Import and render `DebtSummary` component
- Display debt details when late return is detected
- Show appropriate messages:
  - ✓ Success message with loan ID
  - Optional message for on-time returns (no fee)
  - Detailed fee breakdown for late returns

**Flow**:
1. Form submission → Backend PATCH /api/v1/loan
2. Backend returns loan data with debt info if late
3. ReturnForm displays success alert
4. DebtSummary component shows debt details if present

## Styling

### Files
- `ReturnForm.module.css` - Updated with better alert structure
- `DebtSummary.module.css` - New file with comprehensive debt summary styling

### Key Classes
- `.debtSummary` - Main container with red gradient background
- `.debtHeader` - Title and explanation section
- `.debtDetails` - Debt information items
- `.debtAmount` - Highlighted fee amount
- `.debtWarning` - Important notice about debt blocking new loans

## Architecture Compliance

✅ **Service Layer**: Uses existing `loanService.returnLoan()` (no changes needed)
✅ **Hook Layer**: Uses existing `useLoan()` hook (no changes needed)
✅ **Component Layer**: New `DebtSummary` component follows project patterns
✅ **Styling**: CSS Modules only (no global styles or frameworks)
✅ **Auth**: No auth required for return form (uses existing patterns)
✅ **Environment**: Uses `VITE_API_URL` for backend endpoint

## Backend Requirements

The PATCH `/api/v1/loan` endpoint must return (for late returns):
```javascript
{
  loan_id: string,
  state: "RETURNED",
  date_return: string,
  days_late: number,        // Days returned late
  units_fib: number,        // Fibonacci units accumulated
  amount_dept: number,      // Fee amount
  dept_id?: string          // Optional: Debt record ID
}
```

For on-time returns:
```javascript
{
  loan_id: string,
  state: "RETURNED",
  date_return: string
  // No debt fields
}
```

## User Flow

1. **Bibliotecario** accede a `/return` page
2. Completa el formulario con datos del libro/lector y fecha de devolución
3. Registra la devolución
4. Sistema valida fechas y busca el préstamo
5. **If on-time return**: Muestra solo mensaje de éxito
6. **If late return**: Muestra:
   - ✓ Devolución registrada exitosamente
   - Resumen detallado de la multa en DebtSummary
   - Advertencia: multa debe ser pagada para nuevos préstamos

## Testing Considerations

- **DebtSummary Props**: Test with various days_late values (1, 8, 15, 22)
- **Formatting**: Currency formatting (2 decimal places)
- **Conditional Rendering**: Verify debt summary only shows when `days_late > 0`
- **Accessibility**: ARIA labels and role attributes present
- **Responsive Design**: Mobile-friendly layout (tested at 600px breakpoint)

## Future Enhancements

- Print receipt functionality for debt summary
- Debt payment integration (link to HU-06 payment form)
- Email notification to reader with debt details
- Configurable Fibonacci base amount (BASE_FIB_AMOUNT)
