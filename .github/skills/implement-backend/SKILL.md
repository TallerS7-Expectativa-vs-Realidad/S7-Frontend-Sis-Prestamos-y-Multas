---
name: implement-backend
description: Implementa un feature completo en el backend. Requiere spec con status APPROVED en .github/specs/.
argument-hint: "<nombre-feature>"
---

# Implement Backend

## Prerequisitos
1. Leer spec: `.github/specs/<feature>.spec.md` — sección 2 (modelos, endpoints)
2. Leer stack: `.github/instructions/backend.instructions.md`
3. Leer arquitectura: `.github/instructions/backend.instructions.md`

## Orden de implementación
```
models/types → repositories → services → controllers/routes → registrar en punto de entrada
```

| Capa | Responsabilidad |
|------|-----------------|
| **Models / Types** | DTOs y validaciones (Zod/Joi o TypeScript types) |
| **Repositories** | Acceso a DB — queries CRUD con `pg` o query builder |
| **Services** | Lógica de negocio pura — orquesta repositorios |
| **Controllers / Routes** | Parsing HTTP + DI + delegar al service |

## Patrón de DI (recomendado en routes)
- Construir routers mediante factories que reciben servicios/repositories como dependencias.

## Reglas
- Seguir `.github/instructions/backend.instructions.md` para wiring, env vars (`dotenv`) y manejo de errores.

## Restricciones
- Solo directorio de backend del proyecto. No tocar frontend.
- No generar tests (responsabilidad de `test-engineer-backend`), salvo mocks de ejemplo si se solicitan.
