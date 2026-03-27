# HU-03 - Gherkin QA

## Fuente de verdad
- Spec: `.github/specs/hu-03-registrar-devolucion-en-plazo.spec.md`
- Historia: `USER_STORIES.md`
- Subtareas QA: `SUBTASKS.md`
- Implementación observada: `PATCH /api/v1/loans` con alias de compatibilidad en `/api/v1/loan`

## Feature
```gherkin
#language: es
Característica: Registrar devolución de un libro dentro del plazo
  Como bibliotecario
  Quiero registrar una devolución en o antes de la fecha límite
  Para cerrar el préstamo sin generar deuda y dejar el libro disponible

  @happy-path @critico
  Scenario: Registrar devolución antes de la fecha límite
    Given existe un préstamo activo
    And la devolución ocurre antes de la fecha límite
    When el bibliotecario registra la devolución
    Then el sistema cierra el préstamo con estado RETURNED
    And informa la fecha de devolución
    And no genera deuda nueva

  @smoke @critico @edge-case
  Scenario: Registrar devolución el mismo día de la fecha límite
    Given existe un préstamo activo
    And la devolución ocurre el mismo día de la fecha límite
    When el bibliotecario registra la devolución
    Then el sistema cierra el préstamo con estado RETURNED
    And informa la fecha de devolución
    And no genera deuda nueva
    And el libro queda disponible

  @error-path
  Scenario: Intentar devolver un libro sin préstamo activo
    Given que no existe un préstamo activo para el libro o lector consultado
    When el bibliotecario registra la devolución
    Then el sistema responde 404
    And no modifica el historial de préstamos
    And no genera deuda nueva

  @error-path
  Scenario: Intentar devolver nuevamente un préstamo ya cerrado
    Given que el préstamo ya fue devuelto
    And el historial muestra el último estado como RETURNED
    When el bibliotecario intenta registrar otra devolución
    Then el sistema rechaza la operación
    And no modifica el historial de préstamos
    And no genera deuda nueva
```

## Datos de prueba

| Escenario | Campo | Válido | Inválido | Borde |
| --- | --- | --- | --- | --- |
| Devolución antes de fecha límite | `date_return` | `2026-04-08` | `2026-04-11` para HU-03 | `2026-04-09` |
| Devolución en fecha exacta | `date_return` | `2026-04-10` | `2026-04-11` para HU-03 | `2026-04-10` |
| Sin préstamo activo | `id_book/id_reader` | Identificador sin fila `ON_LOAN` | N/A | N/A |
| Devolución duplicada | Estado previo | `RETURNED` ya persistido | N/A | N/A |

## Evidencia esperada
- `loan_books` actualizado a `RETURNED` solo en los casos válidos.
- `date_return` informado solo en los casos válidos.
- Sin nuevas filas en `debt_reader` para devoluciones en plazo.
- El borde de fecha exacta debe ejecutarse como smoke obligatorio.

## Hallazgos potenciales a vigilar
- La devolución duplicada debe responder `409 ALREADY_RETURNED` cuando exista historial y el último estado observado sea `RETURNED`.
- La evidencia de ausencia de deuda debe validarse sobre `debt_reader` y los campos canónicos `state_debt` y `amount_debt`.