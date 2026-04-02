/**
 * Unit Tests — useLoan hook (register / createLoan)
 * HU-02: Registrar préstamo de un libro a un lector habilitado
 *
 * Alineado con TEST_CASES.md:
 *  - TC-HU02-01: Registro exitoso → success=true, loanData populated
 *  - TC-HU02-02: Libro no disponible → error BOOK_NOT_AVAILABLE
 *  - TC-HU02-03: Lector con deuda → error READER_HAS_DEBT
 *  - TC-HU02-04: Plazo inválido → error INVALID_LOAN_DAYS
 *  - Validación INVALID_PAYLOAD
 *  - Error de red / servidor
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

import { createLoan } from '../../services/loanService.js';

// ══════════════════════════════════════════════════════════════════
// Datos base (TEST_CASES.md → Datos base sugeridos HU-02)
// ══════════════════════════════════════════════════════════════════
const VALID_LOAN_DATA = {
  id_book: 'B-1001',
  title: 'Cien años de soledad',
  type_id_reader: 'CI',
  id_reader: 'R-2001',
  name_reader: 'Ana Torres',
  loan_days: 7,
};

const LOAN_CREATED_RESPONSE = {
  loan_id: 1,
  id_book: 'B-1001',
  title: 'Cien años de soledad',
  type_id_reader: 'CI',
  id_reader: 'R-2001',
  name_reader: 'Ana Torres',
  loan_days: 7,
  state: 'ON_LOAN',
  date_limit: '2026-04-07',
  date_return: null,
};

describe('useLoan — register (HU-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Estado inicial ────────────────────────────────────────────
  test('has correct initial state for loan registration', () => {
    const { result } = renderHook(() => useLoan());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.loanData).toBeNull();
  });

  // ─── TC-HU02-01: Registro exitoso ─────────────────────────────
  test('TC-HU02-01 — registers loan successfully, sets success=true and loanData', async () => {
    createLoan.mockResolvedValue(LOAN_CREATED_RESPONSE);

    const { result } = renderHook(() => useLoan());

    let registerResult;
    await act(async () => {
      registerResult = await result.current.register(VALID_LOAN_DATA);
    });

    expect(createLoan).toHaveBeenCalledWith(VALID_LOAN_DATA);
    expect(result.current.success).toBe(true);
    expect(result.current.loanData).toEqual(LOAN_CREATED_RESPONSE);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(registerResult).toEqual(LOAN_CREATED_RESPONSE);
  });

  // ─── TC-HU02-02: Libro no disponible → error ──────────────────
  test('TC-HU02-02 — sets error for BOOK_NOT_AVAILABLE (409)', async () => {
    const axiosError = {
      response: {
        status: 409,
        data: { code: 'BOOK_NOT_AVAILABLE', message: 'Book is not available' },
      },
    };
    createLoan.mockRejectedValue(axiosError);

    const { result } = renderHook(() => useLoan());

    let registerResult;
    await act(async () => {
      registerResult = await result.current.register({
        ...VALID_LOAN_DATA,
        id_book: 'B-1002',
        title: '1984',
      });
    });

    expect(result.current.error).toBe('The book is not available for loan');
    expect(result.current.success).toBe(false);
    expect(result.current.loanData).toBeNull();
    expect(registerResult).toBeNull();
  });

  // ─── TC-HU02-03: Lector con deuda → error ─────────────────────
  test('TC-HU02-03 — sets error for READER_HAS_DEBT (409)', async () => {
    const axiosError = {
      response: {
        status: 409,
        data: { code: 'READER_HAS_DEBT', message: 'Reader has pending debt' },
      },
    };
    createLoan.mockRejectedValue(axiosError);

    const { result } = renderHook(() => useLoan());

    let registerResult;
    await act(async () => {
      registerResult = await result.current.register({
        id_book: 'B-1003',
        title: 'El principito',
        type_id_reader: 'CI',
        id_reader: 'R-2003',
        name_reader: 'Laura Díaz',
        loan_days: 21,
      });
    });

    expect(result.current.error).toBe('Reader has pending debt and cannot borrow books');
    expect(result.current.success).toBe(false);
    expect(registerResult).toBeNull();
  });

  // ─── TC-HU02-04: Plazo inválido → error ───────────────────────
  test('TC-HU02-04 — sets error for INVALID_LOAN_DAYS (400)', async () => {
    const axiosError = {
      response: {
        status: 400,
        data: { code: 'INVALID_LOAN_DAYS', message: 'Invalid loan days' },
      },
    };
    createLoan.mockRejectedValue(axiosError);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.register({
        ...VALID_LOAN_DATA,
        loan_days: 10,
      });
    });

    expect(result.current.error).toBe('Loan days must be 7, 14, or 21');
    expect(result.current.success).toBe(false);
  });

  // ─── Payload inválido → error INVALID_PAYLOAD ─────────────────
  test('sets error for INVALID_PAYLOAD (400)', async () => {
    const axiosError = {
      response: {
        status: 400,
        data: { code: 'INVALID_PAYLOAD', message: 'Invalid request payload' },
      },
    };
    createLoan.mockRejectedValue(axiosError);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.register({ id_book: 'B-1001' });
    });

    expect(result.current.error).toBe('Invalid data provided');
    expect(result.current.success).toBe(false);
  });

  // ─── Error de red (sin response) ──────────────────────────────
  test('sets connection error when no response from server', async () => {
    const networkError = { request: {}, message: 'Network Error' };
    createLoan.mockRejectedValue(networkError);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.register(VALID_LOAN_DATA);
    });

    expect(result.current.error).toBe(
      'No response from server. Please check your connection.'
    );
    expect(result.current.success).toBe(false);
  });

  // ─── Error 500 del servidor ────────────────────────────────────
  test('sets server error for 500 responses', async () => {
    const serverError = {
      response: {
        status: 500,
        data: { message: 'Internal server error' },
      },
    };
    createLoan.mockRejectedValue(serverError);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.register(VALID_LOAN_DATA);
    });

    expect(result.current.error).toBe('Internal server error');
    expect(result.current.success).toBe(false);
  });

  // ─── isLoading se activa durante la petición ──────────────────
  test('sets isLoading=true during request and false after', async () => {
    let resolvePromise;
    createLoan.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    const { result } = renderHook(() => useLoan());

    let registerPromise;
    act(() => {
      registerPromise = result.current.register(VALID_LOAN_DATA);
    });

    // While pending, isLoading should be true
    expect(result.current.isLoading).toBe(true);

    // Resolve and wait
    await act(async () => {
      resolvePromise(LOAN_CREATED_RESPONSE);
      await registerPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  // ─── reset limpia el estado ────────────────────────────────────
  test('reset clears error and success state', async () => {
    createLoan.mockResolvedValue(LOAN_CREATED_RESPONSE);

    const { result } = renderHook(() => useLoan());

    // First, register successfully
    await act(async () => {
      await result.current.register(VALID_LOAN_DATA);
    });
    expect(result.current.success).toBe(true);

    // Then reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.loanData).toBeNull();
  });
});
