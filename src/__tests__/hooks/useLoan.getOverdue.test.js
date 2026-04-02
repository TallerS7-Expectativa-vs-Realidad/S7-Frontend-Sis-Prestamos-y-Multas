/**
 * Unit Tests — useLoan hook (getOverdue)
 * HU-05: Consultar préstamos vencidos y lector responsable
 *
 * Alineado con TEST_CASES.md:
 *  - TC-HU05-01: Préstamos vencidos → overdueLoans contiene L-5001 y L-5002
 *  - TC-HU05-02: Sin préstamos vencidos → overdueLoans = []
 *  - TC-HU05-03: Solo vencidos (filtrado viene del backend)
 *  - Error: servidor 500 → mensaje de error
 *  - Estado de carga
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

import { getOverdueLoans } from '../../services/loanService.js';

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

describe('useLoan — getOverdue (HU-05)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Estado inicial ────────────────────────────────────────────
  test('has correct initial state for overdueLoans', () => {
    const { result } = renderHook(() => useLoan());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.overdueLoans).toBeNull();
  });

  // ─── TC-HU05-01: préstamos vencidos existentes ────────────────
  test('TC-HU05-01 — returns overdue loans on successful fetch', async () => {
    getOverdueLoans.mockResolvedValue([OVERDUE_LOAN_01, OVERDUE_LOAN_02]);

    const { result } = renderHook(() => useLoan());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.getOverdue();
    });

    expect(fetchResult).toHaveLength(2);
    expect(fetchResult[0]).toMatchObject({
      loan_id: 'L-5001',
      title: 'La Odisea',
      state: 'ON_LOAN',
      name_reader: 'Sara Mena',
    });
    expect(fetchResult[1]).toMatchObject({
      loan_id: 'L-5002',
      title: 'El Aleph',
      name_reader: 'Bruno Paz',
    });
    expect(result.current.overdueLoans).toHaveLength(2);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // ─── TC-HU05-02: sin préstamos vencidos → array vacío ─────────
  test('TC-HU05-02 — returns empty array when no overdue loans exist', async () => {
    getOverdueLoans.mockResolvedValue([]);

    const { result } = renderHook(() => useLoan());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.getOverdue();
    });

    expect(fetchResult).toEqual([]);
    expect(result.current.overdueLoans).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ─── TC-HU05-03: only overdue loans returned ─────────────────
  test('TC-HU05-03 — returns only overdue loans (filtering done server-side)', async () => {
    // Backend already filters — hook just passes through
    getOverdueLoans.mockResolvedValue([OVERDUE_LOAN_01]);

    const { result } = renderHook(() => useLoan());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.getOverdue();
    });

    expect(fetchResult).toHaveLength(1);
    expect(fetchResult[0].loan_id).toBe('L-5001');
    expect(fetchResult[0].state).toBe('ON_LOAN');
  });

  // ─── isLoading transitions correctly ──────────────────────────
  test('sets isLoading to true during fetch and false after', async () => {
    let resolvePromise;
    getOverdueLoans.mockReturnValue(
      new Promise((resolve) => { resolvePromise = resolve; })
    );

    const { result } = renderHook(() => useLoan());

    let fetchPromise;
    act(() => {
      fetchPromise = result.current.getOverdue();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolvePromise([]);
      await fetchPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  // ─── Error: servidor 500 → mensaje de error ──────────────────
  test('sets error message on server error (500)', async () => {
    const serverError = new Error('Internal Server Error');
    serverError.response = { status: 500, data: { message: 'DB connection lost' } };
    getOverdueLoans.mockRejectedValue(serverError);

    const { result } = renderHook(() => useLoan());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.getOverdue();
    });

    expect(fetchResult).toEqual([]);
    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });

  // ─── Error: network error → mensaje genérico ─────────────────
  test('sets generic error on network failure', async () => {
    const networkError = new Error('Network Error');
    getOverdueLoans.mockRejectedValue(networkError);

    const { result } = renderHook(() => useLoan());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.getOverdue();
    });

    expect(fetchResult).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });
});
