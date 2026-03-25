---
id: SPEC-005
status: APPROVED
feature: hu-05-consultar-prestamos-vencidos-y-lector
created: 2026-03-24
updated: 2026-03-25
author: spec-generator
version: "1.0"
related-specs: [sistema-de-prestamos-y-multas]
---

# Spec: HU-05 - Consultar préstamos vencidos y lector responsable

> **Estado:** `APPROVED`

---

## 1. REQUERIMIENTOS

### Descripción
Listar préstamos que ya están fuera de plazo (no devueltos) mostrando el libro y el lector responsable, para gestión operativa.

### Historia de Usuario
```
Como: Bibliotecario
Quiero: Consultar los libros fuera de plazo junto al lector responsable
Para: Gestionar deudas atrasadas y seguimiento
```

#### Criterios de Aceptación
```gherkin
Scenario: Consultar préstamos vencidos
  Given existen préstamos fuera de plazo
  When el bibliotecario consulta préstamos vencidos
  Then el sistema lista solo los préstamos atrasados
  And muestra lector responsable, fecha límite y fecha de devolución (null)
```

### Reglas de Negocio
- Excluir préstamos con `state=RETURNED`.
- Considerar vencidos los registros cuya `date_limit < today` y `state=ON_LOAN`.
- La salida mínima debe incluir también el estado operativo del libro.
- Esta consulta no incluye filtros avanzados, ordenamiento configurable ni paginación en el MVP.

---

## 2. DISEÑO

### Endpoint
GET /api/v1/loans/outTime
- Auth: sí
- Response 200: list of `{ loan_id, id_book, title, state, id_reader, name_reader, date_limit, date_return }`

### Frontend
- Page: `OverduePage` (`/loans/outTime`) con tabla simple.
- Hook: `useLoan.getOverdue()` → `GET /api/v1/loans/outTime`.

---

## 3. LISTA DE TAREAS

### Backend
- [ ] Implementar query `LoanRepository.find_overdue()` eficiente con índice por `date_limit` y `state`.
- [ ] Tests: list returns only overdue, empty result case.

### Frontend
- [ ] `OverduePage` + table and empty state.

### QA
- [ ] Fixtures: varios préstamos, algunos vencidos y algunos no.
- [ ] Verificar que solo aparezcan vencidos y que la salida incluya libro, lector responsable y estado operativo.
