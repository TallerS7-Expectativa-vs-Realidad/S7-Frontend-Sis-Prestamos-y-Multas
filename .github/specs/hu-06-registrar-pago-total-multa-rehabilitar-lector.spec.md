---
id: SPEC-006
status: APPROVED
feature: hu-06-registrar-pago-total-multa-rehabilitar-lector
created: 2026-03-24
updated: 2026-03-24
author: spec-generator
version: "1.0"
related-specs: [sistema-de-prestamos-y-multas]
---

# Spec: HU-06 - Registrar pago total de multa y rehabilitar lector

> **Estado:** `APPROVED`

---

## 1. REQUERIMIENTOS

### Descripción
Registrar el pago total de la deuda de un lector, marcar `dept_reader.state_dept = PAID` y rehabilitar al lector para nuevos préstamos.

### Historia de Usuario
```
Como: Bibliotecario
Quiero: Registrar el pago total de una multa pendiente
Para: Rehabilitar al lector y permitirle solicitar nuevos préstamos
```

#### Criterios de Aceptación
```gherkin
Scenario: Registrar pago total de multa
  Given el lector tiene una deuda pendiente
  When el bibliotecario registra un pago total
  Then el sistema deja la deuda en cero y marca state_dept = PAID
  And el lector queda habilitado
```

```gherkin
Scenario: Intentar pagar deuda inexistente
  Given el lector no tiene deuda pendiente
  When intenta registrar el pago
  Then el sistema responde 400 (NO_DEBT_FOUND)
```

### Reglas de Negocio
- Solo se permite pago total (no pagos parciales en MVP).
- Al pagar se crea registro de movimiento y se marca `PAID`.

---

## 2. DISEÑO

### Endpoint
POST /api/v1/debt/pay
- Auth: sí
- Body: `{ id_reader, type_id_reader, amount }`
- Logic: verificar deuda más reciente `state_dept = PENDING` y `amount_dept == amount` (o aceptar amount >= amount_dept)
- Responses:
  - 200: `{ id_reader, state_dept: "PAID" }`
  - 400: `NO_DEBT_FOUND` | `INVALID_AMOUNT`

### Frontend
- Component: `DebtPaymentForm` que permite seleccionar lector y confirmar pago total.
- Hook: `useDebt.payDebt(data)` → `POST /api/v1/debt/pay`.

---

## 3. LISTA DE TAREAS

### Backend
- [ ] `DebtRepository.get_latest_by_reader(id_reader)`.
- [ ] `DebtService.pay_debt(id_reader, amount)` — validar y marcar `PAID`.
- [ ] Tests: pago éxito, intento sin deuda.

### Frontend
- [ ] `DebtPaymentForm` UX para confirmar pago total.

### QA
- [ ] Fixtures: lector con deuda, lector sin deuda.
- [ ] Validar que al pagar lector quede habilitado y nueva deuda no exista.
