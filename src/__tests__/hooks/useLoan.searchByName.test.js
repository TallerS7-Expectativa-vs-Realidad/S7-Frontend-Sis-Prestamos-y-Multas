/**
 * Unit Tests — useLoan hook (searchByName)
 * HU-01: Consultar estado y disponibilidad de un libro
 *
 * Alineado con TEST_CASES.md:
 *  - TC-HU01-01: Libro disponible → searchResults contiene RETURNED
 *  - TC-HU01-02: Libro con préstamo activo → searchResults contiene ON_LOAN
 *  - TC-HU01-03: Sin historial → searchResults = []
 *  - Error: INVALID_NAME → mensaje de error
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

import { searchBookByName } from '../../services/loanService.js';

// ══════════════════════════════════════════════════════════════════
// Datos base (TEST_CASES.md → Datos base sugeridos HU-01)
// ══════════════════════════════════════════════════════════════════
const BOOK_AVAILABLE_HISTORY_01 = {
  id_book: 'B-0901', loan_id: null, status: 'RETURNED',
};
const BOOK_ON_LOAN_HISTORY_01 = {
  id_book: 'B-0902', loan_id: 42, status: 'ON_LOAN',
};

describe('useLoan — searchByName (HU-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Estado inicial ────────────────────────────────────────────
  test('has correct initial state', () => {
    const { result } = renderHook(() => useLoan());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.searchResults).toBeNull();
  });

  // ─── TC-HU01-01: Libro disponible (RETURNED) ──────────────────
  test('TC-HU01-01 — returns RETURNED book on successful search', async () => {
    searchBookByName.mockResolvedValue([BOOK_AVAILABLE_HISTORY_01]);

    const { result } = renderHook(() => useLoan());

    let searchResult;
    await act(async () => {
      searchResult = await result.current.searchByName('Don Quijote');
    });

    expect(searchBookByName).toHaveBeenCalledWith('Don Quijote');
    expect(result.current.searchResults).toEqual([BOOK_AVAILABLE_HISTORY_01]);
    expect(result.current.searchResults[0].status).toBe('RETURNED');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(searchResult).toEqual([BOOK_AVAILABLE_HISTORY_01]);
  });

  // ─── TC-HU01-02: Libro con préstamo activo (ON_LOAN) ──────────
  test('TC-HU01-02 — returns ON_LOAN book on successful search', async () => {
    searchBookByName.mockResolvedValue([BOOK_ON_LOAN_HISTORY_01]);

    const { result } = renderHook(() => useLoan());

    let searchResult;
    await act(async () => {
      searchResult = await result.current.searchByName('La vorágine');
    });

    expect(searchBookByName).toHaveBeenCalledWith('La vorágine');
    expect(result.current.searchResults).toEqual([BOOK_ON_LOAN_HISTORY_01]);
    expect(result.current.searchResults[0].status).toBe('ON_LOAN');
    expect(result.current.error).toBeNull();
  });

  // ─── TC-HU01-03: Sin historial → array vacío ─────────────────
  test('TC-HU01-03 — returns empty array when no history found', async () => {
    searchBookByName.mockResolvedValue([]);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.searchByName('Manual de estanterías invisibles');
    });

    expect(searchBookByName).toHaveBeenCalledWith('Manual de estanterías invisibles');
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // ─── Error: INVALID_NAME ──────────────────────────────────────
  test('sets error message for INVALID_NAME', async () => {
    searchBookByName.mockRejectedValue(new Error('INVALID_NAME'));

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.searchByName('');
    });

    expect(result.current.error).toMatch(/inválido|vacío|invalid/i);
    expect(result.current.searchResults).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // ─── Error: servidor 500 ──────────────────────────────────────
  test('sets error message for server error (500)', async () => {
    const serverError = new Error('Internal Server Error');
    serverError.response = { status: 500, data: {} };
    searchBookByName.mockRejectedValue(serverError);

    const { result } = renderHook(() => useLoan());

    await act(async () => {
      await result.current.searchByName('Don Quijote');
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error).not.toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // ─── isLoading activo durante búsqueda ────────────────────────
  test('sets isLoading=true during search', async () => {
    let resolveQuery;
    searchBookByName.mockImplementation(
      () => new Promise((resolve) => { resolveQuery = resolve; })
    );

    const { result } = renderHook(() => useLoan());

    let searchPromise;
    act(() => {
      searchPromise = result.current.searchByName('Don Quijote');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveQuery([]);
      await searchPromise;
    });

    expect(result.current.isLoading).toBe(false);
  });

  // ─── Retorna null en error ────────────────────────────────────
  test('returns null when search fails', async () => {
    searchBookByName.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLoan());

    let searchResult;
    await act(async () => {
      searchResult = await result.current.searchByName('Don Quijote');
    });

    expect(searchResult).toBeNull();
  });
});
