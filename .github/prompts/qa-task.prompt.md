---
description: 'Ejecuta el QA Agent con los 8 skills secuenciales para generar el plan de calidad completo basado en la spec aprobada.'
agent: QA Agent
---

Ejecuta el QA Agent completo con los skills realmente disponibles en este framework.

**Feature**: ${input:featureName:nombre del feature en kebab-case}

**Instrucciones para @QA Agent:**

1. Lee `.github/docs/lineamientos/qa-guidelines.md` como primer paso
2. Lee `.github/copilot-instructions.md` y la spec en `.github/specs/${input:featureName}.spec.md`
3. Ejecuta en este orden:
   - `/gherkin-case-generator` -> `docs/output/qa/${input:featureName}-gherkin.md`
   - `/risk-identifier` -> `docs/output/qa/risk-matrix.md`
   - `/performance-analyzer` solo si la spec define SLAs
   - `/automation-flow-proposer` solo si el usuario lo solicita
4. Genera reporte consolidado al finalizar

**Prerequisito:** Debe existir `.github/specs/${input:featureName}.spec.md` con estado APPROVED. Si no, ejecutar `/generate-spec` primero.
