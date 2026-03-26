import { useState } from 'react';
import { searchBookByName as searchBookByNameService, getOverdueLoans as getOverdueLoansService } from '../services/loanService.js';

/**
 * Hook for managing book loan search and availability
 * @returns {Object} Hook state and methods
 */
export function useLoan() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [overdueLoans, setOverdueLoans] = useState(null);

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

  return {
    searchByName,
    getOverdue,
    isLoading,
    error,
    searchResults,
    overdueLoans,
  };
}
