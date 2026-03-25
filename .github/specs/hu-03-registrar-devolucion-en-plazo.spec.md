---
id: SPEC-003
status: APPROVED
feature: hu-03-registrar-devolucion-en-plazo
created: 2026-03-24
updated: 2026-03-24
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
Actualizar `loan_books`: set `date_return`, `state=RETURNED`, `updated_at`.

### Endpoint
PATCH /api/v1/loan
- Auth: sí
- Body: `{ loan_id, date_return, type_id_reader, id_reader, name_reader }`
- Responses:
  - 200: préstamo actualizado (RETURNED)
  - 404: `LOAN_NOT_FOUND`
  - 409: `ALREADY_RETURNED`
  - 400: `INVALID_PAYLOAD`

### Frontend
- Component: `ReturnForm` — inputs para identificar préstamo y fecha de devolución.
- Hook: `useLoan.returnLoan(data)` → `PATCH /api/v1/loan`.

---

## 3. LISTA DE TAREAS

### Backend
- [ ] `LoanRepository.get_by_id(loan_id)` y `update_return(loan_id, date_return)`.
- [ ] Validar existencia y estado antes de actualizar.
- [ ] Tests: devolución en fecha, devolución no activa, payload inválido.

### Frontend
- [ ] `ReturnForm` + validaciones de inputs.
- [ ] Mostrar mensajes claros para 404/409/400.

### QA
- [ ] Fixtures: préstamo activo, solicitud de devolución con fecha límite y con fecha tardía.
- [ ] Escenarios y evidencia.
