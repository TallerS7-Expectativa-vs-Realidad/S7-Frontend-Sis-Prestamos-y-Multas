---
id: SPEC-001
status: APPROVED
feature: hu-01-consultar-estado-disponibilidad-libro
created: 2026-03-24
updated: 2026-03-25
author: spec-generator
version: "1.0"

---

# Spec: HU-01 - Consultar estado y disponibilidad de un libro

> **Estado:** `APPROVED`

---

## 1. REQUERIMIENTOS

### Descripción
Permitir al bibliotecario consultar si un libro está disponible o tiene un préstamo activo, mostrando información mínima para la toma de decisión.

### Requerimiento de Negocio
Extraído de `USER_STORIES.md` y `SUBTASKS.md`.

### Historia de Usuario
```
Como: Bibliotecario
Quiero: Consultar el estado actual del libro por nombre o identificador
Para: Saber si está disponible o prestado
```

#### Criterios de Aceptación
```gherkin
Scenario: Consultar un libro disponible
  Given existe un libro registrado y no tiene un préstamo activo
  When el bibliotecario consulta ese libro
  Then el sistema muestra que el libro está disponible
```

```gherkin
Scenario: Consultar un libro sin historial de préstamo
  Given el libro consultado no registra préstamos previos en el historial
  When el bibliotecario realiza la búsqueda
  Then el sistema informa que el libro no registra historial de préstamo
  And lo considera disponible para préstamo
```

```gherkin
Scenario: Consultar un libro con préstamo activo
  Given existe un libro con último estado ON_LOAN en su historial
  When el bibliotecario consulta ese libro
  Then el sistema muestra que el libro no está disponible
  And muestra que tiene un préstamo activo
```

### Reglas de Negocio
- Usar historial `loan_books` para determinar disponibilidad.
- Búsqueda case-insensitive por `title`.
- Si no hay registros anteriores del libro, informarlo como sin historial y considerarlo disponible.
- No tratar ausencia de historial como inexistencia bibliográfica.

---

## 2. DISEÑO

### Modelo relevante
`loan_books` (subconjunto): `loan_id, id_book, title, state (ON_LOAN|RETURNED), date_return, date_limit`

### Endpoint
GET /api/v1/loans/{name}
- Path: `name` (string)
- Responses:
  - 200: `{ "results": [ { "id": integer, "name": string, "status": "RETURNED"|"ON_LOAN" } ], "message"?: string }`
  - 400: `INVALID_NAME`
  - 500: Internal Server Error

### Frontend
- Component: `LoanSearch` (`components/LoanSearch.jsx`) con input y botón.
- Hook: `useLoan.searchByName(name)` → llama `GET /api/v1/loans/{name}` y retorna `results`.

---

## 3. LISTA DE TAREAS

### Backend
- [x] Implementar `LoanRepository.findByName(name)` (case-insensitive).
- [x] Implementar router `GET /api/v1/loans/{name}`.
- [ ] Tests: búsqueda exitosa, nombre inválido, libro sin historial, libro con préstamo activo.

### Frontend
- [ ] `LoanSearch` component + integración con hook/service.
- [x] `useLoan.searchByName(name)` integrado con `GET /api/v1/loans/{name}`.
- [ ] Validaciones UI (campo no vacío).
- [ ] E2E/Unit tests UI mocks.

### QA
- [ ] Preparar datos: libro disponible, libro prestado y libro sin historial.
- [ ] Escenarios Gherkin y evidencia.
