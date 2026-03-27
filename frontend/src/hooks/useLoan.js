import { useState } from 'react';
import {
  createLoan,
  returnLoan as returnLoanService,
  searchLoanByName,
  searchBookByName as searchBookByNameService, 
  getOverdueLoans as getOverdueLoansService
} from '../services/loanService.js';

/**
 * Hook for managing book loan search and availability
 * @returns {Object} Hook state and methods
 */
export function useLoan() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [overdueLoans, setOverdueLoans] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loanData, setLoanData] = useState(null);

  /**
   * Search for a book by name
   * @param {string} name - Book name to search
   * @returns {Promise} Search results or null on error
   */
  const searchByName = async (name) => {
    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const results = await searchBookByNameService(name);
      setSearchResults(results);
      return results;
    } catch (err) {
      let errorMessage = 'Error desconocido';

      if (err.message === 'INVALID_NAME') {
        errorMessage = 'Nombre de libro inválido o vacío';
      } else if (err.response?.status === 404) {
        errorMessage = 'Libro no encontrado en el historial de préstamos';
      } else if (err.response?.status === 500) {
        errorMessage = 'Error del servidor al buscar el libro';
      } else {
        errorMessage = err.response?.data?.message || err.message || 'Error al buscar el libro';
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await createLoan(data);
      setLoanData(response);
      setSuccess(true);
      return response;
    } catch (err) {
      let errorMessage = 'Unknown error occurred';

      if (err.response) {
        const status = err.response.status;
        const errorCode = err.response.data?.code;

        if (status === 400) {
          if (errorCode === 'INVALID_LOAN_DAYS') {
            errorMessage = 'Loan days must be 7, 14, or 21';
          } else if (errorCode === 'INVALID_PAYLOAD') {
            errorMessage = 'Invalid data provided';
          } else {
            errorMessage = err.response.data?.message || 'Invalid request';
          }
        } else if (status === 409) {
          if (errorCode === 'BOOK_NOT_AVAILABLE') {
            errorMessage = 'The book is not available for loan';
          } else if (errorCode === 'READER_HAS_DEBT') {
            errorMessage = 'Reader has pending debt and cannot borrow books';
          } else {
            errorMessage = err.response.data?.message || 'Conflict error';
          }
        } else {
          errorMessage = err.response.data?.message || `Error: ${status}`;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
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
   * Fetch list of overdue loans
   * @returns {Promise} Array of overdue loans or empty array
   */
  const getOverdue = async () => {
    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const loans = await getOverdueLoansService();
      setOverdueLoans(loans);
      return loans;
    } catch (err) {
      let errorMessage = 'Error desconocido';

      if (err.response?.status === 500) {
        errorMessage = 'Error del servidor al obtener préstamos vencidos';
      } else {
        errorMessage = err.response?.data?.message || err.message || 'Error al obtener préstamos vencidos';
      }

      setError(errorMessage);
      return [];
      } finally {
      setIsLoading(false);
    }
  };

   const returnLoan = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await returnLoanService(data);
      setLoanData(response);
      setSuccess(true);
      return response;
    } catch (err) {
      let errorMessage = 'Unknown error occurred';

      if (err.response) {
        const status = err.response.status;
        const errorCode = err.response.data?.code;

        if (status === 400) {
          if (errorCode === 'INVALID_PAYLOAD') {
            errorMessage = 'Invalid data provided';
          } else {
            errorMessage = err.response.data?.message || 'Invalid request';
          }
        } else if (status === 404) {
          if (errorCode === 'LOAN_NOT_FOUND') {
            errorMessage = 'Loan not found';
          } else {
            errorMessage = err.response.data?.message || 'Loan not found';
          }
        } else if (status === 409) {
          if (errorCode === 'ALREADY_RETURNED') {
            errorMessage = 'This loan has already been returned';
          } else {
            errorMessage = err.response.data?.message || 'Conflict error';
          }
        } else {
          errorMessage = err.response.data?.message || `Error: ${status}`;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setLoanData(null);
  };

  const searchByName2 = async (name) => {
    setIsLoading(true);
    setError(null);

    try {
      return await searchLoanByName(name);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'No fue posible consultar la disponibilidad del libro'
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchByName,
    searchByName2,
    getOverdue,
    register,
    returnLoan,
    reset,
    isLoading,
    error,
    searchResults,
    overdueLoans,
    success,
    loanData
  };
}
