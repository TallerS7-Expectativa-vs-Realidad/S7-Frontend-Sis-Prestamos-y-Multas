# Frontend - Sistema de Préstamos y Multas

🏗️ **Este es un repositorio de servicios independientes dentro de la arquitectura modular del proyecto.**

Otros repositorios correlacionados:
- [**Backend**](../S7-Backend-Sis-Prestamos-y-Multas/) - Node.js + Express + PostgreSQL
- [**Arquitectura & Documentación**](../S7-Arquitectura/) - Specs, PRD, Test Plans

---

## 📋 Descripción

Aplicación web para gestionar préstamos de libros y pagos de multas. Interfaz moderna y responsiva construida con **React 18**, **Vite** y **CSS Modules**.

**Funcionalidades principales:**
- Búsqueda de disponibilidad de libros
- Registro de nuevos préstamos
- Registro de devoluciones (a tiempo o tardía)
- Visualización de préstamos vencidos
- Gestión de pagos de deudas
- Cálculo automático de multas con serie de Fibonacci

---

## 🏛️ Arquitectura

### Patrón de Flujo

```
pages → components → hooks → services → API Backend
```

### Estructura de Directorios

```
S7-Frontend-Sis-Prestamos-y-Multas/
├── src/
│   ├── main.jsx                    # Entry point de React
│   ├── App.jsx                     # Enrutamiento principal
│   ├── App.module.css              # Estilos globales
│   ├── index.css                   # Normalize/base styles
│   ├── pages/                      # Páginas (rutas)
│   │   ├── LoanSearchPage.jsx      # HU-01: Búsqueda de disponibilidad
│   │   ├── LoanPage.jsx            # HU-02: Registrar préstamo
│   │   ├── ReturnPage.jsx          # HU-03/04: Registrar devolución
│   │   ├── OverduePage.jsx         # HU-05: Préstamos vencidos
│   │   ├── DebtPaymentPage.jsx     # HU-06: Pago de deuda
│   │   ├── LoanCombinedPage.jsx    # Vista combinada (experimental)
│   │   └── NotImplementedPage.jsx  # Placeholder
│   ├── components/                 # Componentes reutilizables
│   │   ├── Navigation.jsx          # Navbar con enlaces
│   │   ├── LoanSearch.jsx          # Búsqueda de libro (HU-01)
│   │   ├── LoanForm.jsx            # Formulario préstamo (HU-02)
│   │   ├── ReturnForm.jsx          # Formulario devolución (HU-03/04)
│   │   ├── OverdueLoansTable.jsx   # Tabla de préstamos vencidos (HU-05)
│   │   ├── DebtSummary.jsx         # Resumen de deudas
│   │   ├── DebtPaymentForm.jsx     # Formulario pago (HU-06)
│   │   └── *.module.css            # Estilos scoped (CSS Modules)
│   ├── hooks/                      # Custom hooks (futuro)
│   ├── services/                   # Llamadas HTTP a backend
│   │   ├── loanService.js          # API: GET/POST/PATCH /loans
│   │   └── debtService.js          # API: GET/POST /debt
│   └── __tests__/                  # Tests con Vitest + Testing Library
│       ├── setup.js                # Configuración de tests
│       ├── components/
│       ├── hooks/
│       └── pages/
├── vite.config.js                  # Configuración Vite
├── Dockerfile                      # Multi-stage build
├── .dockerignore
├── package.json
└── index.html
```

---

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** 18+ o **Docker**
- **npm** o **yarn**
- Backend API corriendo en `http://localhost:3000` (por defecto)

### Opción A: Con Docker (Recomendado)

#### Paso 1: Construir la imagen

```bash
cd S7-Frontend-Sis-Prestamos-y-Multas
docker build -t frontend-s7 .
```

#### Paso 2: Ejecutar el contenedor

```bash
docker run -d --name frontend-s7 -p 8080:80 frontend-s7
```

Accede en: **http://localhost:8080**

### Opción B: Local (desarrollo)

#### 1. Instalar dependencias

```bash
cd S7-Frontend-Sis-Prestamos-y-Multas
npm install
```

#### 2. Configurar variables de entorno

```bash
# Crear archivo (opcional, usa defaults)
cat > .env.local << EOF
VITE_API_URL=http://localhost:3000
EOF
```

#### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

Accede en: `http://localhost:5173` (o puerto mostrado en consola)

---

## 🧩 Componentes Principales

### Páginas

| Ruta | Componente | Propósito | Estado |
|------|-----------|----------|--------|
| `/` | `LoanSearchPage` | Buscar disponibilidad | HU-01 ✅ |
| `/loan` | `LoanPage` | Registrar préstamo | HU-02 ✅ |
| `/return` | `ReturnPage` | Registrar devolución | HU-03, HU-04 ✅ |
| `/overdue` | `OverduePage` | Ver préstamos vencidos | HU-05 ✅ |
| `/debt-payment` | `DebtPaymentPage` | Pagar deuda | HU-06 ✅ |

### Componentes Reutilizables

#### `LoanSearch`
Búsqueda de disponibilidad de libro (case-insensitive)
- Props: `onSearch(title)`, `onResult(data)`
- Estado: disponible/no disponible

#### `LoanForm`
Formulario para registrar nuevo préstamo
- Valida: `id_book`, `title`, `id_reader`, `name_reader`, `loan_days` (7|14|21)
- Maneja: errores de libro no disponible / lector con deuda

#### `ReturnForm`
Formulario para registrar devolución
- Captura: `date_return`, `id_reader`
- Calcula automáticamente: multa por retraso (si aplica)

#### `OverdueLoansTable`
Tabla de préstamos vencidos
- Muestra: `book`, `reader`, `date_limit`, `days_overdue`, `debt`

#### `DebtSummary`
Resumen de deuda del lector
- Muestra: `state_debt`, `amount_debt`, botón de pago

#### `DebtPaymentForm`
Formulario para registrar pago
- Valida que haya deuda pendiente
- Rehabilita al lector tras pago exitoso

---

## 📡 Integración con Backend

### Services

#### `loanService.js`
```javascript
// Búsqueda de disponibilidad
searchByName(bookName)          // GET /api/v1/loans/{name}

// Registrar préstamo
createLoan(loanData)            // POST /api/v1/loans

// Registrar devolución
processReturn(returnData)       // PATCH /api/v1/loans

// Listar vencidos
getOverdueLoans()               // GET /api/v1/loans/overdue
```

#### `debtService.js`
```javascript
// Obtener deuda de lector
getDebtByReader(id_reader)      // GET /api/v1/debt/{id_reader}

// Registrar pago
payDebt(paymentData)            // POST /api/v1/debt/pay
```

### Variables de Entorno

```env
# URL del backend (por defecto: http://localhost:3000)
VITE_API_URL=http://localhost:3000
```

**Nota:** Se accede vía `import.meta.env.VITE_API_URL` en componentes.

---

## 🎨 Estilos

### Sistema de Estilos

- **CSS Modules**: Scope local por componente
- **Enfoque**: Utilitario + componentes
- **Patrón de nombres:** `ComponentName.module.css`

```css
/* Ejemplo: LoanForm.module.css */
.container { }
.title { }
.input { }
.button { }
.error { }
```

### Convenciones

- Variables de color, spacing y typo centralizadas
- Sin dependencias externas de CSS (solo React + vanilla CSS)
- Responsive-first approach

---

## 🧪 Testing

### Archivos de Test

```
src/__tests__/
├── setup.js                      # Configuración de vitest + DOM
├── components/
│   ├── LoanSearch.test.jsx
│   ├── LoanForm.test.jsx
│   └── ... (otros componentes)
├── hooks/                        # Custom hooks (futuro)
└── pages/                        # Integración
```

### Ejecutar Tests

```bash
# Tests una sola vez
npm test

# Watch mode
npm test:watch

# Con cobertura
npm run test:coverage
```

### Stack de Testing

- **Framework**: Vitest (compatible con Jest)
- **DOM**: jsdom
- **Utilidades**: React Testing Library
- **Aserciones**: Expect (jest-dom)

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia Vite dev server (http://localhost:5173)

# Producción
npm run build            # Compila para producción (carpeta dist/)
npm run preview          # Preview local de build producción

# Testing
npm test                 # Ejecuta tests
npm run test:watch      # Watch mode
npm run test:coverage   # Reporte de cobertura

# Calidad
npm run lint            # ESLint
npm run format          # Prettier
```

---

## 🔄 Flujo de Datos (Ejemplo: HU-01)

```
1. Usuario escribe nombre de libro
                ↓
2. LoanSearchPage → LoanSearch component
                ↓
3. onClick → loanService.searchByName(title)
                ↓
4. GET /api/v1/loans/{title} (Backend)
                ↓
5. Response: { available: true, book: {...} }
                ↓
6. setState + render resultado
```

---

## 📚 Documentación Relacionada

- [**PRD**](../S7-Arquitectura/PRD.md) - Requisitos del producto
- [**Specs ASDD**](../S7-Arquitectura/.github/specs/) - Especificaciones técnicas detalladas
- [**Test Plan**](../S7-Arquitectura/TEST_PLAN.md) - Estrategia de testing
- [**Backend README**](../S7-Backend-Sis-Prestamos-y-Multas/README.md) - Documentación de API
- [**Arquitectura Global**](../S7-Arquitectura/CONTRIBUTING.md) - Guía de contribución

---

## 👥 Equipo y Contacto

Proyecto desarrollado para **Sofka**.

Equipo:
- **QA**: Alexander Molina
- **DEV**: Gabriel Perero

---

## 📄 Licencia

ISC
