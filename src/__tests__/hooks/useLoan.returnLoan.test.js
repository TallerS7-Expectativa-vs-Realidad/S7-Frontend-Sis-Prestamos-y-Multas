/**
 * Unit Tests — useLoan hook (returnLoan)
 * HU-03: Registrar devolución de un libro dentro del plazo
 *
 * Alineado con TEST_CASES.md:
 *  - TC-HU03-01: Devolución antes de date_limit → success=true, loanData populated, no debt
 *  - TC-HU03-02: Devolución en fecha exacta → success=true, days_late=0, no debt
 *  - TC-HU03-03: Sin préstamo activo → error LOAN_NOT_FOUND
 *  - TC-HU03-04: Préstamo ya devuelto → error ALREADY_RETURNED
 *  - Validación INVALID_PAYLOAD
 *  - Error de red
 *
 * Datos base (TEST_CASES.md → Datos base sugeridos HU-03):
 *  - LOAN-ACTIVE-EARLY-01:    id_book=B-1101, id_reader=R-2101, CI, date_return=2026-04-08
 *  - LOAN-ACTIVE-ON-LIMIT-01: id_book=B-1102, id_reader=R-2102, DNI, date_return=2026-04-10
 *  - BOOK-WITHOUT-ACTIVE-LOAN-01: id_book=B-1103, id_reader=R-2103
 *  - LOAN-ALREADY-RETURNED-01:    id_book=B-1104, id_reader=R-2104
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
const RETURN_DATA_EARLY = {
  id_book: 'B-1101',
  id_reader: 'R-2101',
  type_id_reader: 'CI',
  date_return: '2026-04-08',
};

const RETURN_DATA_ON_LIMIT = {
  id_book: 'B-1102',
  id_reader: 'R-2102',
  type_id_reader: 'DNI',
  date_return: '2026-04-10',
};

const RETURN_SUCCESS_RESPONSE = {
  loan_id: 'L-3001',
  id_book: 'B-1101',
  title: 'Libro de prueba 1',
  id_reader: 'R-2101',
  name_reader: 'Lector Uno',
  date_return: '2026-04-08',
  state: 'RETURNED',
  days_late: null,
};

const RETURN_ON_LIMIT_RESPONSE = {
  loan_id: 'L-3002',
  id_book: 'B-1102',
  title: 'Libro de prueba 2',
  id_reader: 'R-2102',
  name_reader: 'Lector Dos',
  date_return: '2026-04-10',
  state: 'RETURNED',
  days_late: null,
};

describe('useLoan — returnLoan (HU-03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Estado inicial ────────────────────────────────────────────
  test('has correct initial state for loan return', () => {
    const { result } = renderHook(() => useLoan());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.loanData).toBeNull();
  });

  // ─── TC-HU03-01: Devolución exitosa antes de date_limit ───────
  test('TC-HU03-01 — returnLoan sets success=true and loanData with RETURNED state, no debt', async () => {
    returnLoanService.mockResolvedValue(RETURN_SUCCESS_RESPONSE);

    const { result } = renderHook(() => useLoan());

    let returnResult;
    await act(async () => {
      returnResult = await result.current.returnLoan(RETURN_DATA_EARLY);
    });

    expect(returnLoanService).toHaveBeenCalledWith(RETURN_DATA_EARLY);
    expect(result.current.success).toBe(true);
    expect(result.current.loanData).toEqual(RETURN_SUCCESS_RESPONSE);
    expect(result.current.loanData.state).toBe('RETURNED');
    expect(result.current.loanData.days_late).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(returnResult).toEqual(RETURN_SUCCESS_RESPONSE);
  });

  // ─── TC-HU03-02: Devolución en fecha exacta → sin deuda ──────
  test('TC-HU03-02 — returnLoan on exact date_limit: success=true, no debt', async () => {
    returnLoanService.mockResolvedValue(RETURN_ON_LIMIT_RESPONSE);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.returnLoan(RETURN_DATA_ON_LIMIT);
    });

    expect(returnLoanService).toHaveBeenCalledWith(RETURN_DATA_ON_LIMIT);
    expect(result.current.success).toBe(true);
    expect(result.current.loanData.state).toBe('RETURNED');
    expect(result.current.loanData.days_late).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // ─── TC-HU03-03: LOAN_NOT_FOUND → error ──────────────────────
  test('TC-HU03-03 — sets error for LOAN_NOT_FOUND (404)', async () => {
    const axiosError = {
      response: {
        status: 404,
        data: { code: 'LOAN_NOT_FOUND', message: 'Loan not found with provided criteria' },
      },
    };
    returnLoanService.mockRejectedValue(axiosError);

    const { result } = renderHook(() => useLoan());

    let returnResult;
    await act(async () => {
      returnResult = await result.current.returnLoan({
        id_book: 'B-1103',
        id_reader: 'R-2103',
        type_id_reader: 'CI',
        date_return: '2026-04-10',
      });
    });

    expect(result.current.error).toBe('Loan not found');
    expect(result.current.success).toBe(false);
    expect(result.current.loanData).toBeNull();
    expect(returnResult).toBeNull();
  });

  // ─── TC-HU03-04: ALREADY_RETURNED → error ────────────────────
  test('TC-HU03-04 — sets error for ALREADY_RETURNED (409)', async () => {
    const axiosError = {
      response: {
        status: 409,
        data: { code: 'ALREADY_RETURNED', message: 'Loan has already been returned' },
      },
    };
    returnLoanService.mockRejectedValue(axiosError);

    const { result } = renderHook(() => useLoan());

    let returnResult;
    await act(async () => {
      returnResult = await result.current.returnLoan({
        id_book: 'B-1104',
        id_reader: 'R-2104',
        type_id_reader: 'CI',
        date_return: '2026-04-11',
      });
    });

    expect(result.current.error).toBe('This loan has already been returned');
    expect(result.current.success).toBe(false);
    expect(returnResult).toBeNull();
  });

  // ─── INVALID_PAYLOAD → error ──────────────────────────────────
  test('sets error for INVALID_PAYLOAD (400)', async () => {
    const axiosError = {
      response: {
        status: 400,
        data: { code: 'INVALID_PAYLOAD', message: 'Invalid request payload' },
      },
    };
    returnLoanService.mockRejectedValue(axiosError);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.returnLoan({ date_return: 'bad-date' });
    });

    expect(result.current.error).toBe('Invalid data provided');
    expect(result.current.success).toBe(false);
  });

  // ─── Error de red → error ─────────────────────────────────────
  test('sets error when no response from server (network error)', async () => {
    const networkError = { request: {}, message: 'Network Error' };
    returnLoanService.mockRejectedValue(networkError);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.returnLoan(RETURN_DATA_EARLY);
    });

    expect(result.current.error).toBe('No response from server. Please check your connection.');
    expect(result.current.success).toBe(false);
  });

  // ─── reset limpia el estado ────────────────────────────────────
  test('reset clears success, error and loanData', async () => {
    returnLoanService.mockResolvedValue(RETURN_SUCCESS_RESPONSE);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.returnLoan(RETURN_DATA_EARLY);
    });

    expect(result.current.success).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.loanData).toBeNull();
  });

  // ─── isLoading se activa durante la llamada ────────────────────
  test('sets isLoading=true during returnLoan call', async () => {
    let resolvePromise;
    returnLoanService.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve; })
    );

    const { result } = renderHook(() => useLoan());

    let returnPromise;
    act(() => {
      returnPromise = result.current.returnLoan(RETURN_DATA_EARLY);
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise(RETURN_SUCCESS_RESPONSE);
      await returnPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });
});
