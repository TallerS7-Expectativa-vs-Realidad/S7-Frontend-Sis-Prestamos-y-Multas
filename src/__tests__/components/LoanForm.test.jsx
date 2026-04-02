/**
 * Unit Tests — LoanForm component
 * HU-02: Registrar préstamo de un libro a un lector habilitado
 *
 * Alineado con TEST_CASES.md:
 *  - TC-HU02-01: Formulario envía datos correctos → éxito mostrado
 *  - TC-HU02-02: Error BOOK_NOT_AVAILABLE → mensaje de error
 *  - TC-HU02-03: Error READER_HAS_DEBT → mensaje de error
 *  - TC-HU02-04: Error INVALID_LOAN_DAYS → mensaje de error
 *  - Render: campos, select, botones presentes
 *  - Interacción: submit, reset
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import LoanForm from '../../components/LoanForm.jsx';

// Mock the useLoan hook
const mockRegister = vi.fn();
const mockReset = vi.fn();

vi.mock('../../hooks/useLoan.js', () => ({
  useLoan: vi.fn(() => ({
    register: mockRegister,
    isLoading: false,
    error: null,
    success: false,
    loanData: null,
    reset: mockReset,
  })),
}));

import { useLoan } from '../../hooks/useLoan.js';

describe('LoanForm — render (HU-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLoan.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
      success: false,
      loanData: null,
      reset: mockReset,
    });
  });

  // ─── Render: título del formulario ─────────────────────────────
  test('renders form title', () => {
    render(<LoanForm />);
    expect(screen.getByText('Registrar Préstamo de Libro')).toBeInTheDocument();
  });

  // ─── Render: campos del libro ──────────────────────────────────
  test('renders book fields (id and title)', () => {
    render(<LoanForm />);
    expect(screen.getByLabelText(/ID del Libro/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Título del Libro/i)).toBeInTheDocument();
  });

  // ─── Render: campos del lector ─────────────────────────────────
  test('renders reader fields', () => {
    render(<LoanForm />);
    expect(screen.getByLabelText(/Tipo de Identificación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Identificación/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre del Lector/i)).toBeInTheDocument();
  });

  // ─── Render: radio group de plazo con opciones 7, 14, 21 ──────────
  test('renders loan days radio group with options 7, 14, 21', () => {
    render(<LoanForm />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    const values = radios.map((r) => r.value);
    expect(values).toEqual(['7', '14', '21']);
  });

  // ─── Render: fecha límite calculada automáticamente ────────────
  test('renders calculated due date', () => {
    render(<LoanForm />);
    expect(screen.getByText(/Calculado automáticamente/i)).toBeInTheDocument();
  });

  // ─── Render: botones submit y reset ────────────────────────────
  test('renders submit and reset buttons', () => {
    render(<LoanForm />);
    expect(screen.getByRole('button', { name: /Registrar Préstamo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Limpiar/i })).toBeInTheDocument();
  });

  // ─── Render: type_id_reader default es DNI ────────────────────
  test('defaults type_id_reader to DNI', () => {
    render(<LoanForm />);
    const select = screen.getByLabelText(/Tipo de Identificación/i);
    expect(select.value).toBe('DNI');
  });

  // ─── Render: loan_days default es 7 ───────────────────────────
  test('defaults loan_days to 7', () => {
    render(<LoanForm />);
    const radio7 = screen.getByRole('radio', { name: /7 días/ });
    expect(radio7).toBeChecked();
  });
});

describe('LoanForm — interactions (HU-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useLoan.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
      success: false,
      loanData: null,
      reset: mockReset,
    });
  });

  // ─── TC-HU02-01: Submit envía datos correctos al hook ──────────
  test('TC-HU02-01 — submits form with correct data to register()', async () => {
    mockRegister.mockResolvedValue({ loan_id: 1, state: 'ON_LOAN' });
    const user = userEvent.setup();

    render(<LoanForm />);

    await user.type(screen.getByLabelText(/ID del Libro/i), 'B-1001');
    await user.type(screen.getByLabelText(/Título del Libro/i), 'Cien años de soledad');
    await user.selectOptions(screen.getByLabelText(/Tipo de Identificación/i), 'CI');
    await user.type(screen.getByLabelText(/Número de Identificación/i), 'R-2001');
    await user.type(screen.getByLabelText(/Nombre del Lector/i), 'Ana Torres');
    // loan_days defaults to 7

    await user.click(screen.getByRole('button', { name: /Registrar Préstamo/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        id_book: 'B-1001',
        title: 'Cien años de soledad',
        type_id_reader: 'CI',
        id_reader: 'R-2001',
        name_reader: 'Ana Torres',
        loan_days: '7',
      });
    });
  });

  // ─── TC-HU02-01: Submit con loan_days=14 ──────────────────────
  test('TC-HU02-01 — submits form with loan_days=14', async () => {
    mockRegister.mockResolvedValue({ loan_id: 2 });
    const user = userEvent.setup();

    render(<LoanForm />);

    await user.type(screen.getByLabelText(/ID del Libro/i), 'B-1001');
    await user.type(screen.getByLabelText(/Título del Libro/i), 'Cien años de soledad');
    await user.type(screen.getByLabelText(/Número de Identificación/i), 'R-2001');
    await user.type(screen.getByLabelText(/Nombre del Lector/i), 'Ana Torres');
    await user.click(screen.getByRole('radio', { name: /14 días/ }));

    await user.click(screen.getByRole('button', { name: /Registrar Préstamo/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({ loan_days: '14' })
      );
    });
  });

  // ─── Limpiar llama a reset ─────────────────────────────────────
  test('clicking Limpiar calls reset()', async () => {
    const user = userEvent.setup();

    render(<LoanForm />);

    await user.click(screen.getByRole('button', { name: /Limpiar/i }));

    expect(mockReset).toHaveBeenCalled();
  });

  // ─── Éxito limpia los campos del formulario ───────────────────
  test('TC-HU02-01 — clears form fields on successful registration', async () => {
    mockRegister.mockResolvedValue({ loan_id: 1, state: 'ON_LOAN' });
    const user = userEvent.setup();

    render(<LoanForm />);

    await user.type(screen.getByLabelText(/ID del Libro/i), 'B-1001');
    await user.type(screen.getByLabelText(/Título del Libro/i), 'Cien años de soledad');
    await user.type(screen.getByLabelText(/Número de Identificación/i), 'R-2001');
    await user.type(screen.getByLabelText(/Nombre del Lector/i), 'Ana Torres');

    await user.click(screen.getByRole('button', { name: /Registrar Préstamo/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/ID del Libro/i)).toHaveValue('');
      expect(screen.getByLabelText(/Título del Libro/i)).toHaveValue('');
      expect(screen.getByLabelText(/Número de Identificación/i)).toHaveValue('');
      expect(screen.getByLabelText(/Nombre del Lector/i)).toHaveValue('');
    });
  });
});

describe('LoanForm — error and success display (HU-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── TC-HU02-02: Muestra error de libro no disponible ─────────
  test('TC-HU02-02 — displays error alert when error is set', () => {
    useLoan.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: 'The book is not available for loan',
      success: false,
      loanData: null,
      reset: mockReset,
    });

    render(<LoanForm />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('The book is not available for loan');
  });

  // ─── TC-HU02-03: Muestra error de lector con deuda ────────────
  test('TC-HU02-03 — displays reader has debt error', () => {
    useLoan.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: 'Reader has pending debt and cannot borrow books',
      success: false,
      loanData: null,
      reset: mockReset,
    });

    render(<LoanForm />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Reader has pending debt and cannot borrow books'
    );
  });

  // ─── TC-HU02-01: Muestra éxito con loan_id ────────────────────
  test('TC-HU02-01 — displays success alert with loan_id when created', () => {
    useLoan.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null,
      success: true,
      loanData: { loan_id: 1, state: 'ON_LOAN' },
      reset: mockReset,
    });

    render(<LoanForm />);

    const alerts = screen.getAllByRole('alert');
    const successAlert = alerts.find(a => a.textContent.includes('Préstamo registrado exitosamente'));
    expect(successAlert).toBeInTheDocument();
    expect(successAlert).toHaveTextContent(/Préstamo registrado exitosamente/i);
    expect(successAlert).toHaveTextContent('1');
  });

  // ─── Loading: botón deshabilitado y texto cambiado ─────────────
  test('disables submit button and shows loading text when isLoading', () => {
    useLoan.mockReturnValue({
      register: mockRegister,
      isLoading: true,
      error: null,
      success: false,
      loanData: null,
      reset: mockReset,
    });

    render(<LoanForm />);

    const submitBtn = screen.getByRole('button', { name: /Registrando/i });
    expect(submitBtn).toBeDisabled();
  });

  // ─── Loading: inputs deshabilitados ────────────────────────────
  test('disables all inputs when isLoading', () => {
    useLoan.mockReturnValue({
      register: mockRegister,
      isLoading: true,
      error: null,
      success: false,
      loanData: null,
      reset: mockReset,
    });

    render(<LoanForm />);

    expect(screen.getByLabelText(/ID del Libro/i)).toBeDisabled();
    expect(screen.getByLabelText(/Título del Libro/i)).toBeDisabled();
    expect(screen.getByLabelText(/Número de Identificación/i)).toBeDisabled();
    expect(screen.getByLabelText(/Nombre del Lector/i)).toBeDisabled();
  });
});
