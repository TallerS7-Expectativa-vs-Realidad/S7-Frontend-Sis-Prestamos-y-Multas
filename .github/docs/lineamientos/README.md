# ASDD - Agent Spec-Driven Development

Resumen operativo del framework ASDD mantenido en este repositorio para GitHub Copilot.

```
Requerimiento -> Spec -> [Backend | Frontend | DB] -> [Tests] -> QA -> Docs
```

## Entorno objetivo

- Plataforma principal: GitHub Copilot en VS Code.
- Archivo global siempre activo: `.github/copilot-instructions.md`.
- Agentes: `.github/agents/`.
- Skills: `.github/skills/`.
- Instructions por scope: `.github/instructions/`.

## Regla base

Ningun agente implementa codigo si la spec no tiene `status: APPROVED`.

## Flujo minimo

1. Crear o revisar requerimiento en `.github/requirements/`.
2. Generar spec en `.github/specs/`.
3. Aprobar la spec manualmente.
4. Implementar backend, frontend y datos segun aplique.
5. Generar tests.
6. Ejecutar QA.
7. Documentar si hubo cambios de arquitectura, endpoints o flujo.

## Skills disponibles

| Skill | Proposito |
|---|---|
| `/asdd-orchestrate` | Coordina el flujo completo |
| `/generate-spec` | Genera specs tecnicas |
| `/implement-backend` | Implementa backend |
| `/implement-frontend` | Implementa frontend |
| `/unit-testing` | Genera tests |
| `/gherkin-case-generator` | Genera escenarios QA |
| `/risk-identifier` | Clasifica riesgos |
| `/automation-flow-proposer` | Prioriza automatizacion |
| `/performance-analyzer` | Planifica performance |

## Agentes disponibles

| Agente | Responsabilidad |
|---|---|
| `Orchestrator` | Coordina fases y bloqueos |
| `Spec Generator` | Produce specs desde requerimientos |
| `Backend Developer` | Implementa backend en capas |
| `Frontend Developer` | Implementa frontend React/Vite |
| `Database Agent` | Diseña persistencia Postgres |
| `Test Engineer Backend` | Genera pruebas backend |
| `Test Engineer Frontend` | Genera pruebas frontend |
| `QA Agent` | Produce artefactos QA |
| `Documentation Agent` | Actualiza README y docs |

## Artefactos obligatorios

- `.github/AGENTS.md`
- `.github/copilot-instructions.md`
- `.github/instructions/backend.instructions.md`
- `.github/instructions/frontend.instructions.md`
- `.github/instructions/tests.instructions.md`

## Nota de mantenimiento

Si cambian el stack, el dominio o la estructura del repo, actualicen primero `README.md`, `.github/copilot-instructions.md` y luego agentes/prompts/skills. Si cambian solo uno, el framework empieza a alucinar con seguridad admirable y utilidad nula.
