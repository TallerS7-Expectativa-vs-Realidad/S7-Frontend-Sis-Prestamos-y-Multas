/**
 * Unit Tests — useDebt hook
 * HU-06: Registrar pago total de multa y rehabilitar lector
 *
 * Alineado con TEST_CASES.md (Matriz HU-06):
 *  - TC-HU06-01: Pago total exitoso → success=true, debtData.state_debt=PAID
 *  - TC-HU06-02 Variante A: Deuda inexistente → error DEBT_NOT_FOUND
 *  - TC-HU06-02 Variante B: Deuda ya pagada → error DEBT_ALREADY_PAID
 *  - getReaderDebt exitoso → debtData populated
 *  - getReaderDebt sin deuda → error message, debtData null
 *  - Error de red / servidor
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useDebt } from '../../hooks/useDebt.js';

vi.mock('../../services/debtService.js', () => ({
  getReaderDebt: vi.fn(),
  payDebt: vi.fn(),
}));

import { getReaderDebt, payDebt } from '../../services/debtService.js';

// ══════════════════════════════════════════════════════════════════
// Datos base (TEST_CASES.md → Datos base sugeridos HU-06)
// ══════════════════════════════════════════════════════════════════
const DEBT_PENDING_01 = {
  id_debt: 'D-6001',
  loan_id: 'L-6001',
  type_id_reader: 'CI',
  id_reader: 'R-2301',
  name_reader: 'María León',
  amount_debt: 14.00,
  state_debt: 'PENDING',
};

const DEBT_PENDING_01_PAID = {
  ...DEBT_PENDING_01,
  state_debt: 'PAID',
};

describe('useDebt (HU-06)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════
  // Estado inicial
  // ═══════════════════════════════════════════════════════════════
  test('has correct initial state', () => {
    const { result } = renderHook(() => useDebt());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.debtData).toBeNull();
  });

  // ═══════════════════════════════════════════════════════════════
  // getReaderDebt — búsqueda exitosa
  // ═══════════════════════════════════════════════════════════════
  describe('getReaderDebt — successful search', () => {
    test('sets debtData and success when debt is found', async () => {
      getReaderDebt.mockResolvedValue(DEBT_PENDING_01);

      const { result } = renderHook(() => useDebt());

      await act(async () => {
        await result.current.getReaderDebt({ id_reader: 'R-2301', typeId: 'CI' });
      });

      expect(result.current.debtData).toEqual(DEBT_PENDING_01);
      expect(result.current.success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    test('calls service with correct filters', async () => {
      getReaderDebt.mockResolvedValue(DEBT_PENDING_01);

      const { result } = renderHook(() => useDebt());
      const filters = { id_reader: 'R-2301', typeId: 'CI', name_reader: 'María León' };

      await act(async () => {
        await result.current.getReaderDebt(filters);
      });

      expect(getReaderDebt).toHaveBeenCalledWith(filters);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // getReaderDebt — lector sin deuda
  // ═══════════════════════════════════════════════════════════════
  describe('getReaderDebt — no pending debt', () => {
    test('sets error message when service returns null (no debt)', async () => {
      getReaderDebt.mockResolvedValue(null);

      const { result } = renderHook(() => useDebt());

      await act(async () => {
        await result.current.getReaderDebt({ id_reader: 'R-9999' });
      });

      expect(result.current.debtData).toBeNull();
      expect(result.current.error).toBe('Lector no tiene deuda pendiente');
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // getReaderDebt — errores HTTP
  // ═══════════════════════════════════════════════════════════════
  describe('getReaderDebt — HTTP errors', () => {
    test('sets error for 400 INVALID_QUERY', async () => {
      getReaderDebt.mockRejectedValue({
        response: { status: 400, data: { code: 'INVALID_QUERY', message: 'id is required' } },
      });

      const { result } = renderHook(() => useDebt());

      await act(async () => {
        await result.current.getReaderDebt({});
      });

      expect(result.current.error).toBe('Parámetros de búsqueda inválidos');
      expect(result.current.debtData).toBeNull();
    });

    test('sets error for 404 DEBT_NOT_FOUND', async () => {
      getReaderDebt.mockRejectedValue({
        response: { status: 404, data: { code: 'DEBT_NOT_FOUND', message: 'Not found' } },
      });

      const { result } = renderHook(() => useDebt());

      await act(async () => {
        await result.current.getReaderDebt({ id_reader: 'R-9999' });
      });

      expect(result.current.error).toBe('Lector no tiene deuda pendiente');
    });

    test('sets network error message when no response', async () => {
      getReaderDebt.mockRejectedValue({
        request: {},
      });

      const { result } = renderHook(() => useDebt());

      await act(async () => {
        await result.current.getReaderDebt({ id_reader: 'R-2301' });
      });

      expect(result.current.error).toBe('Sin respuesta del servidor. Verifica tu conexión.');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TC-HU06-01: payDebt — pago exitoso
  // ═══════════════════════════════════════════════════════════════
  describe('TC-HU06-01 — payDebt success', () => {
    test('sets debtData with PAID state and success=true after payment', async () => {
      payDebt.mockResolvedValue(DEBT_PENDING_01_PAID);

      const { result } = renderHook(() => useDebt());

      await act(async () => {
        await result.current.payDebt('D-6001');
      });

      expect(result.current.debtData).toEqual(DEBT_PENDING_01_PAID);
      expect(result.current.debtData.state_debt).toBe('PAID');
      expect(result.current.success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    test('calls payDebt service with correct debt ID', async () => {
      payDebt.mockResolvedValue(DEBT_PENDING_01_PAID);

      const { result } = renderHook(() => useDebt());

      await act(async () => {
        await result.current.payDebt('D-6001');
      });

      expect(payDebt).toHaveBeenCalledWith('D-6001');
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TC-HU06-02A: payDebt — deuda inexistente
  // ═══════════════════════════════════════════════════════════════
  describe('TC-HU06-02A — payDebt DEBT_NOT_FOUND', () => {
    test('sets error "Deuda no encontrada" for 404', async () => {
      payDebt.mockRejectedValue({
        response: { status: 404, data: { code: 'DEBT_NOT_FOUND', message: 'Debt not found' } },
      });

      const { result } = renderHook(() => useDebt());

      await act(async () => {
        await result.current.payDebt(999999);
      });

      expect(result.current.error).toBe('Deuda no encontrada');
      expect(result.current.debtData).toBeNull();
      expect(result.current.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // TC-HU06-02B: payDebt — deuda ya pagada
  // ═══════════════════════════════════════════════════════════════
  describe('TC-HU06-02B — payDebt DEBT_ALREADY_PAID', () => {
    test('sets error "La deuda ya ha sido pagada" for 409', async () => {
      payDebt.mockRejectedValue({
        response: { status: 409, data: { code: 'DEBT_ALREADY_PAID', message: 'Already paid' } },
      });

      const { result } = renderHook(() => useDebt());

      await act(async () => {
        await result.current.payDebt('D-6002');
      });

      expect(result.current.error).toBe('La deuda ya ha sido pagada');
      expect(result.current.success).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // payDebt — error de red
  // ═══════════════════════════════════════════════════════════════
  describe('payDebt — network error', () => {
    test('sets network error message when server is unreachable', async () => {
      payDebt.mockRejectedValue({
        request: {},
      });

      const { result } = renderHook(() => useDebt());

      await act(async () => {
        await result.current.payDebt('D-6001');
      });

      expect(result.current.error).toBe('Sin respuesta del servidor. Verifica tu conexión.');
    });
  });
});
