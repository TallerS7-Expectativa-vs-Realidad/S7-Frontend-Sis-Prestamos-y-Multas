# AGENTS.md - ASDD Project

Este archivo define las reglas compartidas para todos los agentes del repositorio.

## Contexto base

- Stack oficial: Node.js + Express + PostgreSQL + React + Vite.
- Fuente global de verdad para stack, dominio, DoR y DoD: `.github/copilot-instructions.md`.
- Lineamientos transversales: `.github/docs/lineamientos/dev-guidelines.md` y `.github/docs/lineamientos/qa-guidelines.md`.

## Flujo ASDD obligatorio

```
[FASE 1 - Secuencial]
spec-generator -> /generate-spec -> .github/specs/<feature>.spec.md

[FASE 2 - Paralelo]
database-agent    -> esquema, migrations, seeders (si aplica)
backend-developer -> backend/src/
frontend-developer-> frontend/src/

[FASE 3 - Paralelo]
test-engineer-backend  -> backend/tests/
test-engineer-frontend -> frontend/src/__tests__/

[FASE 4 - Secuencial]
qa-agent -> docs/output/qa/

[FASE 5 - Opcional]
documentation-agent -> README y docs/output/
```

## Archivos que deben leerse primero

| Documento | Ruta | Quien lo carga |
|---|---|---|
| Reglas globales | `.github/AGENTS.md` | Todos |
| Stack, dominio, DoR, DoD | `.github/copilot-instructions.md` | Todos |
| Lineamientos Dev | `.github/docs/lineamientos/dev-guidelines.md` | Backend Developer, Frontend Developer, Database Agent, Documentation Agent |
| Lineamientos QA | `.github/docs/lineamientos/qa-guidelines.md` | Test Engineer Backend, Test Engineer Frontend, QA Agent |
| Backend scope | `.github/instructions/backend.instructions.md` | Backend Developer, Database Agent, Spec Generator |
| Frontend scope | `.github/instructions/frontend.instructions.md` | Frontend Developer, Spec Generator |
| Testing scope | `.github/instructions/tests.instructions.md` | Test Engineer Backend, Test Engineer Frontend, QA Agent |

## Reglas de oro

1. No hay implementacion sin spec `APPROVED`.
2. No inventar archivos, rutas, librerias ni artefactos que no existan en este repo.
3. Si una spec aprobada contradice una regla de negocio vigente, el agente debe reportarlo explicitamente antes de continuar.
4. Backend siempre en capas; frontend siempre separando services, hooks, components y pages.
5. No propagar nomenclatura legacy contradictoria como `dept_reader`, `state_dept` o `amount_dept` en nuevos artefactos.
6. No exponer secretos ni asumir configuraciones no documentadas.
7. QA y tests deben trabajar sobre comportamiento y riesgos reales del feature, no sobre supuestos del template.

## Entradas y salidas del pipeline

| Tipo | Directorio | Descripcion |
|------|-----------|-------------|
| Requerimientos | `.github/requirements/` | Entrada funcional del feature |
| Specs | `.github/specs/` | Fuente de verdad tecnica |
| Artefactos QA | `docs/output/qa/` | Gherkin, riesgos, performance, automatizacion |

## Criterio de escalamiento

Detenerse y pedir revision humana si ocurre cualquiera de estos casos:

- falta `.github/copilot-instructions.md`, la spec o una instruccion referenciada;
- la spec aprobada usa nombres de dominio inconsistentes con el README o Sprint 1;
- el repo real aun no tiene scaffold backend/frontend y un prompt intenta escribir rutas inexistentes como si ya estuvieran montadas.
