# Copilot Instructions

Estas instrucciones aplican a todo el repositorio y son la fuente global de verdad para Copilot en este proyecto.

## Stack oficial del proyecto

- Backend: Node.js + Express
- Frontend: React con Vite
- Base de datos: PostgreSQL
- Acceso a datos: `pg` con queries parametrizadas
- Variables de entorno: `dotenv`
- Cliente HTTP frontend: `axios`
- Routing frontend: `react-router-dom`
- Validacion recomendada: `zod`

## Flujo ASDD obligatorio

1. No implementar nada sin una spec en `.github/specs/` con `status: APPROVED`.
2. La spec es la fuente de verdad para implementacion, tests y QA.
3. Si la spec contradice `README.md`, `PRD.md`, `SPRINT_1.md` o una decision de equipo mas reciente, el agente debe detenerse y señalar la inconsistencia.
4. Si un archivo referenciado por agentes, prompts o skills no existe, el agente debe reportarlo en lugar de inventar contexto.

## Dominio canonico del MVP

- El MVP trabaja con historial de prestamos como fuente de verdad operativa.
- Si un libro no aparece en el historial, se considera disponible para prestamo.
- No afirmar que un libro "no existe en la biblioteca" cuando en realidad no hay historial.
- Estados oficiales de prestamo: `ON_LOAN`, `RETURNED`.
- Estado minimo de deuda: `PENDING`.
- Entidades minimas del MVP: `loan_books`, `debt_reader`.
- Nombres canonicos de campos: `date_limit`, `date_return`, `state`, `state_debt`, `amount_debt`.
- Los nombres legacy `dept_reader`, `state_dept` y `amount_dept` deben tratarse como inconsistencias heredadas. No deben propagarse en codigo, prompts ni nuevas specs.

## Reglas de negocio que no deben alterarse

- `loan_days` validos: `7`, `14`, `21`.
- La disponibilidad del libro se determina por el ultimo estado conocido en historial.
- La devolucion en fecha o antes de `date_limit` no genera deuda.
- La devolucion tardia cierra el prestamo y genera deuda acumulativa por semanas completas usando Fibonacci.
- Casos de referencia obligatorios para mora: `1`, `7`, `8`, `15` y `22` dias con deuda esperada `1`, `1`, `2`, `4` y `7` unidades Fibonacci.

## Arquitectura esperada

### Backend

- Seguir arquitectura en capas: `routes/controllers -> services -> repositories -> db`.
- La logica de negocio vive en `services`.
- El acceso a PostgreSQL vive en `repositories`.
- No acceder a DB directamente desde rutas o controladores.
- Inyectar dependencias en el punto de entrada o mediante factories.

### Frontend

- Seguir el orden: `services -> hooks -> components -> pages -> routes`.
- No hacer llamadas HTTP directamente desde componentes.
- Usar CSS Modules como sistema de estilos por defecto.
- Consumir `VITE_API_URL` desde variables de entorno; no hardcodear URLs.

### Testing

- Backend: Jest + Supertest.
- Frontend: Vitest + Testing Library.
- No usar DB real ni llamadas HTTP reales en tests unitarios.

## Definition of Ready minima para generar specs

- Historia con estructura `Como / Quiero / Para`.
- Criterios de aceptacion en Gherkin para happy path, validaciones y errores.
- Reglas de negocio explicitas.
- Contrato API preliminar si aplica.
- Entidades o artefactos afectados identificados.
- Riesgos y dudas abiertas visibles.

## Definition of Done minima para cerrar un feature

- Implementacion alineada con la spec aprobada.
- Tests relevantes agregados o actualizados.
- Validacion local ejecutada cuando el proyecto ya tenga scripts reales.
- Documentacion actualizada si cambia stack, endpoints, arquitectura o flujo.
- Si hubo una inconsistencia documental, dejarla reportada explicitamente.