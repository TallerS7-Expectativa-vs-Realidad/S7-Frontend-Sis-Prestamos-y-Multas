---
applyTo: "backend/tests/**,frontend/src/__tests__/**"
---

> **Scope**: Adaptado a proyectos con backend en Node.js (Express) y frontend en React (Vite). Usa Jest/Vitest y Supertest para backend, y Vitest + Testing Library para frontend.

# Instrucciones para Archivos de Pruebas Unitarias

## Principios

- **Independencia**: cada test es 100% independiente — sin estado compartido.
- **Aislamiento**: mockear SIEMPRE dependencias externas (DB, servicios externos).
- **Claridad**: nombre del test debe describir la función bajo prueba y el escenario.
- **Cobertura**: objetivo razonable ≥ 80% en lógica de negocio.

## Backend (Jest + Supertest)

### Estructura de archivos
```
backend/tests/
  unit/
    services/
    repositories/
  integration/
    routes/
```

### Convenciones
- Usar `jest.fn()` o bibliotecas de mocking (vi.mock en Vitest) para aislar dependencias.
- Para tests de endpoints usar `supertest` contra una instancia de Express montada en memoria.

```js
// Ejemplo mínimo con Supertest
const request = require('supertest');
const { app } = require('../../src/app');

test('GET /api/v1/health returns 200', async () => {
  const res = await request(app).get('/api/v1/health');
  expect(res.status).toBe(200);
});
```

## Frontend (Vitest + Testing Library)

### Estructura de archivos
```
frontend/src/__tests__/
  components/
  hooks/
  pages/
```

### Convenciones
- Usar `vi.mock()` para mockear módulos externos.
- Renderizar componentes con `@testing-library/react`.

```jsx
import { render, screen } from '@testing-library/react';
import LoginPage from '../../pages/LoginPage';

test('renders email input', () => {
  render(<LoginPage />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
});
```

## Nunca hacer

- Tests que dependan del orden de ejecución.
- Llamadas reales a bases de datos o APIs externas (usar mocks/stubs).
- `console.log` permanentes en tests.
- Lógica condicional dentro de un test (if/else).
- Usar `sleep` para sincronización temporal (cero tests "flaky").

