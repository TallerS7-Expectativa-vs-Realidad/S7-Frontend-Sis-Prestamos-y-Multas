/**
 * Unit Tests — DebtPaymentForm component
 * HU-06: Registrar pago total de multa y rehabilitar lector
 *
 * Alineado con TEST_CASES.md (Matriz HU-06):
 *  - TC-HU06-01: Buscar deuda → visualizar detalles → confirmar pago → state_debt=PAID
 *  - TC-HU06-02: Búsqueda sin resultado → error visible
 *  - Render: campos de búsqueda, botones, secciones
 *  - Interacción: submit búsqueda, confirmar pago, estados de loading
 *  - Éxito: mensaje de rehabilitación visible
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import DebtPaymentForm from '../../components/DebtPaymentForm.jsx';

// Mock the useDebt hook
const mockGetReaderDebt = vi.fn();
const mockPayDebt = vi.fn();

vi.mock('../../hooks/useDebt.js', () => ({
  useDebt: vi.fn(() => ({
    getReaderDebt: mockGetReaderDebt,
    payDebt: mockPayDebt,
    isLoading: false,
    error: null,
    success: false,
    debtData: null,
  })),
}));

import { useDebt } from '../../hooks/useDebt.js';

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

describe('DebtPaymentForm — render (HU-06)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDebt.mockReturnValue({
      getReaderDebt: mockGetReaderDebt,
      payDebt: mockPayDebt,
      isLoading: false,
      error: null,
      success: false,
      debtData: null,
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Render: estructura del formulario
  // ═══════════════════════════════════════════════════════════════
  test('renders form title', () => {
    render(<DebtPaymentForm />);
    expect(screen.getByText('Registrar Pago de Multa')).toBeInTheDocument();
  });

  test('renders search section with reader fields', () => {
    render(<DebtPaymentForm />);
    expect(screen.getByText('Búsqueda de Lector')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Identificación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Identificación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del Lector/i)).toBeInTheDocument();
  });

  test('renders ID type selector with CI and DNI options', () => {
    render(<DebtPaymentForm />);
    const select = screen.getByLabelText(/Tipo de Identificación/i);
    expect(select).toBeInTheDocument();

    const options = select.querySelectorAll('option');
    const values = Array.from(options).map((o) => o.value);
    expect(values).toContain('CI');
    expect(values).toContain('DNI');
  });

  test('renders search button', () => {
    render(<DebtPaymentForm />);
    expect(screen.getByRole('button', { name: /Buscar Deuda/i })).toBeInTheDocument();
  });

  test('search button is disabled when id_reader is empty', () => {
    render(<DebtPaymentForm />);
    const btn = screen.getByRole('button', { name: /Buscar Deuda/i });
    expect(btn).toBeDisabled();
  });

  // ═══════════════════════════════════════════════════════════════
  // Render: sección de error
  // ═══════════════════════════════════════════════════════════════
  test('displays error alert when error exists', () => {
    useDebt.mockReturnValue({
      getReaderDebt: mockGetReaderDebt,
      payDebt: mockPayDebt,
      isLoading: false,
      error: 'Lector no tiene deuda pendiente',
      success: false,
      debtData: null,
    });

    render(<DebtPaymentForm />);
    expect(screen.getByRole('alert')).toHaveTextContent('Lector no tiene deuda pendiente');
  });

  // ═══════════════════════════════════════════════════════════════
  // Render: deuda encontrada → detalles visibles
  // ═══════════════════════════════════════════════════════════════
  test('does not show debt details section initially', () => {
    render(<DebtPaymentForm />);
    expect(screen.queryByText('Detalles de la Deuda')).not.toBeInTheDocument();
  });
});

describe('DebtPaymentForm — interactions (HU-06)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDebt.mockReturnValue({
      getReaderDebt: mockGetReaderDebt,
      payDebt: mockPayDebt,
      isLoading: false,
      error: null,
      success: false,
      debtData: null,
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // Búsqueda de deuda
  // ═══════════════════════════════════════════════════════════════
  test('enables search button once id_reader is filled', async () => {
    const user = userEvent.setup();
    render(<DebtPaymentForm />);

    const input = screen.getByLabelText(/Número de Identificación/i);
    await user.type(input, 'R-2301');

    const btn = screen.getByRole('button', { name: /Buscar Deuda/i });
    expect(btn).not.toBeDisabled();
  });

  test('calls getReaderDebt with correct filters on search submit', async () => {
    mockGetReaderDebt.mockResolvedValue(DEBT_PENDING_01);
    const user = userEvent.setup();
    render(<DebtPaymentForm />);

    const idInput = screen.getByLabelText(/Número de Identificación/i);
    await user.type(idInput, 'R-2301');

    const btn = screen.getByRole('button', { name: /Buscar Deuda/i });
    await user.click(btn);

    expect(mockGetReaderDebt).toHaveBeenCalledWith(
      expect.objectContaining({
        id_reader: 'R-2301',
        typeId: 'CI',
      })
    );
  });

  // ═══════════════════════════════════════════════════════════════
  // TC-HU06-01: Visualización de deuda y confirmación de pago
  // ═══════════════════════════════════════════════════════════════
  test('TC-HU06-01 — displays debt details after successful search', async () => {
    // Simulate: after search, debtData is populated
    mockGetReaderDebt.mockResolvedValue(DEBT_PENDING_01);

    // Re-render with debtData populated (simulating hook state update)
    useDebt.mockReturnValue({
      getReaderDebt: mockGetReaderDebt,
      payDebt: mockPayDebt,
      isLoading: false,
      error: null,
      success: false,
      debtData: DEBT_PENDING_01,
    });

    const user = userEvent.setup();
    render(<DebtPaymentForm />);

    // Type to trigger search
    const idInput = screen.getByLabelText(/Número de Identificación/i);
    await user.type(idInput, 'R-2301');

    const searchBtn = screen.getByRole('button', { name: /Buscar Deuda/i });
    await user.click(searchBtn);

    // After search, debt details section should be visible
    await waitFor(() => {
      expect(screen.getByText('Detalles de la Deuda')).toBeInTheDocument();
    });

    // Verify debt data is displayed
    expect(screen.getByText('R-2301')).toBeInTheDocument();
    expect(screen.getByText('María León')).toBeInTheDocument();
    expect(screen.getByText('PENDING')).toBeInTheDocument();
    expect(screen.getByText('D-6001')).toBeInTheDocument();
  });

  test('TC-HU06-01 — shows payment confirmation button when debt is displayed', async () => {
    mockGetReaderDebt.mockResolvedValue(DEBT_PENDING_01);

    useDebt.mockReturnValue({
      getReaderDebt: mockGetReaderDebt,
      payDebt: mockPayDebt,
      isLoading: false,
      error: null,
      success: false,
      debtData: DEBT_PENDING_01,
    });

    const user = userEvent.setup();
    render(<DebtPaymentForm />);

    const idInput = screen.getByLabelText(/Número de Identificación/i);
    await user.type(idInput, 'R-2301');
    await user.click(screen.getByRole('button', { name: /Buscar Deuda/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Confirmar Pago/i })).toBeInTheDocument();
    });
  });

  test('TC-HU06-01 — calls payDebt with correct id_debt on confirm', async () => {
    mockPayDebt.mockResolvedValue(DEBT_PENDING_01_PAID);

    useDebt.mockReturnValue({
      getReaderDebt: mockGetReaderDebt,
      payDebt: mockPayDebt,
      isLoading: false,
      error: null,
      success: false,
      debtData: DEBT_PENDING_01,
    });

    // Create modal-root for the portal
    const modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);

    const user = userEvent.setup();
    render(<DebtPaymentForm />);

    // Trigger search to show debt section
    const idInput = screen.getByLabelText(/Número de Identificación/i);
    await user.type(idInput, 'R-2301');
    await user.click(screen.getByRole('button', { name: /Buscar Deuda/i }));

    // Click the payment button to open modal
    const payBtn = await screen.findByRole('button', { name: /Confirmar Pago/i });
    await user.click(payBtn);

    // Find and click the confirm button inside the modal dialog
    const dialog = await screen.findByRole('dialog');
    const modalConfirmBtn = within(dialog).getByRole('button', { name: /Confirmar Pago/i });
    await user.click(modalConfirmBtn);

    expect(mockPayDebt).toHaveBeenCalledWith('D-6001');

    // Cleanup modal-root
    document.body.removeChild(modalRoot);
  });

  // ═══════════════════════════════════════════════════════════════
  // Mensaje de éxito / rehabilitación
  // ═══════════════════════════════════════════════════════════════
  test('displays success message after payment is completed', () => {
    useDebt.mockReturnValue({
      getReaderDebt: mockGetReaderDebt,
      payDebt: mockPayDebt,
      isLoading: false,
      error: null,
      success: true,
      debtData: DEBT_PENDING_01_PAID,
    });

    render(<DebtPaymentForm />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      /Pago registrado exitosamente.*rehabilitado/i
    );
  });

  // ═══════════════════════════════════════════════════════════════
  // Loading states
  // ═══════════════════════════════════════════════════════════════
  test('disables search button and fields while loading', () => {
    useDebt.mockReturnValue({
      getReaderDebt: mockGetReaderDebt,
      payDebt: mockPayDebt,
      isLoading: true,
      error: null,
      success: false,
      debtData: null,
    });

    render(<DebtPaymentForm />);

    expect(screen.getByLabelText(/Número de Identificación/i)).toBeDisabled();
    expect(screen.getByLabelText(/Tipo de Identificación/i)).toBeDisabled();
  });

  test('shows "Buscando..." text while loading', () => {
    useDebt.mockReturnValue({
      getReaderDebt: mockGetReaderDebt,
      payDebt: mockPayDebt,
      isLoading: true,
      error: null,
      success: false,
      debtData: null,
    });

    render(<DebtPaymentForm />);
    expect(screen.getByRole('button', { name: /Buscando/i })).toBeInTheDocument();
  });
});
