import { useState } from 'react';
import styles from './LoanSearch.module.css';
import { useLoan } from '../hooks/useLoan.js';

/**
 * LoanSearch Component
 * Allows searching for book availability and loan status
 * @returns {JSX.Element} Book search form and results
 */
export default function LoanSearch() {
  const { searchByName, isLoading, error, searchResults } = useLoan();
  const [bookName, setBookName] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSearched(false);

    if (!bookName.trim()) {
      return;
    }

    const result = await searchByName(bookName);
    setHasSearched(true);

    if (!result) {
      // Error already set by hook
    }
  };

  const handleClear = () => {
    setBookName('');
    setHasSearched(false);
  };

  /**
   * Determine book status display text
   * @param {string} status - Book status (ON_LOAN, RETURNED)
   * @returns {string} Display text
   */
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'ON_LOAN':
        return 'Préstamo Activo';
      case 'RETURNED':
        return 'Disponible';
      default:
        return status || 'Desconocido';
    }
  };

  /**
   * Determine status badge class
   * @param {string} status - Book status
   * @returns {string} CSS class name
   */
  const getStatusClass = (status) => {
    switch (status) {
      case 'ON_LOAN':
        return styles.statusOnLoan;
      case 'RETURNED':
        return styles.statusAvailable;
      default:
        return styles.statusUnknown;
    }
  };

  return (
    <div className={styles.container}>
      <h2>Consultar Disponibilidad de Libro</h2>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="bookName">Nombre del Libro *</label>
          <input
            id="bookName"
            type="text"
            value={bookName}
            onChange={(e) => setBookName(e.target.value)}
            placeholder="Ej: La Casa de los Espíritus"
            disabled={isLoading}
            required
          />
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" disabled={isLoading || !bookName.trim()}>
            {isLoading ? 'Buscando...' : 'Buscar'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className={styles.secondaryButton}
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className={styles.alert} data-type="error" role="alert">
          {error}
        </div>
      )}

      {/* Search Results */}
      {hasSearched && searchResults && searchResults.length > 0 && (
        <div className={styles.resultsContainer}>
          <h3>Resultados de la Búsqueda</h3>
          <div className={styles.resultsList}>
            {searchResults.map((result) => (
              <div key={result.id} className={styles.resultCard}>
                <div className={styles.resultHeader}>
                  <h4>{result.name}</h4>
                  <span className={`${styles.statusBadge} ${getStatusClass(result.status)}`}>
                    {getStatusDisplay(result.status)}
                  </span>
                </div>
                <div className={styles.resultDetails}>
                  <p>
                    <strong>ID:</strong> {result.id}
                  </p>
                  <p>
                    <strong>Estado:</strong>{' '}
                    {result.status === 'ON_LOAN' ? 'No disponible (préstamo activo)' : 'Disponible'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {hasSearched && searchResults && searchResults.length === 0 && (
        <div className={styles.alert} data-type="info">
          No se encontraron registros para "{bookName}". El libro no registra historial de
          préstamo y se considera disponible para préstamo.
        </div>
      )}
    </div>
  );
}
