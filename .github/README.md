# ASDD Framework - Guia de uso con GitHub Copilot

ASDD organiza el trabajo del proyecto en cinco fases coordinadas por agentes especializados.

```
Requerimiento -> Spec -> [Backend | Frontend | DB] -> [Tests BE | Tests FE] -> QA -> Doc
```

## Requisitos minimos

| Requisito | Detalle |
|---|---|
| VS Code | Version reciente |
| GitHub Copilot Chat | Extension activa |
| Setting habilitado | `github.copilot.chat.codeGeneration.useInstructionFiles: true` |

## Archivos base del framework

Antes de usar cualquier agente, estos archivos deben existir y ser coherentes:

| Archivo | Rol |
|---|---|
| `README.md` | Stack real, arquitectura, comandos y variables de entorno |
| `.github/copilot-instructions.md` | Reglas globales del proyecto, dominio, DoR y DoD |
| `.github/AGENTS.md` | Reglas compartidas del ecosistema de agentes |
| `.github/instructions/*.instructions.md` | Reglas por scope: backend, frontend, tests |

## Flujo recomendado

### 1. Generar spec

```
@Spec Generator genera la spec para: [requerimiento]
```

o

```
/generate-spec <nombre-feature>
```

La salida siempre va a `.github/specs/<feature>.spec.md` con `status: DRAFT`.

### 2. Aprobar spec

El equipo revisa la spec y cambia `status: DRAFT` a `status: APPROVED`.

### 3. Implementar

```
@Backend Developer implementa .github/specs/<feature>.spec.md
@Frontend Developer implementa .github/specs/<feature>.spec.md
@Database Agent diseña persistencia para .github/specs/<feature>.spec.md
```

`Database Agent` solo se usa si la spec requiere cambios de datos.

### 4. Generar tests

```
@Test Engineer Backend genera tests para .github/specs/<feature>.spec.md
@Test Engineer Frontend genera tests para .github/specs/<feature>.spec.md
```

o

```
/unit-testing <nombre-feature>
```

### 5. Ejecutar QA

```
@QA Agent ejecuta QA para .github/specs/<feature>.spec.md
```

Genera Gherkin, matriz de riesgos y, si aplica, performance y automatizacion.

### 6. Documentar

```
@Documentation Agent documenta el feature .github/specs/<feature>.spec.md
```

## Orquestacion completa

```
@Orchestrator ejecuta el flujo completo para: [requerimiento]
```

o

```
/asdd-orchestrate <nombre-feature>
```

## Modelos recomendados para este framework

Los agentes quedaron configurados con prioridad y fallback:

1. `GPT-5.4 (copilot)` para orquestacion, especificacion, implementacion y QA.
2. `Claude Sonnet 4.5 (copilot)` como respaldo de alta capacidad.
3. `GPT-5 mini (copilot)` como fallback liviano.

Esto evita amarrar el framework a un unico modelo y deja mejores defaults para cuentas con acceso completo.

## Agentes disponibles

| Agente | Rol |
|---|---|
| `@Orchestrator` | Coordina el flujo ASDD completo |
| `@Spec Generator` | Genera y valida specs |
| `@Backend Developer` | Implementa backend en capas |
| `@Frontend Developer` | Implementa frontend React/Vite |
| `@Database Agent` | Diseña persistencia Postgres y migraciones |
| `@Test Engineer Backend` | Genera tests backend |
| `@Test Engineer Frontend` | Genera tests frontend |
| `@QA Agent` | Produce artefactos QA |
| `@Documentation Agent` | Mantiene README, docs API y ADRs |

## Skills disponibles

| Skill | Uso |
|---|---|
| `/asdd-orchestrate` | Orquesta el flujo o muestra estado |
| `/generate-spec` | Genera spec tecnica |
| `/implement-backend` | Implementa backend desde spec aprobada |
| `/implement-frontend` | Implementa frontend desde spec aprobada |
| `/unit-testing` | Genera tests backend y frontend |
| `/gherkin-case-generator` | Genera escenarios Given-When-Then |
| `/risk-identifier` | Genera matriz de riesgos ASD |
| `/automation-flow-proposer` | Prioriza automatizacion por ROI |
| `/performance-analyzer` | Planifica pruebas de performance |

## Prompts disponibles

| Prompt | Uso |
|---|---|
| `/full-flow` | Orquestacion completa |
| `/generate-spec` | Crear spec nueva |
| `/backend-task` | Implementar backend |
| `/frontend-task` | Implementar frontend |
| `/db-task` | Diseñar persistencia y migraciones |
| `/generate-tests` | Generar tests |
| `/qa-task` | Ejecutar QA |
| `/doc-task` | Generar documentacion tecnica |

## Instrucciones automaticas

| Archivo activo | Instructions aplicadas |
|---|---|
| `backend/**` | `.github/instructions/backend.instructions.md` |
| `frontend/src/**/*.{js,jsx,ts,tsx}` | `.github/instructions/frontend.instructions.md` |
| `backend/tests/**`, `frontend/src/__tests__/**` | `.github/instructions/tests.instructions.md` |

## Estructura relevante

```
.github/
    README.md
    AGENTS.md
    copilot-instructions.md
    agents/
    instructions/
    prompts/
    requirements/
    skills/
    specs/
docs/output/
    qa/
    api/
    adr/
```

## Regla no negociable

No generar codigo sin spec aprobada y no esconder inconsistencias documentales. Si el framework detecta una contradiccion entre specs, README o decisiones del sprint, debe reportarla.
