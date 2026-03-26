---
id: SPEC-004
status: APPROVED
feature: hu-04-registrar-devolucion-tardia-generar-multa
created: 2026-03-24
updated: 2026-05-15
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
PATCH /api/v1/loan (mismo que HU-03)

**Payload (desde frontend):**
```json
{
  "id_book": "BOOK001",
  "title": "Harry Potter",
  "date_return": "2026-05-14",
  "type_id_reader": "CI",
  "id_reader": "123456",
  "name_reader": "Juan Pérez",
  "base_fib_amount": 2.00
}
```

- Si se detecta mora, además de actualizar `loan_books`, insertar `debt_reader`.
- `base_fib_amount`: Valor en USD por unidad Fibonacci (enviado por frontend, opcional).
- Si el frontend no envía `base_fib_amount`, el backend usa el valor por defecto (2.00 USD).
- Responses: 200 (RETURNED + deuda creada si es tardía), 400, 404, 409.

### Frontend
- `ReturnForm` mostrará detalle de la deuda calculada si aplica y confirmación.

---

## 3. LISTA DE TAREAS

### Backend
- [x] Implementar función `calculateFibUnits(days_late, baseFibAmount)` con validaciones.
  - ✅ Función actualizada para aceptar `baseFibAmount` como parámetro
  - ✅ Usa valor por defecto (2.00 USD) si no se proporciona desde frontend
  - ✅ Cálculo acumulativo semana por semana
  - ✅ Retorna `{ units_fib, amount_dept }` correctamente formateado
- [x] Al procesar devolución tardía, crear `debt_reader` persistiendo datos de mora.
  - ✅ Esquema de validación `returnLoanSchema` actualizado para aceptar `base_fib_amount`
  - ✅ `LoanService.returnLoan()` extrae y pasa `base_fib_amount` a `calculateFibUnits`
  - ✅ Deuda creada con `units_fib` y `amount_dept` correctos
  - ✅ Estado de deuda: `PENDING`
  - ✅ Trazabilidad: `loan_id, id_reader, name_reader` registerados
- [x] Documentación y especificación de cálculo Fibonacci acumulativo.
  - ✅ Spec actualizada con fórmula acumulativa explícita
  - ✅ Tabla de referencia con ejemplos (1-42 días)
  - ✅ Notas en código sobre cálculo semana por semana
  - ✅ Endpoint documentado con payload incluyendo `base_fib_amount` opcional

### Frontend
- [x] Mostrar resumen de multa al registrar devolución tardía.
  - ✅ Componente `DebtSummary` creado con detalles de multa, semanas y monto
  - ✅ `ReturnForm` actualizado para mostrar DebtSummary cuando hay mora
  - ✅ Normalización de respuesta backend en `loanService.returnLoan()`
- [x] Confirmaciones y mensajes claros para el bibliotecario.
  - ✅ Mensaje de éxito con ID de préstamo
  - ✅ Información sobre multa cuando aplica
  - ✅ Mensaje cuando NO hay multa (devolución a tiempo)
  - ✅ Advertencia sobre limitación de préstamos por deuda pendiente
- [x] Input para `base_fib_amount` en ReturnForm
  - ✅ Campo con validación flexible (vacío permitido, sin autocorrección)
  - ✅ Se envía al backend en payload junto a otros datos

### QA
- [ ] Tests unitarios: cálculo Fibonacci acumulativo con diferentes valores de base_fib_amount.
- [ ] Tests de integración: flujo completo de devolución tardía y creación de deuda.
- [ ] Validar con ejemplos del PRD: 1, 7, 8, 15, 22 días y cases de usuario.
- [ ] Verificar trazabilidad en `loan_books` y `debt_reader`.
