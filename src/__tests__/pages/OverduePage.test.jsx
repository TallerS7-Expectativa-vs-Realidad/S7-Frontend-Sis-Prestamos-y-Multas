/**
 * Unit Tests — OverduePage
 * HU-05: Consultar préstamos vencidos y lector responsable
 *
 * Alineado con TEST_CASES.md:
 *  - Render completo de la page con OverdueLoansTable
 *  - Título y subtítulo presentes
 */

import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

// Mock the child component to isolate page rendering
vi.mock('../../components/OverdueLoansTable.jsx', () => ({
  default: () => <div data-testid="overdue-loans-table">MockedTable</div>,
}));

import OverduePage from '../../pages/OverduePage.jsx';

describe('OverduePage (HU-05)', () => {
  // ─── Render: page title and subtitle ──────────────────────────
  test('renders page with title "Préstamos Vencidos"', () => {
    render(<OverduePage />);

    expect(screen.getByText('Préstamos Vencidos')).toBeInTheDocument();
  });

  test('renders subtitle describing purpose', () => {
    render(<OverduePage />);

    expect(screen.getByText(/libros fuera de plazo/i)).toBeInTheDocument();
  });

  // ─── Render: includes OverdueLoansTable component ─────────────
  test('renders the OverdueLoansTable component', () => {
    render(<OverduePage />);

    expect(screen.getByTestId('overdue-loans-table')).toBeInTheDocument();
  });
});
