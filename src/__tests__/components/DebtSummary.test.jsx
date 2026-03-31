/**
 * Unit Tests — DebtSummary component
 * HU-04: Registrar devolución tardía y generar multa Fibonacci
 *
 * Alineado con TEST_CASES.md (Matriz de referencia Fibonacci HU-04):
 *  - TC-HU04-01: 1 día mora → muestra 1 día, 1 semana, 1 unidad, $2.00
 *  - TC-HU04-03: 8 días mora → muestra 8 días, 2 semanas, 2 unidades, $4.00
 *  - TC-HU04-05: 22 días mora → muestra 22 días, 4 semanas, 7 unidades, $14.00
 *  - null debt → no renderiza nada
 *  - Muestra ID de deuda si está presente
 *  - Muestra advertencia sobre limitación de préstamos
 */

import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import DebtSummary from '../../components/DebtSummary.jsx';

describe('DebtSummary — render (HU-04)', () => {
  // ─── null debt → no render ─────────────────────────────────────
  test('renders nothing when debt is null', () => {
    const { container } = render(<DebtSummary debt={null} />);
    expect(container.innerHTML).toBe('');
  });

  test('renders nothing when debt is undefined', () => {
    const { container } = render(<DebtSummary debt={undefined} />);
    expect(container.innerHTML).toBe('');
  });

  // ─── TC-HU04-01: 1 día de mora ────────────────────────────────
  test('TC-HU04-01 — displays correct info for 1 day late (1 week, 1 unit, $2.00)', () => {
    const debt = { days_late: 1, units_fib: 1, amount_debt: 2.00 };
    render(<DebtSummary debt={debt} />);

    expect(screen.getByText(/Resumen de Multa/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1 día/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/1 semana/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/1 unidad/)).toBeInTheDocument();
    expect(screen.getByText(/\$2,00|\$2\.00/)).toBeInTheDocument();
  });

  // ─── TC-HU04-03: 8 días de mora ───────────────────────────────
  test('TC-HU04-03 — displays correct info for 8 days late (2 weeks, 2 units, $4.00)', () => {
    const debt = { days_late: 8, units_fib: 2, amount_debt: 4.00 };
    render(<DebtSummary debt={debt} />);

    expect(screen.getAllByText(/8 días/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/2 semanas/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/2 unidades/)).toBeInTheDocument();
    expect(screen.getByText(/\$4,00|\$4\.00/)).toBeInTheDocument();
  });

  // ─── TC-HU04-05: 22 días de mora ──────────────────────────────
  test('TC-HU04-05 — displays correct info for 22 days late (4 weeks, 7 units, $14.00)', () => {
    const debt = { days_late: 22, units_fib: 7, amount_debt: 14.00 };
    render(<DebtSummary debt={debt} />);

    expect(screen.getAllByText(/22 días/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/4 semanas/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/7 unidades/)).toBeInTheDocument();
    expect(screen.getByText(/\$14,00|\$14\.00/)).toBeInTheDocument();
  });

  // ─── Pluralización correcta para 1 vs múltiples ──────────────
  test('uses singular form for 1 day, 1 week, 1 unit', () => {
    const debt = { days_late: 1, units_fib: 1, amount_debt: 2.00 };
    render(<DebtSummary debt={debt} />);

    // "1 día" (singular), "1 semana" (singular), "1 unidad" (singular)
    expect(screen.getAllByText(/1 día(?!s)/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/1 semana(?!s)/).length).toBeGreaterThanOrEqual(1);
  });

  test('uses plural form for multiple days, weeks, units', () => {
    const debt = { days_late: 8, units_fib: 2, amount_debt: 4.00 };
    render(<DebtSummary debt={debt} />);

    expect(screen.getAllByText(/8 días/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/2 semanas/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/2 unidades/)).toBeInTheDocument();
  });

  // ─── Muestra ID de deuda si está presente ─────────────────────
  test('displays debt ID when id_debt is provided', () => {
    const debt = { days_late: 1, units_fib: 1, amount_debt: 2.00, id_debt: 'D-6001' };
    render(<DebtSummary debt={debt} />);

    expect(screen.getByText(/D-6001/)).toBeInTheDocument();
  });

  test('does not display debt ID section when id_debt is not provided', () => {
    const debt = { days_late: 1, units_fib: 1, amount_debt: 2.00 };
    render(<DebtSummary debt={debt} />);

    expect(screen.queryByText(/ID de deuda/)).not.toBeInTheDocument();
  });

  // ─── Advertencia sobre limitación de préstamos ────────────────
  test('displays warning about loan limitation due to pending debt', () => {
    const debt = { days_late: 1, units_fib: 1, amount_debt: 2.00 };
    render(<DebtSummary debt={debt} />);

    expect(screen.getByText(/multa debe ser pagada/i)).toBeInTheDocument();
  });

  // ─── Accessibility: region role ────────────────────────────────
  test('has accessible region role with label', () => {
    const debt = { days_late: 1, units_fib: 1, amount_debt: 2.00 };
    render(<DebtSummary debt={debt} />);

    expect(screen.getByRole('region', { name: /Debt summary/i })).toBeInTheDocument();
  });
});
