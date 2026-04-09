# Impacto del Rediseño UX/UI en Tests del Frontend

Este documento registra todos los cambios de la interfaz que **rompen o podrían romper** tests existentes. Cada entrada muestra el **ANTES** y **DESPUÉS** para facilitar el ajuste de tests.

---

## 1. OverdueLoansTable.test.jsx

### 1.1 Columna "Fecha Devolución" eliminada

**Test afectado:**  
`TC-HU05-01 — renders table with expected column headers`

```js
// ANTES — esperaba 6 columnas incluyendo "Fecha Devolución"
expect(screen.getByText(/Fecha Devolución/i)).toBeInTheDocument();

// DESPUÉS — esa columna ya no existe, fue reemplazada por "Días de Atraso"
// FIX: eliminar esa línea y agregar:
expect(screen.getByText(/Días de Atraso/i)).toBeInTheDocument();
```

### 1.2 Header "Lector" → "Lector Responsable"

**Test afectado:**  
`TC-HU05-01 — renders table with expected column headers`

```js
// ANTES
expect(screen.getByText(/Lector/i)).toBeInTheDocument();
// Esto sigue pasando porque /Lector/i matchea "Lector Responsable".
// No requiere cambio, pero si el test era exacto:

// DESPUÉS (si se usa texto exacto)
expect(screen.getByText('Lector Responsable')).toBeInTheDocument();
```

### 1.3 Badge "ON_LOAN" → "Vencido"

**Test afectado:**  
`TC-HU05-01 — displays ON_LOAN state badge for overdue loans`

```js
// ANTES
expect(screen.getByText('ON_LOAN')).toBeInTheDocument();

// DESPUÉS — el badge ahora muestra texto humanizado
expect(screen.getByText('Vencido')).toBeInTheDocument();
```

### 1.4 Conteo total ahora incluye texto envolvente

**Test afectado:**  
`TC-HU05-01 — displays total count of overdue loans`

```js
// ANTES — buscaba "2" como texto exacto aislado
expect(screen.getByText('2')).toBeInTheDocument();

// DESPUÉS — el número está envuelto en <strong> dentro de la frase.
// El getByText('2') sigue funcionando porque <strong>2</strong> renderiza "2" como texto del nodo.
// NO requiere cambio.
```

### 1.5 Días de atraso ahora tiene sufijo "día(s)"

**Posible problema:**  
Si algún test buscara un número exacto en la columna de días, ahora encontrará
`"5 días"` en vez de `"5"`.

```js
// ANTES (hipotético)
expect(screen.getByText('5')).toBeInTheDocument();

// DESPUÉS
expect(screen.getByText(/5 días/)).toBeInTheDocument();
```

### 1.6 Guión para fecha nula: '-' → '—'

**Test afectado:**  
`TC-HU05-01 — displays dash for null date_return values`

```js
// ANTES — buscaba guión corto '-'
const dashes = screen.getAllByText('-');

// DESPUÉS — la columna date_return fue eliminada completamente.
// FIX: eliminar este test ya que la columna ya no existe.
// Si se quiere verificar fecha nula en date_limit, ahora usa '—' (em-dash).
```

---

## 2. DebtSummary.test.jsx

### 2.1 aria-label "Debt summary" vs "Resumen de multa"

**Test afectado:**  
`has accessible region role with label`

```js
// ANTES — el test busca
expect(screen.getByRole('region', { name: /Debt summary/i })).toBeInTheDocument();

// COMPONENTE ACTUAL — aria-label="Resumen de multa"
// NOTA: Esta inconsistencia ya existía ANTES del rediseño.
// FIX:
expect(screen.getByRole('region', { name: /Resumen de multa/i })).toBeInTheDocument();
```

### 2.2 Textos de labels (colons eliminados)

Los labels como `"Días de retraso:"` se cambiaron a `"Días de retraso"` (sin dos puntos).

```js
// ANTES (si algún test buscara con los dos puntos)
expect(screen.getByText(/Días de retraso:/)).toBeInTheDocument();

// DESPUÉS
expect(screen.getByText(/Días de retraso/)).toBeInTheDocument();
// Los tests actuales usan regex sin dos puntos, así que NO se ven afectados.
```

### 2.3 Texto de advertencia simplificado

```js
// ANTES — tenía prefijo "<strong>Importante:</strong>"
// "Importante: Esta multa debe ser pagada..."

// DESPUÉS — sin prefijo "Importante:"
// "Esta multa debe ser pagada..."

// Test actual busca /multa debe ser pagada/i → SIGUE PASANDO, no requiere cambio.
```

---

## 3. OverduePage.test.jsx

### 3.1 Heading h2 → h1

**Impacto:** El test busca `getByText('Préstamos Vencidos')` sin especificar nivel de heading.  
**No requiere cambio** — `getByText` funciona independientemente del elemento HTML.

Si se usara `getByRole('heading', { level: 2 })`, fallaría:

```js
// ANTES
screen.getByRole('heading', { level: 2, name: 'Préstamos Vencidos' });

// DESPUÉS
screen.getByRole('heading', { level: 1, name: 'Préstamos Vencidos' });
```

---

## 4. ReturnForm.test.jsx

### 4.1 Placeholder "El señor de los anillos" vs "Cien años de soledad"

**Test afectado:**  
`renders book fields (id and title)`

```js
// ANTES — el test busca
expect(screen.getByPlaceholderText('Ej: El señor de los anillos')).toBeInTheDocument();

// COMPONENTE ACTUAL — placeholder="Ej: Cien años de soledad"
// NOTA: Esta inconsistencia ya existía ANTES del rediseño.
// FIX:
expect(screen.getByPlaceholderText('Ej: Cien años de soledad')).toBeInTheDocument();
```

### 4.2 Disabled title input

```js
// ANTES — el test busca con placeholder incorrecto
const titleInput = screen.getByPlaceholderText('Ej: El señor de los anillos');

// FIX: usar el placeholder correcto
const titleInput = screen.getByPlaceholderText('Ej: Cien años de soledad');
```

---

## 5. DebtPaymentForm.test.jsx

**Sin cambios que rompan tests.** La estructura JSX del componente no fue modificada — solo se reescribió el CSS. Todos los IDs, roles, textos y aria-labels se preservaron.

---

## 6. LoanForm.test.jsx (problema preexistente)

### 6.1 Select vs RadioGroup para "Plazo del Préstamo"

```js
// ANTES — los tests usan selectOptions y querySelectorAll('option')
await user.selectOptions(screen.getByLabelText(/Plazo del Préstamo/i), '14');
const options = select.querySelectorAll('option');

// COMPONENTE ACTUAL — usa RadioGroup (inputs tipo radio), no <select>
// NOTA: Esta inconsistencia ya existía ANTES del rediseño.
// FIX: cambiar a click en la opción de radio correspondiente
await user.click(screen.getByLabelText('14 días'));
```

---

## 7. LoanSearch.test.jsx

**Sin cambios que rompan tests.** Solo se reemplazaron strings de font-family por variables CSS (`var(--font-body)`, etc.), que no afectan queries de tests.

---

## Resumen de cambios que ROMPEN tests

| Test File | Cantidad de Breaks | Causa |
|---|---|---|
| OverdueLoansTable.test.jsx | **3 directos** | Columna eliminada, badge cambiado, guión cambiado |
| DebtSummary.test.jsx | **1 (preexistente)** | aria-label mismatch |
| ReturnForm.test.jsx | **2 (preexistentes)** | Placeholder mismatch |
| LoanForm.test.jsx | **~3 (preexistentes)** | Select→Radio mismatch |
| OverduePage.test.jsx | 0 | Sin impacto |
| DebtPaymentForm.test.jsx | 0 | Sin impacto (solo CSS) |
| LoanSearch.test.jsx | 0 | Sin impacto (solo CSS) |

> **Nota:** Los marcados como "preexistente" ya fallaban antes del rediseño UX/UI.
