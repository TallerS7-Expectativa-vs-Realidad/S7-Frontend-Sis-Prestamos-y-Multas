import { useState } from 'react';
import styles from './ReturnForm.module.css';
import { useLoan } from '../hooks/useLoan.js';
import DebtSummary from './DebtSummary.jsx';

/**
 * Format date for display (DD/MM/YYYY)
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date
 */
function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * @returns {string} ISO date string
 */
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Validate that return date is not in the future
 * @param {string} dateStr - ISO date string
 * @returns {string} Error message or empty string if valid
 */
function validateReturnDate(dateStr) {
  if (!dateStr) {
    return 'Return date is required';
  }
  
  const returnDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  returnDate.setHours(0, 0, 0, 0);

  if (returnDate > today) {
    return 'Return date cannot be in the future';
  }

  return '';
}

/**
 * Validate search criteria for book return
 * @param {string} idBook - Book ID
 * @param {string} title - Book title
 * @param {string} idReader - Reader ID
 * @returns {string} Error message or empty string if valid
 */
function validateSearchCriteria(idBook, title, idReader) {
  // At least one of idBook or idReader must be provided
  if (!idBook && !idReader) {
    return 'Debe proporcionar ID del libro o ID del lector';
  }

  // If idBook is provided, title can be empty or have value
  // If idBook is NOT provided, title must be empty (not used)
  
  // If idBook is NOT provided but title has value, it's an error
  if (!idBook && title) {
    return 'El nombre del libro solo puede usarse si proporciona el ID del libro';
  }

  return '';
}

export default function ReturnForm() {
  const { returnLoan, isLoading, error, success, loanData, reset } = useLoan();

  // Form fields
  const [idBook, setIdBook] = useState('');
  const [title, setTitle] = useState('');
  const [dateReturn, setDateReturn] = useState('');
  const [typeIdReader, setTypeIdReader] = useState('DNI');
  const [idReader, setIdReader] = useState('');

  // Validation state
  const [dateError, setDateError] = useState('');
  const [searchError, setSearchError] = useState('');

  // Get max date (today)
  const maxDate = getTodayDate();

  const handleDateChange = (e) => {
    const value = e.target.value;
    setDateReturn(value);
    
    // Validate immediately
    const validationError = validateReturnDate(value);
    setDateError(validationError);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate date first
    const dateValidationError = validateReturnDate(dateReturn);
    if (dateValidationError) {
      setDateError(dateValidationError);
      return;
    }

    // Validate search criteria
    const searchValidationError = validateSearchCriteria(idBook, title, idReader);
    if (searchValidationError) {
      setSearchError(searchValidationError);
      return;
    }

    const returnData = {
      id_book: idBook || null,
      title: title || null,
      date_return: dateReturn,
      type_id_reader: typeIdReader,
      id_reader: idReader || null
    };

    const result = await returnLoan(returnData);

    if (result) {
      // Clear form on success
      setIdBook('');
      setTitle('');
      setDateReturn('');
      setIdReader('');
      setTypeIdReader('DNI');
      setDateError('');
      setSearchError('');
    }
  };

  const handleReset = () => {
    reset();
    setIdBook('');
    setTitle('');
    setDateReturn('');
    setIdReader('');
    setTypeIdReader('DNI');
    setDateError('');
    setSearchError('');
  };

  return (
    <div className={styles.formContainer}>
      <h2>Registrar Devolución de Libro</h2>

      {error && (
        <div className={styles.alert} data-type="error" role="alert">
          {error}
        </div>
      )}

      {success && loanData && (
        <div className={styles.alert} data-type="success" role="alert">
          <p>✓ Devolución registrada exitosamente</p>
          {loanData.loan_id && <p>ID del préstamo: {loanData.loan_id}</p>}
          {!loanData.days_late && <p>No hay multa por esta devolución.</p>}
        </div>
      )}

      {success && loanData && loanData.days_late && (
        <DebtSummary debt={loanData} />
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <fieldset>
          <legend>Información del Libro</legend>

          <div className={styles.formGroup}>
            <label htmlFor="idBook">ID del Libro (opcional si proporciona ID del lector)</label>
            <input
              id="idBook"
              type="text"
              value={idBook}
              onChange={(e) => setIdBook(e.target.value)}
              placeholder="Ej: BOOK-001"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title">
              Nombre del Libro 
              {idBook ? ' (opcional)' : ' (requerido si no proporciona ID del libro)'}
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: El señor de los anillos"
              disabled={!idBook}
            />
            {!idBook && title && (
              <span className={styles.fieldError}>
                El nombre solo se usa cuando especifica el ID del libro
              </span>
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend>Información de la Devolución</legend>

          <div className={styles.formGroup}>
            <label htmlFor="dateReturn">Fecha de Devolución *</label>
            <input
              id="dateReturn"
              type="date"
              value={dateReturn}
              onChange={handleDateChange}
              max={maxDate}
              required
            />
            {dateError && (
              <span className={styles.fieldError}>{dateError}</span>
            )}
            {dateReturn && !dateError && (
              <span className={styles.fieldHint}>
                Devolución en: {formatDisplayDate(dateReturn)}
              </span>
            )}
          </div>
        </fieldset>

        <fieldset>
          <legend>Información del Lector</legend>

          <div className={styles.formGroup}>
            <label htmlFor="typeIdReader">Tipo de Identificación *</label>
            <select
              id="typeIdReader"
              value={typeIdReader}
              onChange={(e) => setTypeIdReader(e.target.value)}
            >
              <option value="DNI">Documento Nacional de Identificación (DNI)</option>
              <option value="CI">Cédula de Identidad (CI)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="idReader">
              ID del Lector (opcional si proporciona ID del libro)
            </label>
            <input
              id="idReader"
              type="text"
              value={idReader}
              onChange={(e) => setIdReader(e.target.value)}
              placeholder="Ej: 1023456789"
            />
          </div>
        </fieldset>

        {searchError && (
          <div className={styles.alert} data-type="error" role="alert">
            {searchError}
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || !!dateError}
          >
            {isLoading ? 'Registrando...' : 'Registrar Devolución'}
          </button>
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleReset}
            disabled={isLoading}
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
