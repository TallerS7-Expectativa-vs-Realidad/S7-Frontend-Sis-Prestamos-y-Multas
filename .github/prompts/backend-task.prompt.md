---
name: backend-task
description: Implementa una funcionalidad en el backend Express basada en una spec ASDD aprobada.
argument-hint: "<nombre-feature> (debe existir .github/specs/<nombre-feature>.spec.md)"
agent: Backend Developer
tools:
  - edit/createFile
  - edit/editFiles
  - read/readFile
  - search/listDirectory
  - search
  - execute/runInTerminal
---

Implementa el backend para el feature especificado, siguiendo la spec aprobada.

**Feature**: ${input:featureName:nombre del feature en kebab-case}

## Pasos obligatorios:

1. **Lee la spec** en `.github/specs/${input:featureName:nombre-feature}.spec.md` — si no existe, detente e informa al usuario.
2. **Revisa el código existente** en `backend/src/` para entender patrones actuales.
3. **Implementa en orden**:
   - `backend/src/models/` — types/validaciones (Zod/TypeScript)
   - `backend/src/repositories/` — repositorio con `pg` o query builder
   - `backend/src/services/` — servicio con lógica de negocio
   - `backend/src/controllers/` / `backend/src/routes/` — router Express
4. **Registra el router** en `backend/src/app.js` o `backend/src/index.js`.
5. **Verifica sintaxis y linter** ejecutando: `cd backend && npm run lint` (si aplica) o `npm test` para correr la suite.

## Restricciones:
- Sigue el patrón de wiring: `pool = new Pool(...)` → `repo = XRepository(pool)` → `service = XService(repo)` en el wiring del punto de entrada.
- NO inyectar conexiones a DB en servicios globalmente; pasarlas por constructor o factory.
- Todas las operaciones de DB deben usar `async`/`await`.
