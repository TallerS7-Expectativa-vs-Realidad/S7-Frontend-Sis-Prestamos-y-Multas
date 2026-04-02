---
name: unit-testing
description: Genera tests unitarios e integración para backend y/o frontend. Lee la spec y el código implementado. Requiere spec APPROVED e implementación completa.
argument-hint: "<nombre-feature> [backend|frontend|ambos]"
---

# Unit Testing

## Definition of Done — verificar al completar

- [ ] Cobertura ≥ 80% en lógica de negocio (quality gate bloqueante)
- [ ] Tests aislados — sin conexión a DB real (usar mocks o test db ephemeral)
- [ ] Escenario feliz + errores de negocio + validaciones de entrada cubiertos
- [ ] Los cambios no rompen contratos existentes del módulo

## Prerequisito — Lee en paralelo

```
.github/specs/<feature>.spec.md        (criterios de aceptación)
código implementado en backend/ y/o frontend/
.github/instructions/backend.instructions.md   (node, express, pg)
.github/instructions/tests.instructions.md     (Jest/Supertest, Vitest)
```

## Output por scope

### Backend → `backend/tests/`

| Archivo | Cubre |
|---------|-------|
| `routes/<feature>.test.js` | Endpoints: 200/201, 400, 401, 404, 422 (Supertest)
| `services/<feature>.test.js` | Lógica: happy path + errores de negocio (Jest)
| `repositories/<feature>.test.js` | Queries: parámetros y retornos correctos (mocks o test DB)

### Frontend → `frontend/src/__tests__/`

| Archivo | Cubre |
|---------|-------|
| `components/<Feature>.test.jsx` | Render + interacciones (click, submit)
| `hooks/use<Feature>.test.js` | Estado inicial + respuesta API + error handling (Vitest)
| `pages/<Feature>Page.test.jsx` | Render completo con providers

## Patrones core

```js
// Backend — Jest + Async mocks
test('create success', async () => {
  const repo = { insert: jest.fn().mockResolvedValue({ id: '1' }) };
  const svc = new FeatureService(repo);
  const result = await svc.create({ name: 'x' });
  expect(result.id).toBe('1');
});
```

```js
// Frontend — Vitest + renderHook
vi.mock('../../services/featureService');
getFeatures.mockResolvedValue([{ id: '1' }]);
const { result } = renderHook(() => useFeature());
await waitFor(() => expect(result.current.data).toHaveLength(1));
```

## Restricciones

- Solo `tests/` o `__tests__/`. No modificar código fuente salvo fixtures de prueba.
- Nunca conectar a DB de producción — usar mocks o instances de test.
- Cobertura mínima ≥ 80% en lógica de negocio.
