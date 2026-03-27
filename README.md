# Biblioteca: Sistema de Préstamos y Multas

MVP documental para definir cómo una biblioteca controla préstamos de libros, fechas de devolución, multas por retraso y rehabilitación del lector después del pago.

## Equipo

- [Alexander Molina](https://github.com/AlexRieger47) - QA
- [Gabriel Perero](https://github.com/GabrielGNP) - DEV

## Qué problema resuelve

La biblioteca necesita una forma clara y consistente de:

- saber si un libro está disponible o prestado;
- registrar préstamos con fecha de devolución válida;
- detectar devoluciones tardías;
- calcular multas acumulativas por retraso;
- bloquear nuevos préstamos a lectores con deuda pendiente;
- rehabilitar al lector cuando paga la multa completa.

Esta entrega no construye todavía el software. Su objetivo es dejar una base de producto y backlog lista para implementación posterior.

## Qué incluye este repositorio

- Un PRD con visión, reglas del negocio, alcance del MVP y riesgos.
- Historias de usuario con valor de negocio, criterios de aceptación, escenarios Gherkin y Story Points.
- Subtareas DEV y QA por cada historia.
- Trazabilidad documental del flujo principal del MVP.
- Referencia al tablero de GitHub Projects para el backlog del taller.

## Alcance del MVP documental

### Dentro del alcance

- Registrar el préstamo de un libro disponible.
- Permitir solo plazos de 7, 14 o 21 días.
- Calcular automáticamente la fecha de devolución.
- Registrar devoluciones dentro del plazo sin multa.
- Registrar devoluciones tardías con multa acumulativa.
- Aplicar lógica de multa Fibonacci por semanas de mora.
- Consultar préstamos vencidos y lector responsable.
- Registrar el pago total de una multa para rehabilitar al lector.
- Bloquear préstamos a lectores con deuda pendiente.

### Fuera del alcance

- Prórrogas de préstamo.
- Reservas.
- Administración completa del catálogo.
- Membresías o administración de usuarios.
- Notificaciones automáticas.
- Pagos parciales.
- Reportería avanzada.

## Historias del MVP

- HU-01: Consultar estado y disponibilidad de un libro.
- HU-02: Registrar libro disponible a un lector habilitado.
- HU-03: Registrar devolución de un libro dentro del plazo.
- HU-04: Registrar devolución tardía y generar multa Fibonacci.
- HU-05: Consultar libros fuera de plazo y lector responsable.
- HU-06: Registrar el pago total de una multa y rehabilitación del lector.

## Reparto de trabajo DEV y QA

### DEV

- Traducir cada historia a componentes técnicos concretos.
- Definir subtareas de UI, endpoints, persistencia, validaciones y lógica de dominio.
- Aterrizar el comportamiento esperado del sistema en trabajo implementable.

### QA

- Definir criterios de aceptación verificables.
- Redactar escenarios Gherkin centrados en comportamiento de negocio.
- Diseñar validaciones, alternos, bordes, datos de prueba y notas de calidad.

## Documentos principales

- [PRD.md](https://github.com/GabrielGNP/S6-Biblioteca-Sistema-de-Prestamos-y-Multas/blob/main/PRD.md)
- [USER_STORIES.md](https://github.com/GabrielGNP/S6-Biblioteca-Sistema-de-Prestamos-y-Multas/blob/main/USER_STORIES.md)
- [SUBTASKS.md](https://github.com/GabrielGNP/S6-Biblioteca-Sistema-de-Prestamos-y-Multas/blob/main/SUBTASKS.md)

## Tablero de trabajo

- GitHub Projects del repositorio: https://github.com/users/GabrielGNP/projects/8/

## Planificación de Sprints

**Selección Estratégica:**
- Núcleo del negocio (MVP) se vasa en las 6 historias definidas (HU-01 a HU-06). Estas son las historias mínimas necesarias para el funcionamiento del sistema y el cumplimiento de los requerimientos dados

**Duración de cada micro-sprint:** 2 días.

**División de micro-sprints**
- Micro-sprint 1: HU-02, HU-03, HU-04
- Micro-sprint 2: HU-06, HU-01, HU-05

### *Primer Micro-Sprint*
**Registro de Tiempos (Time-Tracking) — plantilla:**

| Tarea | Story Points | Tiempo Real (hrs) | Commits / PR | Notas | Día de Sprint |
|----|--------|--------------:|----------:|-------------------------:|------:|
| Planificación de trabajo | - | 2 | - | incluye: planificación de micro-sprints, dockerización, creación de repositorio, configuración de repositorio, creación de commitlint. | 1
| Ajustes de archivos IA (ASDD) | - | 4 | PR: #89 |  | 1
| HU-02 | 5 | 1 | Commit: 302ab56 |  | 2
| HU-03 | 3 | 1 | Commit: aa3cf10 |  | 2
| HU-04 | 8 | 2 | Commit: a07ab5a |  | 2
| Corrección de errores | - | 3 | Commit: d4afc20 | tiempo excedido por razones externar al trabajo | 3 (sprint excedido)

Instrucciones para rellenar la plantilla:
- `Tarea`: Taréa realizada (una historia de usuario o actividad en concreto del sprint)
- `Story Points`: número ya estimado en las historias.
- `Tiempo Real (hrs)`: tiempo acumulado real
- `Commits / PR`: referencias a commits o enlace al PR que implementó el trabajo.
- `Notas`: impedimentos, retrabajos, y causas de desviación.

**Entrega de Valor — plantilla de evidencia (al cierre de cada micro-sprint):**

- Resumen: 
    - Se ideó una planificación de trabajo para los dos micro-sprints a realizar 
    - Se configuró la base para el trabajo (repositorio, docker, commitlint, CONTRIBUTING.md). 
    - Se ajustaron los documentos para el desarrollo ASDD. 
    - Implementación de las HU-02, HU-03 y HU-04 con metodología ASDD; y se realizaron ajustes y correcciones a los resultados obtenidos de la implementación de las HUs.

- Enlaces: 
    - PR: 
        - [#88 ci(commitlint): evaluador de Conventional Commits](https://github.com/TallerS7-Expectativa-vs-Realidad/S7-Sistema-de-Prestamos-y-Multas/pull/88)
        - [#89 Docs/ai](https://github.com/TallerS7-Expectativa-vs-Realidad/S7-Sistema-de-Prestamos-y-Multas/pull/89)
        - [#90 ai: ajustes de agentes, skills y archivos utilizados para el trabajo con ASDD](https://github.com/TallerS7-Expectativa-vs-Realidad/S7-Sistema-de-Prestamos-y-Multas/pull/90)
        - [#91 docs: ajustes y correcciones de documentación en SUBTASKS, USER_STORIES y PRD](https://github.com/TallerS7-Expectativa-vs-Realidad/S7-Sistema-de-Prestamos-y-Multas/pull/91)
        - [#102 feat: implementaciones de HU-02, HU-03 y HU-04 funcionando](https://github.com/TallerS7-Expectativa-vs-Realidad/S7-Sistema-de-Prestamos-y-Multas/pull/102)
    - Branchs
        - ci/github-actions
        - docs/AI
        - docs/asdd-enhanced
        - docs/MVP_documentation
        - feature/implementations

- Observaciones finales: Este micro-sprint tuvo tiempos de retrasos surgidos por eventos externos al propio desarrollo del proyecto.

### *Segundo Micro-Sprint*
**Registro de Tiempos (Time-Tracking) — plantilla:**

| Tarea | Story Points | Tiempo Real (hrs) | Commits / PR | Notas | Día de Sprint |
|----|--------|--------------:|----------:|-------------------------:|------:|
| Documentación de planificación del Sprints | - | 1 | PR: #103 | - | 1
| Actualización de Dashboard (Project) | - | 2 | - | - | 1
| HU-06 | 3 | 1 | Commit: 8c13dd5 | - | 1
| HU-01 | 3 | 1 | Commit: c88d3a8 | - | 1
| HU-05 | 3 | 1 | Commit: b400427 | - | 1
| Corrección de errores | - | 2 | - | - | 1 y 2
| Solución de conflictos de integración (merges) | - | 4 | - | conflictos de código surgidos en los pull request por el trabajo en paralelo de distintas ramas | 2



Instrucciones para rellenar la plantilla:
- `Tarea`: Taréa realizada (una historia de usuario o actividad en concreto del sprint)
- `Story Points`: número ya estimado en las historias.
- `Tiempo Real (hrs)`: tiempo acumulado real
- `Commits / PR`: referencias a commits o enlace al PR que implementó el trabajo.
- `Notas`: impedimentos, retrabajos, y causas de desviación.

**Entrega de Valor — plantilla de evidencia (al cierre de cada micro-sprint):**


- Resumen: 
    - Se actualizó el dashboard (Project) para que representara el flujo y estado actual de desarrollo.
    - Se creó la documentación con el resumen de los micro-sprints
    - Implementación de las HU-06, HU-01 y HU-05 con metodología ASDD.
    - Se realizó el merge de las ramas de trabajo de los micro sprints (feature/micro-sprint2 y feature/implementations)

- Enlaces: 
    - PR: 
        - [#103 docs(README): planificación de los micro-sprints](https://github.com/TallerS7-Expectativa-vs-Realidad/S7-Sistema-de-Prestamos-y-Multas/pull/103)
        - [#104 feat: implementaciones de HU-06, HU-01 y HU-05 funcionando](https://github.com/TallerS7-Expectativa-vs-Realidad/S7-Sistema-de-Prestamos-y-Multas/pull/104)
    - Branchs
        - docs/MVP_documentations
        - feature/micro-sprint2

- Observaciones finales: 

## Definition of Ready

Una historia se considera lista cuando:

- Tiene valor de negocio claro.
- Sus reglas relacionadas estan identificadas.
- Sus criterios de aceptacion son entendibles y verificables.
- Tiene subtareas DEV y QA coherentes.
- Tiene una estimacion razonable en Story Points.

## Definition of Done

Para esta entrega documental, una historia se considera terminada cuando:

- Queda redactada en USER_STORIES.md.
- Tiene criterios de aceptacion y escenarios Gherkin.
- Tiene subtareas DEV y QA en SUBTASKS.md.
- Su estimacion es coherente con el trabajo descrito.
- Mantiene consistencia con el PRD y con el tablero.