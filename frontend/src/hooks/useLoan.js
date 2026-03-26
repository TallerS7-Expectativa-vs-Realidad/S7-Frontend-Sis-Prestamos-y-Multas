import { useState } from 'react';
import { searchBookByName as searchBookByNameService } from '../services/loanService.js';

/**
 * Hook for managing book loan search and availability
 * @returns {Object} Hook state and methods
 */
export function useLoan() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

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

  return {
    searchByName,
    isLoading,
    error,
    searchResults,
  };
}
