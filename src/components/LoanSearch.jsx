import { useState } from 'react';
import { Search, CircleCheck, CircleX, BookOpen, AlertCircle } from 'lucide-react';
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
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasSearched(false);
    setValidationError('');

    if (!bookName.trim()) {
      setValidationError('Ingresa el nombre del libro para buscar.');
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
    setValidationError('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ON_LOAN':
        return (
          <span className={`${styles.statusBadge} ${styles.statusOnLoan}`}>
            <CircleX size={16} aria-hidden={true} />
            Préstamo Activo
          </span>
        );
      case 'RETURNED':
        return (
          <span className={`${styles.statusBadge} ${styles.statusAvailable}`}>
            <CircleCheck size={16} aria-hidden={true} />
            Disponible
          </span>
        );
      default:
        return (
          <span className={`${styles.statusBadge} ${styles.statusNoHistory}`}>
            <BookOpen size={16} aria-hidden={true} />
            Sin historial — Disponible
          </span>
        );
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Consultar Disponibilidad de Libro</h2>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        <div className={styles.formGroup}>
          <label htmlFor="bookName" className={styles.label}>Nombre del Libro</label>
          <input
            id="bookName"
            type="text"
            value={bookName}
            onChange={(e) => { setBookName(e.target.value); setValidationError(''); }}
            placeholder="ej. Don Quijote"
            disabled={isLoading}
            className={styles.input}
            aria-describedby={validationError ? 'bookName-error' : undefined}
          />
          {validationError && (
            <span id="bookName-error" className={styles.fieldError}>{validationError}</span>
          )}
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.primaryBtn} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className={styles.spinner} aria-hidden="true"></span>
                Buscando...
              </>
            ) : (
              <>
                <Search size={16} aria-hidden={true} />
                Buscar
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className={styles.secondaryBtn}
          >
            Limpiar
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className={styles.alertError} role="alert">
          <AlertCircle size={20} aria-hidden={true} />
          {error}
        </div>
      )}

      {/* Loading announcement  */}
      {isLoading && (
        <div aria-live="polite" className={styles.srOnly}>Buscando libro...</div>
      )}

      {/* Search Results — Table */}
      {hasSearched && searchResults && searchResults.length > 0 && (
        <div className={styles.resultsSection}>
          <p className={styles.resultsSummary}>
            {searchResults.length} copia(s) encontrada(s) para '{bookName}'
          </p>
          <table className={styles.resultsTable}>
            <thead>
              <tr>
                <th scope="col">ID Copia</th>
                <th scope="col" className={styles.alignRight}>ID Préstamo</th>
                <th scope="col" className={styles.alignCenter}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((result) => (
                <tr key={result.id_book}>
                  <td className={styles.codeCell}>{result.id_book}</td>
                  <td className={`${styles.codeCell} ${styles.alignRight}`}>
                    {result.loan_id ?? '—'}
                  </td>
                  <td className={styles.alignCenter}>{getStatusBadge(result.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* No Results Message */}
      {hasSearched && searchResults && searchResults.length === 0 && (
        <div className={styles.emptyState}>
          <BookOpen size={48} aria-hidden={true} className={styles.emptyIcon} />
          <h3 className={styles.emptyHeading}>Sin resultados para '{bookName}'</h3>
          <p className={styles.emptyText}>
            No se encontraron libros con ese nombre. Verifica el nombre e intenta de nuevo.
          </p>
        </div>
      )}
    </div>
  );
}
