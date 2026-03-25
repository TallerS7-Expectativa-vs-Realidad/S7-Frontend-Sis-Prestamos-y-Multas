---
id: SPEC-001
status: APPROVED
feature: hu-01-consultar-estado-disponibilidad-libro
created: 2026-03-24
updated: 2026-03-24
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
Scenario: Consultar un libro inexistente
  Given no existe un libro con el identificador consultado
  When el bibliotecario realiza la búsqueda
  Then el sistema informa que el libro no fue encontrado
```

### Reglas de Negocio
- Usar historial `loan_books` para determinar disponibilidad.
- Búsqueda case-insensitive por `title`.
- Si no hay registros anteriores del libro, considerarlo disponible.

---

## 2. DISEÑO

### Modelo relevante
`loan_books` (subconjunto): `loan_id, id_book, title, state (ON_LOAN|RETURNED), date_return, date_limit`

### Endpoint
GET /api/v1/loan/{name}
- Path: `name` (string)
- Responses:
  - 200: `{ "results": [ { "id": integer, "name": string, "status": "RETURNED"|"ON_LOAN" } ] }`
  - 400: `INVALID_NAME`
  - 500: Internal Server Error

### Frontend
- Component: `LoanSearch` (`components/LoanSearch.jsx`) con input y botón.
- Hook: `useLoan.searchByName(name)` → llama `GET /api/v1/loan/{name}` y retorna `results`.

---

## 3. LISTA DE TAREAS

### Backend
- [ ] Implementar `LoanRepository.find_by_name(name)` (case-insensitive).
- [ ] Implementar router `GET /api/v1/loan/{name}`.
- [ ] Tests: búsqueda existosa, nombre inválido, libro inexistente.

### Frontend
- [ ] `LoanSearch` component + integración con hook/service.
- [ ] Validaciones UI (campo no vacío).
- [ ] E2E/Unit tests UI mocks.

### QA
- [ ] Preparar datos: libro disponible, libro prestado, libro inexistente.
- [ ] Escenarios Gherkin y evidencia.
