/**
 * Unit Tests — ReturnForm (late return scenarios)
 * HU-04: Registrar devolución tardía y generar multa Fibonacci
 *
 * Alineado con TEST_CASES.md:
 *  - TC-HU04-01: Devolución tardía con multa → muestra DebtSummary
 *  - TC-HU04-03: 8 días → muestra debt info en éxito
 *  - Confirmaciones y mensajes claros para el bibliotecario
 *  - Input base_fib_amount incluido en el payload
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ReturnForm from '../../components/ReturnForm.jsx';

// Mock the useLoan hook
const mockReturnLoan = vi.fn();
const mockReset = vi.fn();

vi.mock('../../hooks/useLoan.js', () => ({
  useLoan: vi.fn(() => ({
    returnLoan: mockReturnLoan,
    isLoading: false,
    error: null,
    success: false,
    loanData: null,
    reset: mockReset,
  })),
}));

import { useLoan } from '../../hooks/useLoan.js';

describe('ReturnForm — late return display (HU-04)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── TC-HU04-01: Success + debt → shows DebtSummary ──────────
  test('TC-HU04-01 — displays DebtSummary when late return creates debt', () => {
    useLoan.mockReturnValue({
      returnLoan: mockReturnLoan,
      isLoading: false,
      error: null,
      success: true,
      loanData: {
        loan_id: 'L-4001',
        state: 'RETURNED',
        days_late: 1,
        units_fib: 1,
        amount_debt: 2.00,
        id_debt: 'D-001',
      },
      reset: mockReset,
    });

    render(<ReturnForm />);

    // Success message
    expect(screen.getByText(/Devolución registrada exitosamente/i)).toBeInTheDocument();

    // DebtSummary should be rendered
    expect(screen.getByText(/Resumen de Multa/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1 día/).length).toBeGreaterThanOrEqual(1);
  });

  // ─── TC-HU04-03: 8 days late → shows debt details ────────────
  test('TC-HU04-03 — displays debt details for 8 days late return', () => {
    useLoan.mockReturnValue({
      returnLoan: mockReturnLoan,
      isLoading: false,
      error: null,
      success: true,
      loanData: {
        loan_id: 'L-4003',
        state: 'RETURNED',
        days_late: 8,
        units_fib: 2,
        amount_debt: 4.00,
        id_debt: 'D-003',
      },
      reset: mockReset,
    });

    render(<ReturnForm />);

    expect(screen.getAllByText(/8 días/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/\$4,00|\$4\.00/)).toBeInTheDocument();
  });

  // ─── On-time return → no DebtSummary ──────────────────────────
  test('does NOT display DebtSummary for on-time return (days_late=null)', () => {
    useLoan.mockReturnValue({
      returnLoan: mockReturnLoan,
      isLoading: false,
      error: null,
      success: true,
      loanData: {
        loan_id: 'L-3001',
        state: 'RETURNED',
        days_late: null,
      },
      reset: mockReset,
    });

    render(<ReturnForm />);

    expect(screen.getByText(/Devolución registrada exitosamente/i)).toBeInTheDocument();
    expect(screen.getByText(/No se generó multa/i)).toBeInTheDocument();
    expect(screen.queryByText(/Resumen de Multa/i)).not.toBeInTheDocument();
  });

  // ─── days_late=0 → no DebtSummary ─────────────────────────────
  test('does NOT display DebtSummary when days_late is 0', () => {
    useLoan.mockReturnValue({
      returnLoan: mockReturnLoan,
      isLoading: false,
      error: null,
      success: true,
      loanData: {
        loan_id: 'L-3002',
        state: 'RETURNED',
        days_late: 0,
      },
      reset: mockReset,
    });

    render(<ReturnForm />);

    expect(screen.queryByText(/Resumen de Multa/i)).not.toBeInTheDocument();
  });
});

describe('ReturnForm — base_fib_amount field (HU-04)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLoan.mockReturnValue({
      returnLoan: mockReturnLoan,
      isLoading: false,
      error: null,
      success: false,
      loanData: null,
      reset: mockReset,
    });
  });

  // ─── base_fib_amount included in payload ──────────────────────
  test('includes base_fib_amount in submitted payload', async () => {
    mockReturnLoan.mockResolvedValue({ state: 'RETURNED' });
    const user = userEvent.setup();

    render(<ReturnForm />);

    await user.type(screen.getByPlaceholderText('Ej: BOOK-001'), 'B-1201');
    await user.type(screen.getByLabelText(/Fecha de Devolución/i), '2026-03-25');
    await user.selectOptions(screen.getByLabelText(/Tipo de Identificación/i), 'CI');
    await user.type(screen.getByPlaceholderText('Ej: 1023456789'), 'R-2201');

    // Clear default value and type custom base_fib_amount
    const baseFibInput = screen.getByLabelText(/Base de Multa Fibonacci/i);
    await user.clear(baseFibInput);
    await user.type(baseFibInput, '3.50');

    await user.click(screen.getByRole('button', { name: /Registrar Devolución/i }));

    await waitFor(() => {
      expect(mockReturnLoan).toHaveBeenCalledTimes(1);
    });

    const calledWith = mockReturnLoan.mock.calls[0][0];
    expect(calledWith.base_fib_amount).toBe(3.5);
  });

  // ─── base_fib_amount renders with label ───────────────────────
  test('renders base fib amount field with label', () => {
    render(<ReturnForm />);

    expect(screen.getByLabelText(/Base de Multa Fibonacci/i)).toBeInTheDocument();
  });
});

describe('ReturnForm — DEBT_CREATION_ERROR (HU-04)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── DEBT_CREATION_ERROR → error message ──────────────────────
  test('displays error when debt creation fails on backend', () => {
    useLoan.mockReturnValue({
      returnLoan: mockReturnLoan,
      isLoading: false,
      error: 'Error: 500',
      success: false,
      loanData: null,
      reset: mockReset,
    });

    render(<ReturnForm />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/Error: 500/i)).toBeInTheDocument();
  });
});
