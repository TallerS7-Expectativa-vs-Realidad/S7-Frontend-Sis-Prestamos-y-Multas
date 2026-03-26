---
id: SPEC-004
status: APPROVED
feature: hu-04-registrar-devolucion-tardia-generar-multa
created: 2026-03-24
updated: 2026-05-14
author: spec-generator
version: "1.0"
related-specs: [sistema-de-prestamos-y-multas]
---

# Spec: HU-04 - Registrar devolución tardía y generar multa Fibonacci

> **Estado:** `APPROVED`

---

## 1. REQUERIMIENTOS

### Descripción
Registrar la devolución tardía, calcular la multa acumulativa por semanas completas usando la secuencia Fibonacci y dejar trazabilidad en `debt_reader`.

### Historia de Usuario
```
Como: Bibliotecario
Quiero: Registrar la devolución tardía de un libro
Para: Generar la multa acumulada correspondiente y dejar trazabilidad de la deuda del lector
```

#### Criterios de Aceptación
```gherkin
Scenario: Registrar una devolución tardía con multa
  Given existe un préstamo activo vencido
  When el bibliotecario registra la devolución
  Then el sistema cierra el préstamo
  And calcula la multa según la lógica Fibonacci
  And crea un registro en debt_reader con state_debt = PENDING
```

```gherkin
Scenario: Cambio de tramo semanal
  Given la devolución ocurre 8 días después de la fecha límite
  When registrar la devolución
  Then se calcula deuda acumulativa: multa_semana_2 (1×2) + multa_semana_1 (1×2) = 4 USD
```

### Reglas de Negocio
- Calcular `days_late = (date_return - date_limit).days`.
- Si `days_late <= 0` → no multa.
- `weeks = ((days_late - 1) // 7) + 1` para semanas completas.
- Cálculo **acumulativo** semana por semana (cada semana suma su multa al acumulado anterior):
  - Semana 1: `multa = Fibonacci(1) × BASE_FIB_AMOUNT = 1 × 2 = 2 USD`
  - Semana 2: `multa = Fibonacci(2) × BASE_FIB_AMOUNT + acumulado_anterior = 1 × 2 + 2 = 4 USD`
  - Semana 3: `multa = Fibonacci(3) × BASE_FIB_AMOUNT + acumulado_anterior = 2 × 2 + 4 = 8 USD`
  - Semana 4: `multa = Fibonacci(4) × BASE_FIB_AMOUNT + acumulado_anterior = 3 × 2 + 8 = 14 USD`
  - Semana N: `multa = Fibonacci(N) × BASE_FIB_AMOUNT + acumulado_anterior`
  - `units_fib` = suma total de unidades Fibonacci = `(1 + 1 + 2 + 3 + ... + Fibonacci(N))`

**Tabla de referencia (con BASE_FIB_AMOUNT = 2 USD):**
| Rango días | Semanas | Fibonacci | Esta semana | Acumulado anterior | Total USD |
|-----------|---------|-----------|-------------|-------------------|-----------|
| 1-7       | 1       | 1         | 1×2         | 0                 | $2        |
| 8-14      | 2       | 1         | 1×2         | 2                 | $4        |
| 15-21     | 3       | 2         | 2×2         | 4                 | $8        |
| 22-28     | 4       | 3         | 3×2         | 8                 | $14       |
| 29-35     | 5       | 5         | 5×2         | 14                | $24       |
| 36-42     | 6       | 8         | 8×2         | 24                | $40       |

---

## 2. DISEÑO

### Modelos
- `debt_reader`: registrar `loan_id, id_reader, name_reader, amount_debt, state_debt (PENDING)`.

### Endpoint
PATCH /api/v1/loans (mismo que HU-03)
- Si se detecta mora, además de actualizar `loan_books`, insertar `debt_reader`.
- Responses: 200 (RETURNED + deuda creada), 400, 404, 409.

### Frontend
- `ReturnForm` mostrará detalle de la deuda calculada si aplica y confirmación.

---

## 3. LISTA DE TAREAS

### Backend
- [ ] Implementar función `calculate_fib_units(days_late)` con tests unitarios.
- [ ] Al procesar devolución tardía, crear `debt_reader` y persistir `amount_debt` y `state_debt`.
- [ ] Tests: cálculo Fibonacci, creación de deuda, enlace con loan_id.

### Frontend
- [ ] Mostrar resumen de multa al registrar devolución tardía.
- [ ] Confirmaciones y mensajes claros para el bibliotecario.

### QA
- [ ] Validar con ejemplos del PRD: 1,7,8,15,22 días.
- [ ] Verificar trazabilidad en `loan_books` y `debt_reader`.
