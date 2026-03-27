---
id: SPEC-006
status: APPROVED
feature: hu-06-registrar-pago-total-multa-rehabilitar-lector
created: 2026-03-24
updated: 2026-03-25
author: spec-generator
version: "1.0"
related-specs: [sistema-de-prestamos-y-multas]
---

# Spec: HU-06 - Registrar pago total de multa y rehabilitar lector

> **Estado:** `APPROVED`

---

## 1. REQUERIMIENTOS

### Descripción
Registrar el pago total de la deuda de un lector, marcar `debt_reader.state_debt = PAID` y rehabilitar al lector para nuevos préstamos.

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
  Then el sistema deja la deuda en cero y marca state_debt = PAID
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
- Al pagar se actualiza la deuda pendiente a `PAID` y el lector deja de figurar como bloqueado.
- Si no existe deuda pendiente, el sistema no debe registrar el pago.

---

## 2. DISEÑO

### Endpoint
PATCH /api/v1/debts/{id_debt}
- Auth: sí
- Body: `{ state_debt: "PAID" }`
- Logic: verificar deuda existente `state_debt = PENDING` y permitir solo pago total
- Responses:
  - 200: `{ id_debt, loan_id, type_id_reader, id_reader, name_reader, amount_debt, state_debt: "PAID" }`
  - 404: `DEBT_NOT_FOUND`
  - 409: `DEBT_ALREADY_PAID`

GET /api/v1/debts/{id_reader}
- Uso actual observado en backend: consulta de deudas pendientes por identificador de lector.
- Responses:
  - 200: `{ success, data: Debt[] }`
  - 500: `INTERNAL_SERVER_ERROR`

### Frontend
- Component: `DebtPaymentForm` que permite buscar lector, visualizar deuda pendiente y confirmar pago total.
- Hook: `useDebt.getReaderDebt(idReader)` → `GET /api/v1/debts/{id_reader}`.
- Hook: `useDebt.payDebt(idDebt)` → `PATCH /api/v1/debts/{id_debt}`.

---

## 3. LISTA DE TAREAS

### Backend
- [x] `DebtRepository.getLatestPendingDebtByReader(id_reader)`.
- [ ] `DebtRepository.markDebtAsPaid(id_debt)`.
- [ ] `DebtService.payDebt(id_debt)` — validar deuda pendiente y marcar `PAID`.
- [x] `GET /api/v1/debts/{id_reader}` para consultar deudas pendientes por lector.
- [ ] `PATCH /api/v1/debts/{id_debt}` para registrar el pago total.
- [ ] Tests: pago éxito, intento sin deuda, intento sobre deuda ya pagada.

### Frontend
- [ ] `DebtPaymentForm` UX para búsqueda, visualización de deuda y confirmación de pago total.

### QA
- [ ] Fixtures: lector con deuda, lector sin deuda.
- [ ] Validar que al pagar el lector quede habilitado, no acepte pagos duplicados y no queden saldos residuales.
