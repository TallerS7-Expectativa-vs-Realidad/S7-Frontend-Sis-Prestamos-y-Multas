/**
 * Unit Tests — OverdueLoansTable component
 * HU-05: Consultar préstamos vencidos y lector responsable
 *
 * Alineado con TEST_CASES.md:
 *  - TC-HU05-01: Render con datos vencidos → tabla muestra libro, lector, fecha límite
 *  - TC-HU05-02: Sin datos → estado vacío "No hay préstamos vencidos"
 *  - TC-HU05-03: Solo vencidos visibles en tabla
 *  - Loading: muestra indicador de carga
 *  - Error: muestra mensaje de error
 */

import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';

// ══════════════════════════════════════════════════════════════════
// Mock del hook useLoan
// ══════════════════════════════════════════════════════════════════
let mockGetOverdue = vi.fn();
let mockState = {
  isLoading: false,
  error: null,
  overdueLoans: null,
};

vi.mock('../../hooks/useLoan.js', () => ({
  useLoan: () => ({
    getOverdue: mockGetOverdue,
    ...mockState,
  }),
}));

import OverdueLoansTable from '../../components/OverdueLoansTable.jsx';

// ══════════════════════════════════════════════════════════════════
// Datos base (TEST_CASES.md → Datos base sugeridos HU-05)
// ══════════════════════════════════════════════════════════════════
const OVERDUE_LOAN_01 = {
  loan_id: 'L-5001',
  id_book: 'B-1251',
  title: 'La Odisea',
  state: 'ON_LOAN',
  id_reader: 'R-2251',
  name_reader: 'Sara Mena',
  date_limit: '2026-03-20',
  date_return: null,
};

const OVERDUE_LOAN_02 = {
  loan_id: 'L-5002',
  id_book: 'B-1252',
  title: 'El Aleph',
  state: 'ON_LOAN',
  id_reader: 'R-2252',
  name_reader: 'Bruno Paz',
  date_limit: '2026-03-24',
  date_return: null,
};

describe('OverdueLoansTable component (HU-05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      isLoading: false,
      error: null,
      overdueLoans: null,
    };
    mockGetOverdue = vi.fn().mockResolvedValue([]);
  });

  // ─── TC-HU05-01: tabla con préstamos vencidos ─────────────────
  test('TC-HU05-01 — renders table with overdue loans showing book and reader', async () => {
    mockGetOverdue = vi.fn().mockResolvedValue([OVERDUE_LOAN_01, OVERDUE_LOAN_02]);

    render(<OverdueLoansTable />);

    // Wait for the table to render with data
    const rows = await screen.findAllByRole('row');
    // 1 header row + 2 data rows
    expect(rows.length).toBeGreaterThanOrEqual(3);

    // Verify loan data is displayed
    expect(await screen.findByText('La Odisea')).toBeInTheDocument();
    expect(await screen.findByText('El Aleph')).toBeInTheDocument();
    expect(await screen.findByText('Sara Mena')).toBeInTheDocument();
    expect(await screen.findByText('Bruno Paz')).toBeInTheDocument();
  });

  // ─── TC-HU05-01: table has correct headers ───────────────────
  test('TC-HU05-01 — renders table with expected column headers', async () => {
    mockGetOverdue = vi.fn().mockResolvedValue([OVERDUE_LOAN_01]);

    render(<OverdueLoansTable />);

    // Wait for table render
    await screen.findByText('La Odisea');

    expect(screen.getByText(/ID Préstamo/i)).toBeInTheDocument();
    expect(screen.getByText(/Libro/i)).toBeInTheDocument();
    expect(screen.getByText(/Estado/i)).toBeInTheDocument();
    expect(screen.getByText(/Lector/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha Límite/i)).toBeInTheDocument();
    expect(screen.getByText(/Fecha Devolución/i)).toBeInTheDocument();
  });

  // ─── TC-HU05-01: shows total count ───────────────────────────
  test('TC-HU05-01 — displays total count of overdue loans', async () => {
    mockGetOverdue = vi.fn().mockResolvedValue([OVERDUE_LOAN_01, OVERDUE_LOAN_02]);

    render(<OverdueLoansTable />);

    await screen.findByText('La Odisea');
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  // ─── TC-HU05-02: estado vacío ─────────────────────────────────
  test('TC-HU05-02 — shows empty state message when no overdue loans', async () => {
    mockGetOverdue = vi.fn().mockResolvedValue([]);

    render(<OverdueLoansTable />);

    expect(await screen.findByText(/no hay préstamos vencidos/i)).toBeInTheDocument();
  });

  // ─── TC-HU05-01: date_return shows dash for null ─────────────
  test('TC-HU05-01 — displays dash for null date_return values', async () => {
    mockGetOverdue = vi.fn().mockResolvedValue([OVERDUE_LOAN_01]);

    render(<OverdueLoansTable />);

    await screen.findByText('La Odisea');
    // The formatDate function returns '-' for null
    const dashes = screen.getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  // ─── Loading state ────────────────────────────────────────────
  test('shows loading indicator while fetching', () => {
    mockState = {
      isLoading: true,
      error: null,
      overdueLoans: null,
    };
    mockGetOverdue = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<OverdueLoansTable />);

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  // ─── Error state ──────────────────────────────────────────────
  test('shows error message when fetch fails', () => {
    mockState = {
      isLoading: false,
      error: 'Error del servidor al obtener préstamos vencidos',
      overdueLoans: null,
    };
    mockGetOverdue = vi.fn().mockResolvedValue([]);

    render(<OverdueLoansTable />);

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  // ─── TC-HU05-01: state badge shows ON_LOAN ───────────────────
  test('TC-HU05-01 — displays ON_LOAN state badge for overdue loans', async () => {
    mockGetOverdue = vi.fn().mockResolvedValue([OVERDUE_LOAN_01]);

    render(<OverdueLoansTable />);

    await screen.findByText('La Odisea');
    expect(screen.getByText('ON_LOAN')).toBeInTheDocument();
  });
});
