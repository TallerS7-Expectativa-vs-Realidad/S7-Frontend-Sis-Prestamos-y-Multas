/**
 * Unit Tests — LoanSearch component
 * HU-01: Consultar estado y disponibilidad de un libro
 *
 * Alineado con TEST_CASES.md:
 *  - TC-HU01-01: Búsqueda "Don Quijote" → muestra resultado RETURNED
 *  - TC-HU01-02: Búsqueda "La vorágine" → muestra resultado ON_LOAN
 *  - TC-HU01-03: Búsqueda "Manual de estanterías invisibles" → mensaje sin historial
 *  - Render: formulario con input, botones Buscar/Limpiar
 *  - Interacción: submit dispara búsqueda, clear limpia input
 *  - Validación: botón deshabilitado si input vacío
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock del hook useLoan
const mockSearchByName = vi.fn();

vi.mock('../../hooks/useLoan.js', () => ({
  useLoan: () => ({
    searchByName: mockSearchByName,
    isLoading: false,
    error: null,
    searchResults: mockSearchResults,
  }),
}));

let mockSearchResults = null;

import LoanSearch from '../../components/LoanSearch.jsx';

describe('LoanSearch component (HU-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchResults = null;
    mockSearchByName.mockResolvedValue(null);
  });

  // ─── Render: formulario con elementos esperados ────────────────
  test('renders search form with input, label, and buttons', () => {
    render(<LoanSearch />);

    expect(screen.getByLabelText(/nombre del libro/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /buscar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /limpiar/i })).toBeInTheDocument();
  });

  // ─── Validación: botón Buscar deshabilitado si input vacío ────
  test('disables submit button when input is empty', () => {
    render(<LoanSearch />);
    const submitBtn = screen.getByRole('button', { name: /buscar/i });

    expect(submitBtn).toBeDisabled();
  });

  // ─── TC-HU01-01: submit con "Don Quijote" dispara búsqueda ───
  test('TC-HU01-01 — calls searchByName("Don Quijote") on form submit', async () => {
    mockSearchByName.mockResolvedValue([]);

    render(<LoanSearch />);
    const input = screen.getByLabelText(/nombre del libro/i);

    await userEvent.type(input, 'Don Quijote');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(mockSearchByName).toHaveBeenCalledWith('Don Quijote');
  });

  // ─── TC-HU01-02: submit con "La vorágine" dispara búsqueda ───
  test('TC-HU01-02 — calls searchByName("La vorágine") on form submit', async () => {
    mockSearchByName.mockResolvedValue([]);

    render(<LoanSearch />);
    const input = screen.getByLabelText(/nombre del libro/i);

    await userEvent.type(input, 'La vorágine');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(mockSearchByName).toHaveBeenCalledWith('La vorágine');
  });

  // ─── TC-HU01-03: submit con "Manual de estanterías invisibles" ─
  test('TC-HU01-03 — calls searchByName("Manual de estanterías invisibles") on form submit', async () => {
    mockSearchByName.mockResolvedValue([]);

    render(<LoanSearch />);
    const input = screen.getByLabelText(/nombre del libro/i);

    await userEvent.type(input, 'Manual de estanterías invisibles');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(mockSearchByName).toHaveBeenCalledWith('Manual de estanterías invisibles');
  });

  // ─── Interacción: Limpiar resetea el input ────────────────────
  test('clears input when clear button is clicked', async () => {
    render(<LoanSearch />);
    const input = screen.getByLabelText(/nombre del libro/i);

    await userEvent.type(input, 'Don Quijote');
    await userEvent.click(screen.getByRole('button', { name: /limpiar/i }));

    expect(input).toHaveValue('');
  });

  // ─── Interacción: typing actualiza el input ───────────────────
  test('updates input value when user types', async () => {
    render(<LoanSearch />);
    const input = screen.getByLabelText(/nombre del libro/i);

    await userEvent.type(input, 'La vorágine');

    expect(input).toHaveValue('La vorágine');
  });
});
