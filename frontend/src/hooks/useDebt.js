import { useState } from 'react';
import {
  getReaderDebt as getReaderDebtService,
  payDebt as payDebtService,
} from '../services/debtService.js';

/**
 * Hook for managing debt queries and payments
 * @returns {Object} Hook state and methods
 */
export function useDebt() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [debtData, setDebtData] = useState(null);

  /**
   * Search for reader debt by filters
   * @param {Object} filters - Search filters
   * @returns {Promise} Debt data or null
   */
  const getReaderDebt = async (filters) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setDebtData(null);

    try {
      const response = await getReaderDebtService(filters);
      
      if (response) {
        setDebtData(response);
        setSuccess(true);
        return response;
      } else {
        setError('Lector no tiene deuda pendiente');
        return null;
      }
    } catch (err) {
      let errorMessage = 'Error desconocido';

      if (err.response) {
        const status = err.response.status;
        const errorCode = err.response.data?.code;

        if (status === 400) {
          if (errorCode === 'INVALID_QUERY') {
            errorMessage = 'Parámetros de búsqueda inválidos';
          } else {
            errorMessage = err.response.data?.message || 'Solicitud inválida';
          }
        } else if (status === 404) {
          if (errorCode === 'DEBT_NOT_FOUND') {
            errorMessage = 'Lector no tiene deuda pendiente';
          } else {
            errorMessage = err.response.data?.message || 'Deuda no encontrada';
          }
        } else {
          errorMessage = err.response.data?.message || `Error: ${status}`;
        }
      } else if (err.request) {
        errorMessage = 'Sin respuesta del servidor. Verifica tu conexión.';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register payment for a debt
   * @param {string} idDebt - Debt ID to pay
   * @returns {Promise} Updated debt data
   */
  const payDebt = async (idDebt) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await payDebtService(idDebt);
      setDebtData(response);
      setSuccess(true);
      return response;
    } catch (err) {
      let errorMessage = 'Error desconocido';

      if (err.response) {
        const status = err.response.status;
        const errorCode = err.response.data?.code;

        if (status === 404) {
          if (errorCode === 'DEBT_NOT_FOUND') {
            errorMessage = 'Deuda no encontrada';
          } else {
            errorMessage = err.response.data?.message || 'Deuda no encontrada';
          }
        } else if (status === 409) {
          if (errorCode === 'DEBT_ALREADY_PAID') {
            errorMessage = 'La deuda ya ha sido pagada';
          } else {
            errorMessage = err.response.data?.message || 'Error de conflicto';
          }
        } else {
          errorMessage = err.response.data?.message || `Error: ${status}`;
        }
      } else if (err.request) {
        errorMessage = 'Sin respuesta del servidor. Verifica tu conexión.';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    success,
    debtData,
    getReaderDebt,
    payDebt,
  };
}
