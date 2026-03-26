---
id: SPEC-003
status: APPROVED
feature: hu-03-registrar-devolucion-en-plazo
created: 2026-03-24
updated: 2026-03-25
author: spec-generator
version: "1.0"
related-specs: [sistema-de-prestamos-y-multas]
---

# Spec: HU-03 - Registrar devolución de un libro dentro del plazo

> **Estado:** `APPROVED`

---

## 1. REQUERIMIENTOS

### Descripción
Permitir registrar la devolución ocurrida en o antes de la fecha límite, cerrar el préstamo sin generar multa y marcar el libro como disponible.

### Historia de Usuario
```
Como: Bibliotecario
Quiero: Registrar que el libro fue devuelto en o antes de la fecha límite
Para: Cerrar el préstamo sin generar multa
```

#### Criterios de Aceptación
```gherkin
Scenario: Registrar una devolución en fecha
  Given existe un préstamo activo
  And la devolución ocurre en o antes de la fecha límite
  When el bibliotecario registra la devolución
  Then el sistema cierra el préstamo (status=RETURNED)
  And no genera multa
  And el libro queda disponible
```

```gherkin
Scenario: Intentar devolver un préstamo no activo
  Given no existe un préstamo activo para el libro consultado
  When el bibliotecario intenta registrar la devolución
  Then el sistema responde 404
```

---

## 2. DISEÑO

### Modelo
Actualizar `loan_books`: set `date_return`, `state=RETURNED`.

### Endpoint
PATCH /api/v1/loan (mismo que HU-04)
- Body: `{ id_book?, id_reader?, name_reader?, date_return, type_id_reader, base_fib_amount? }`
- Responses:
  - 200: Devolución registrada (RETURNED, sin deuda si es en plazo)
  - 400: `INVALID_PAYLOAD` (fecha inválida, tipo_id_reader inválido, etc.)
  - 404: `LOAN_NOT_FOUND` (no existe préstamo activo con los criterios)
  - 409: `ALREADY_RETURNED` (préstamo ya fue devuelto)
  - 500: `SEARCH_ERROR` | `UPDATE_ERROR` | `INTERNAL_SERVER_ERROR`

**Nota de implementación:**
- Validación de payload → Zod → `INVALID_PAYLOAD` 400
- Búsqueda de préstamo (por id_book, id_reader o ambos) → LoanService → `LOAN_NOT_FOUND` 404
- Validación de estado (no ya retornado) → LoanService → `ALREADY_RETURNED` 409
- Actualización en BD → LoanRepository → éxito 200 u error 500

### Frontend
- Component: `ReturnForm` — inputs para identificar préstamo y fecha de devolución.
- Hook: `useLoan.returnLoan(data)` → `PATCH /api/v1/loans`.

---

## 3. LISTA DE TAREAS

### Backend
- [x] `LoanRepository.get_by_id(loan_id)` y `update_return(loan_id, date_return)`.
  - Implementados getActiveLoanByBook, getActiveLoanByReader, getActiveLoanByBookAndReader, getActiveLoanByTitleAndReader, getActiveLoanByTitle, updateReturn
- [x] Validar existencia y estado antes de actualizar.
  - Schema Zod para validación de campos (id_book, id_reader, name_reader con reglas complejas)
  - Lógica de búsqueda inteligente en LoanService.returnLoan basada en parámetros
  - Validaciones de estado de préstamo (RETURNED vs ON_LOAN)
- [x] Endpoint PATCH /api/v1/loan implementado con respuestas 200/404/409/400.
- [x] Manejo centralizado de errores en middleware.
- [ ] Tests: devolución en fecha, devolución no activa, payload inválido.

### Frontend
- [x] `ReturnForm` + validaciones de inputs.
  - Component ReturnForm.jsx con inputs flexibles (id_book, title, type_id_reader, id_reader, date_return)
  - Validación de búsqueda inteligente: al menos uno de id_book o id_reader requerido
  - Validación de fecha: no puede ser futura
  - Campo title deshabilitado si id_book está vacío
- [x] Mostrar mensajes claros para 404/409/400.
  - Hook useLoan.returnLoan() con manejo de errores específicos
  - Alertas visuales para LOAN_NOT_FOUND (404), ALREADY_RETURNED (409), INVALID_PAYLOAD (400)
  - Alertas de éxito/error estilizadas en el formulario

### QA
- [ ] Fixtures: préstamo activo, solicitud de devolución con fecha límite y con fecha tardía.
- [ ] Escenarios y evidencia.
