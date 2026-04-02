/**
 * Unit Tests — ReturnForm component
 * HU-03: Registrar devolución de un libro dentro del plazo
 *
 * Alineado con TEST_CASES.md y Gherkin QA:
 *  - TC-HU03-01: Formulario envía datos correctos → éxito mostrado
 *  - TC-HU03-02: Devolución en fecha exacta → éxito sin deuda
 *  - TC-HU03-03: Error LOAN_NOT_FOUND → mensaje de error
 *  - TC-HU03-04: Error ALREADY_RETURNED → mensaje de error
 *  - Render: campos, fieldsets, botones presentes
 *  - Interacción: submit, reset, validaciones de fecha
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

describe('ReturnForm — render (HU-03)', () => {
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

  // ─── Render: título del formulario ─────────────────────────────
  test('renders form title', () => {
    render(<ReturnForm />);
    expect(screen.getByText('Registrar Devolución de Libro')).toBeInTheDocument();
  });

  // ─── Render: campos del libro ──────────────────────────────────
  test('renders book fields (id and title)', () => {
    render(<ReturnForm />);
    expect(screen.getByPlaceholderText('Ej: BOOK-001')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Cien años de soledad')).toBeInTheDocument();
  });

  // ─── Render: campo de fecha de devolución ──────────────────────
  test('renders date return field', () => {
    render(<ReturnForm />);
    expect(screen.getByLabelText(/Fecha de Devolución/i)).toBeInTheDocument();
  });

  // ─── Render: campos del lector ─────────────────────────────────
  test('renders reader fields', () => {
    render(<ReturnForm />);
    expect(screen.getByLabelText(/Tipo de Identificación/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: 1023456789')).toBeInTheDocument();
  });

  // ─── Render: campo base de multa Fibonacci ─────────────────────
  test('renders base fib amount field', () => {
    render(<ReturnForm />);
    expect(screen.getByLabelText(/Base de Multa Fibonacci/i)).toBeInTheDocument();
  });

  // ─── Render: botones submit y reset ────────────────────────────
  test('renders submit and reset buttons', () => {
    render(<ReturnForm />);
    expect(screen.getByRole('button', { name: /Registrar Devolución/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Limpiar/i })).toBeInTheDocument();
  });

  // ─── Render: type_id_reader default es DNI ────────────────────
  test('defaults type_id_reader to CI', () => {
    render(<ReturnForm />);
    const select = screen.getByLabelText(/Tipo de Identificación/i);
    expect(select.value).toBe('CI');
  });

  // ─── Render: title disabled when idBook is empty ──────────────
  test('title input is disabled when idBook is empty', () => {
    render(<ReturnForm />);
    const titleInput = screen.getByPlaceholderText('Ej: Cien años de soledad');
    expect(titleInput).toBeDisabled();
  });
});

describe('ReturnForm — interactions (HU-03)', () => {
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

  // ─── TC-HU03-01: Submit sends correct payload ─────────────────
  test('TC-HU03-01 — submits return form with correct data', async () => {
    mockReturnLoan.mockResolvedValue({ state: 'RETURNED' });
    const user = userEvent.setup();

    render(<ReturnForm />);

    await user.type(screen.getByPlaceholderText('Ej: BOOK-001'), 'B-1101');
    await user.type(screen.getByLabelText(/Fecha de Devolución/i), '2026-03-25');
    await user.selectOptions(screen.getByLabelText(/Tipo de Identificación/i), 'CI');
    await user.type(screen.getByPlaceholderText('Ej: 1023456789'), 'R-2101');

    await user.click(screen.getByRole('button', { name: /Registrar Devolución/i }));

    await waitFor(() => {
      expect(mockReturnLoan).toHaveBeenCalledTimes(1);
    });

    const calledWith = mockReturnLoan.mock.calls[0][0];
    expect(calledWith.id_book).toBe('B-1101');
    expect(calledWith.date_return).toBe('2026-03-25');
    expect(calledWith.type_id_reader).toBe('CI');
    expect(calledWith.id_reader).toBe('R-2101');
  });

  // ─── Éxito muestra mensaje ─────────────────────────────────────
  test('displays success message after successful return', () => {
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
  });

  // ─── TC-HU03-03: Error LOAN_NOT_FOUND mostrado ────────────────
  test('TC-HU03-03 — displays error message for LOAN_NOT_FOUND', () => {
    useLoan.mockReturnValue({
      returnLoan: mockReturnLoan,
      isLoading: false,
      error: 'Loan not found',
      success: false,
      loanData: null,
      reset: mockReset,
    });

    render(<ReturnForm />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Loan not found')).toBeInTheDocument();
  });

  // ─── TC-HU03-04: Error ALREADY_RETURNED mostrado ──────────────
  test('TC-HU03-04 — displays error message for ALREADY_RETURNED', () => {
    useLoan.mockReturnValue({
      returnLoan: mockReturnLoan,
      isLoading: false,
      error: 'This loan has already been returned',
      success: false,
      loanData: null,
      reset: mockReset,
    });

    render(<ReturnForm />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('This loan has already been returned')).toBeInTheDocument();
  });

  // ─── Reset button limpia el formulario ─────────────────────────
  test('reset button calls reset and clears form', async () => {
    const user = userEvent.setup();
    render(<ReturnForm />);

    await user.type(screen.getByPlaceholderText('Ej: BOOK-001'), 'B-1101');
    await user.click(screen.getByRole('button', { name: /Limpiar/i }));

    expect(mockReset).toHaveBeenCalled();
    expect(screen.getByPlaceholderText('Ej: BOOK-001').value).toBe('');
  });

  // ─── Loading state desactiva botón submit ──────────────────────
  test('disables submit button when isLoading=true', () => {
    useLoan.mockReturnValue({
      returnLoan: mockReturnLoan,
      isLoading: true,
      error: null,
      success: false,
      loanData: null,
      reset: mockReset,
    });

    render(<ReturnForm />);

    const submitButton = screen.getByRole('button', { name: /Registrando/i });
    expect(submitButton).toBeDisabled();
  });

  // ─── Title field se habilita cuando idBook tiene valor ─────────
  test('title input becomes enabled when idBook has value', async () => {
    const user = userEvent.setup();
    render(<ReturnForm />);

    const titleInput = screen.getByPlaceholderText('Ej: Cien años de soledad');
    expect(titleInput).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Ej: BOOK-001'), 'B-1101');

    expect(titleInput).not.toBeDisabled();
  });

  // ─── Validación: search criteria requiere id_book o id_reader ──
  test('shows search error when neither id_book nor id_reader provided', async () => {
    const user = userEvent.setup();
    render(<ReturnForm />);

    await user.type(screen.getByLabelText(/Fecha de Devolución/i), '2026-03-25');
    await user.click(screen.getByRole('button', { name: /Registrar Devolución/i }));

    await waitFor(() => {
      const errors = screen.getAllByText(/Ingresa al menos el ID del libro o la identificación del lector/i);
      expect(errors.length).toBeGreaterThanOrEqual(1);
    });

    expect(mockReturnLoan).not.toHaveBeenCalled();
  });
});
