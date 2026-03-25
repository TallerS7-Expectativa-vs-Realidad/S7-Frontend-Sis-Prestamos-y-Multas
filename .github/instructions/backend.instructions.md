---
applyTo: "backend/**"
---

> **Scope**: Se aplica a proyectos con capa backend. Esta versión está adaptada al stack Node.js + Express + PostgreSQL.

# Instrucciones para Archivos de Backend (Node.js / Express / PostgreSQL)

## Arquitectura en Capas

Sigue la arquitectura en capas del proyecto:

```
controllers/routes → services → repositories → database (Postgres via `pg`)
```

- **`src/routes/` o `src/controllers/`**: Parseo HTTP, validación de request, instanciación de dependencias (factories) y delegación al service.
- **`src/services/`**: Lógica de negocio pura — orquesta repositorios y reglas de negocio.
- **`src/repositories/`**: Acceso a la base de datos — queries SQL o a través de un query builder (`pg`, `knex`, TypeORM/Objection según el proyecto).
- **`src/models/`**: DTOs, validaciones (Zod/Joi) o tipos/Interfaces (TypeScript).

## Wiring de Dependencias (patrón recomendado en Express)

En Express se recomienda crear factories que inyecten dependencias cuando se construyen routers:

```js
// src/routes/featureRoutes.js
module.exports = function makeFeatureRouter({ featureService }) {
  const router = require('express').Router();
  router.post('/', async (req, res, next) => {
    try {
      const result = await featureService.create(req.body, req.user);
      res.status(201).json(result);
    } catch (err) { next(err); }
  });
  return router;
}
```

Registrar en el punto de entrada montando el router con las dependencias:

```js
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const repo = new FeatureRepository(pool);
const service = new FeatureService(repo);
app.use('/api/v1/features', makeFeatureRouter({ featureService: service }));
```

## Convenciones de Código

- Todas las operaciones a DB deben usar `async/await`.
- Nombres en `camelCase` para JS/TS; `PascalCase` para clases y componentes.
- Variables de entorno vía `dotenv` y prefijadas cuando aplique.
- Manejo de errores centralizado con middleware de Express.

## Nuevas Rutas / Controladores

Para agregar un nuevo endpoint:
1. Crear el router/controller en `src/routes/` o `src/controllers/`.
2. Implementar repositorio en `src/repositories/` que use `pg`/query builder.
3. Implementar servicio en `src/services/` que reciba el repo.
4. Registrar el router en `src/app.js` o `src/index.js` donde se montan rutas.

## Nunca hacer

- Acceder a la base de datos directamente desde controladores sin pasar por repositorios.
- Incluir secrets en el repo — usar `process.env` y `dotenv`.
- Mezclar lógica de negocio en rutas HTTP.

---

> Para estándares de código limpio, SOLID, nombrado, API REST, seguridad y observabilidad, ver `.github/docs/lineamientos/dev-guidelines.md`.
