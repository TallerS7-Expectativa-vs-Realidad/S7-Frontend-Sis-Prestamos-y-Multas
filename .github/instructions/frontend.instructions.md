---
applyTo: "frontend/src/**/*.{js,jsx,ts,tsx}"
---

> **Scope**: Se aplica a proyectos con capa frontend en React + Vite.

# Instrucciones para Archivos de Frontend (React/Vite)

## Convenciones Obligatorias

- **CSS**: SIEMPRE usar CSS Modules (`*.module.css`) — NUNCA clases CSS globales ni frameworks como Tailwind/Bootstrap.
- **Nombres**: PascalCase para componentes y páginas (`.jsx`), camelCase para hooks (`.js`) y servicios (`.js`).
- **Auth state**: SIEMPRE consumir de `useAuth` — nunca crear estado de autenticación paralelo.
- **Env vars**: SIEMPRE con prefijo `VITE_` para que Vite las exponga.

## Estructura de Archivos

```
src/
  services/            ← llamadas HTTP (usar axios)
  hooks/               ← hooks reutilizables (useAuth, useFetch)
  components/          ← componentes UI (uno por archivo)
  pages/               ← páginas registrar rutas en App.jsx
```

## Llamadas a la API Backend

Usar siempre **Axios** o el cliente HTTP acordado. Las llamadas van en `services/`, nunca directamente en componentes.

```js
// services/featureService.js
import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_URL;

export async function getFeatures(token) {
  const res = await axios.get(`${API_BASE}/api/v1/features`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
```

El token se obtiene desde el provedor de auth del proyecto (`useAuth()` o similar).

## Rutas (React Router v6)

Registrar rutas en `src/App.jsx` o el punto de entrada:

```jsx
<Route path="/nueva-ruta" element={<ProtectedRoute><NuevaPagina /></ProtectedRoute>} />
```

## Componentes

- Un componente por archivo.
- Props tipadas con JSDoc o TypeScript cuando sean complejas.
- No lógica de negocio en los componentes — delegar a hooks o services.

## Nunca hacer

- Hardcodear URL del API en componentes.
- Llamadas HTTP directamente desde componentes sin usar `services/`.
- Mantener múltiples fuentes de verdad para auth.
