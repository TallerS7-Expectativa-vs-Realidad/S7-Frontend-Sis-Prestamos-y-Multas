/**
 * Unit Tests — DebtPaymentPage
 * HU-06: Registrar pago total de multa y rehabilitar lector
 *
 * Cobertura:
 *  - Render completo: renders DebtPaymentForm within the page layout
 */

import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import DebtPaymentPage from '../../pages/DebtPaymentPage.jsx';

// Mock the useDebt hook used by DebtPaymentForm
vi.mock('../../hooks/useDebt.js', () => ({
  useDebt: vi.fn(() => ({
    getReaderDebt: vi.fn(),
    payDebt: vi.fn(),
    isLoading: false,
    error: null,
    success: false,
    debtData: null,
  })),
}));

describe('DebtPaymentPage — render (HU-06)', () => {
  test('renders DebtPaymentForm inside the page', () => {
    render(<DebtPaymentPage />);
    expect(screen.getByText('Registrar Pago de Multa')).toBeInTheDocument();
  });

  test('renders search section with reader fields', () => {
    render(<DebtPaymentPage />);
    expect(screen.getByText('Búsqueda de Lector')).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Identificación/i)).toBeInTheDocument();
  });
});
