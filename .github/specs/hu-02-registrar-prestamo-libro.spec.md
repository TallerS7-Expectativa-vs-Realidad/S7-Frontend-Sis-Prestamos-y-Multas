---
id: SPEC-002
status: APPROVED
feature: hu-02-registrar-prestamo-libro
created: 2026-03-24
updated: 2026-03-25
author: spec-generator
version: "1.1"
related-specs: [sistema-de-prestamos-y-multas]
---

# Spec: HU-02 - Registrar préstamo de un libro a un lector habilitado

> **Estado:** `APPROVED`

---

## 1. REQUERIMIENTOS

### Descripción
Registrar el préstamo de un libro disponible a un lector que no tenga deuda pendiente; calcular fecha límite según plazo (7|14|21 días) y dejar registro en `loan_books`.

### Historia de Usuario
```
Como: Bibliotecario
Quiero: Registrar el préstamo de un libro disponible a un lector sin deuda pendiente por multa
Para: Controlar la salida del libro y definir la fecha de devolución
```

#### Criterios de Aceptación
```gherkin
Scenario: Registrar un préstamo válido
  Given el libro está disponible
  And el lector no tiene deuda pendiente por multa
  And el plazo elegido es 7|14|21
  When el bibliotecario registra el préstamo
  Then el sistema guarda el préstamo y devuelve 201
  And el libro queda en estado ON_LOAN
```

```gherkin
Scenario: Intentar prestar a un lector con deuda
  Given el lector tiene una deuda pendiente
  When el bibliotecario intenta registrar un préstamo
  Then el sistema responde 409 (READER_HAS_DEBT)
```

```gherkin
Scenario: Registrar préstamo a lector rehabilitado tras pago
  Given el lector tuvo una deuda pendiente
  And la deuda fue pagada totalmente
  And el libro está disponible
  When el bibliotecario registra un préstamo
  Then el sistema permite la operación
```

```gherkin
Scenario: Intentar registrar un préstamo con plazo no permitido
  Given el libro está disponible
  And el lector no tiene deuda pendiente por multa
  And el plazo elegido no es 7, 14 ni 21 días
  When el bibliotecario registra un préstamo
  Then el sistema responde 400 (INVALID_LOAN_DAYS)
```

### Reglas de Negocio
- `loan_days` debe ser 7,14 o 21; si no, 400 (INVALID_LOAN_DAYS).
- Verificar disponibilidad consultando la última tupla por `id_book`.
- Verificar deuda más reciente en `debt_reader` por `id_reader`.
- El lector se considera habilitado únicamente cuando no tiene deuda pendiente activa.

---

## 2. DISEÑO

### Modelos
- `loan_books` (ver HU-01) — insertar nuevo documento con `state=ON_LOAN`, `date_limit` calculada.
- `debt_reader` usado para verificar deudas (consultar `state_debt = PENDING`).

### Endpoint
POST /api/v1/loan
- Body: `{ id_book, title, type_id_reader, id_reader, name_reader, loan_days }`
- Responses:
  - 201: Loan creado (ver formato)
  - 400: `INVALID_LOAN_DAYS` | `INVALID_PAYLOAD`
  - 409: `BOOK_NOT_AVAILABLE` | `READER_HAS_DEBT`

### Frontend
- Component: `LoanForm` con inputs y select (7/14/21) y cálculo visual de `date_limit`.
- Hook: `useLoan.createLoan(data)` → `POST /api/v1/loans`.

---

## 3. LISTA DE TAREAS

### Backend ✅ COMPLETADO
- [x] Validaciones `loan_days` y tipos de id. (Zod schema en `models/Loan.js`)
- [x] `LoanRepository.insert_loan` y verificación de disponibilidad. (Implementado)
- [x] `DebtRepository.get_latest_by_reader` para validar bloqueo. (Implementado)
- [x] Servicio con lógica de negocio (LoanService: validación + orquestación)
- [x] Rutas HTTP POST /api/v1/loan y GET /api/v1/loan/:name (loanRoutes.js)
- [x] Auto-inicialización de base de datos (src/db/initialize.js)
- [ ] Tests: creación éxito, libro no disponible, lector con deuda.

### Frontend
- [x] `LoanForm` + cálculo visual de fecha límite.
- [x] Manejo de errores 400/409/500.

### QA
- [ ] Datos: libro disponible, lector habilitado, lector con deuda.
- [ ] Escenarios de aceptación y evidencias.
