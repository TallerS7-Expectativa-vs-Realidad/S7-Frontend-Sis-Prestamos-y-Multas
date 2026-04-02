/**
 * Unit Tests — useLoan hook (returnLoan — late return)
 * HU-04: Registrar devolución tardía y generar multa Fibonacci
 *
 * Alineado con TEST_CASES.md:
 *  - TC-HU04-01: 1 día mora → success=true, loanData with debt info
 *  - TC-HU04-03: 8 días mora → success=true, loanData with units_fib=2
 *  - TC-HU04-05: 22 días mora → success=true, loanData with units_fib=7
 *  - DEBT_CREATION_ERROR → error
 *
 * Datos base (TEST_CASES.md → Datos base sugeridos HU-04):
 *  - date_limit=2026-04-10 for all late loans
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useLoan } from '../../hooks/useLoan.js';

vi.mock('../../services/loanService.js', () => ({
  searchBookByName: vi.fn(),
  createLoan: vi.fn(),
  returnLoan: vi.fn(),
  getOverdueLoans: vi.fn(),
}));

import { returnLoan as returnLoanService } from '../../services/loanService.js';

// ══════════════════════════════════════════════════════════════════
// Datos base
// ══════════════════════════════════════════════════════════════════
const RETURN_DATA_LATE_01D = {
  id_book: 'B-1201',
  id_reader: 'R-2201',
  type_id_reader: 'CI',
  date_return: '2026-04-11',
  base_fib_amount: 2.00,
};

const RETURN_DATA_LATE_08D = {
  id_book: 'B-1203',
  id_reader: 'R-2203',
  type_id_reader: 'CI',
  date_return: '2026-04-18',
  base_fib_amount: 2.00,
};

const RETURN_DATA_LATE_22D = {
  id_book: 'B-1205',
  id_reader: 'R-2205',
  type_id_reader: 'TI',
  date_return: '2026-05-02',
  base_fib_amount: 2.00,
};

const LATE_RESPONSE_01D = {
  loan_id: 'L-4001',
  id_book: 'B-1201',
  title: 'Libro de prueba tardío',
  id_reader: 'R-2201',
  name_reader: 'Lector Tardío',
  date_return: '2026-04-11',
  state: 'RETURNED',
  days_late: 1,
  id_debt: 'D-001',
  units_fib: 1,
  amount_debt: 2.00,
  state_debt: 'PENDING',
};

const LATE_RESPONSE_08D = {
  loan_id: 'L-4003',
  id_book: 'B-1203',
  title: 'Libro prueba 8 días',
  id_reader: 'R-2203',
  name_reader: 'Lector 8 días',
  date_return: '2026-04-18',
  state: 'RETURNED',
  days_late: 8,
  id_debt: 'D-003',
  units_fib: 2,
  amount_debt: 4.00,
  state_debt: 'PENDING',
};

const LATE_RESPONSE_22D = {
  loan_id: 'L-4005',
  id_book: 'B-1205',
  title: 'Libro prueba 22 días',
  id_reader: 'R-2205',
  name_reader: 'Lector 22 días',
  date_return: '2026-05-02',
  state: 'RETURNED',
  days_late: 22,
  id_debt: 'D-005',
  units_fib: 7,
  amount_debt: 14.00,
  state_debt: 'PENDING',
};

describe('useLoan — returnLoan late return (HU-04)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── TC-HU04-01: 1 día mora → success con debt info ──────────
  test('TC-HU04-01 — returnLoan with 1 day late: success=true, loanData includes debt', async () => {
    returnLoanService.mockResolvedValue(LATE_RESPONSE_01D);

    const { result } = renderHook(() => useLoan());

    let returnResult;
    await act(async () => {
      returnResult = await result.current.returnLoan(RETURN_DATA_LATE_01D);
    });

    expect(returnLoanService).toHaveBeenCalledWith(RETURN_DATA_LATE_01D);
    expect(result.current.success).toBe(true);
    expect(result.current.loanData.state).toBe('RETURNED');
    expect(result.current.loanData.days_late).toBe(1);
    expect(result.current.loanData.units_fib).toBe(1);
    expect(result.current.loanData.amount_debt).toBe(2.00);
    expect(result.current.loanData.state_debt).toBe('PENDING');
    expect(result.current.loanData.id_debt).toBe('D-001');
    expect(result.current.error).toBeNull();
    expect(returnResult).toEqual(LATE_RESPONSE_01D);
  });

  // ─── TC-HU04-03: 8 días mora → correct debt values ───────────
  test('TC-HU04-03 — returnLoan with 8 days late: units_fib=2, amount_debt=4.00', async () => {
    returnLoanService.mockResolvedValue(LATE_RESPONSE_08D);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.returnLoan(RETURN_DATA_LATE_08D);
    });

    expect(result.current.success).toBe(true);
    expect(result.current.loanData.days_late).toBe(8);
    expect(result.current.loanData.units_fib).toBe(2);
    expect(result.current.loanData.amount_debt).toBe(4.00);
  });

  // ─── TC-HU04-05: 22 días mora → correct debt values ──────────
  test('TC-HU04-05 — returnLoan with 22 days late: units_fib=7, amount_debt=14.00', async () => {
    returnLoanService.mockResolvedValue(LATE_RESPONSE_22D);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.returnLoan(RETURN_DATA_LATE_22D);
    });

    expect(result.current.success).toBe(true);
    expect(result.current.loanData.days_late).toBe(22);
    expect(result.current.loanData.units_fib).toBe(7);
    expect(result.current.loanData.amount_debt).toBe(14.00);
  });

  // ─── DEBT_CREATION_ERROR → error state ────────────────────────
  test('sets error for DEBT_CREATION_ERROR (500)', async () => {
    const axiosError = {
      response: {
        status: 500,
        data: { code: 'DEBT_CREATION_ERROR', message: 'Error creating debt record' },
      },
    };
    returnLoanService.mockRejectedValue(axiosError);

    const { result } = renderHook(() => useLoan());

    let returnResult;
    await act(async () => {
      returnResult = await result.current.returnLoan(RETURN_DATA_LATE_01D);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.success).toBe(false);
    expect(result.current.loanData).toBeNull();
    expect(returnResult).toBeNull();
  });

  // ─── Loading state during returnLoan ──────────────────────────
  test('sets isLoading=true during returnLoan and false after', async () => {
    let resolvePromise;
    returnLoanService.mockImplementation(() => new Promise(resolve => {
      resolvePromise = resolve;
    }));

    const { result } = renderHook(() => useLoan());

    let returnPromise;
    act(() => {
      returnPromise = result.current.returnLoan(RETURN_DATA_LATE_01D);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise(LATE_RESPONSE_01D);
      await returnPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  // ─── Network error handling ───────────────────────────────────
  test('handles network error gracefully', async () => {
    const networkError = { request: {}, message: 'Network Error' };
    returnLoanService.mockRejectedValue(networkError);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.returnLoan(RETURN_DATA_LATE_01D);
    });

    expect(result.current.error).toContain('No response from server');
    expect(result.current.success).toBe(false);
  });

  // ─── Reset clears late return data ────────────────────────────
  test('reset clears loanData including debt info', async () => {
    returnLoanService.mockResolvedValue(LATE_RESPONSE_01D);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.returnLoan(RETURN_DATA_LATE_01D);
    });

    expect(result.current.loanData).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.loanData).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
