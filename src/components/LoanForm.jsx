import { useState, useCallback } from 'react';
import styles from './LoanForm.module.css';
import { useLoan } from '../hooks/useLoan.js';

/**
 * Calculates the loan due date based on current date and loan days
 * @param {number} days - Number of days for the loan (7, 14, 21)
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
function calculateDueDate(days) {
  const today = new Date();
  const dueDate = new Date(today.setDate(today.getDate() + days));
  return dueDate.toISOString().split('T')[0];
}

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

export default function LoanForm() {
  const { register, isLoading, error, success, loanData, reset } = useLoan();

  // Form fields
  const [idBook, setIdBook] = useState('');
  const [title, setTitle] = useState('');
  const [typeIdReader, setTypeIdReader] = useState('DNI');
  const [idReader, setIdReader] = useState('');
  const [nameReader, setNameReader] = useState('');
  const [loanDays, setLoanDays] = useState('7');

  // Calculated due date
  const dueDate = calculateDueDate(parseInt(loanDays, 10));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loanData = {
      id_book: idBook,
      title,
      type_id_reader: typeIdReader,
      id_reader: idReader,
      name_reader: nameReader,
      loan_days: loanDays
    };

    const result = await register(loanData);

    if (result) {
      // Clear form on success
      setIdBook('');
      setTitle('');
      setIdReader('');
      setNameReader('');
      setLoanDays('7');
    }
  };

  const handleReset = () => {
    reset();
    setIdBook('');
    setTitle('');
    setIdReader('');
    setNameReader('');
    setTypeIdReader('DNI');
    setLoanDays('7');
  };

  return (
    <div className={styles.formContainer}>
      <h2>Registrar Préstamo de Libro</h2>

      {error && (
        <div className={styles.alert} data-type="error" role="alert">
          {error}
        </div>
      )}

      {success && loanData && (
        <div className={styles.alert} data-type="success" role="alert">
          ✓ Préstamo registrado exitosamente
          {loanData.loan_id && <p>ID del préstamo: {loanData.loan_id}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <fieldset>
          <legend>Información del Libro</legend>

          <div className={styles.formGroup}>
            <label htmlFor="idBook">ID del Libro *</label>
            <input
              id="idBook"
              type="text"
              value={idBook}
              onChange={(e) => setIdBook(e.target.value)}
              required
              placeholder="Ej: BOOK-001"
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title">Título del Libro *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ej: Cien años de soledad"
              disabled={isLoading}
            />
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
              disabled={isLoading}
            >
              <option value="CI">Cédula de Identidad (CI)</option>
              <option value="DNI">Documento Nacional de Identificación (DNI)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="idReader">Número de Identificación *</label>
            <input
              id="idReader"
              type="text"
              value={idReader}
              onChange={(e) => setIdReader(e.target.value)}
              required
              placeholder="Ej: 1023456789"
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="nameReader">Nombre del Lector *</label>
            <input
              id="nameReader"
              type="text"
              value={nameReader}
              onChange={(e) => setNameReader(e.target.value)}
              required
              placeholder="Ej: Juan García"
              disabled={isLoading}
            />
          </div>
        </fieldset>

        <fieldset>
          <legend>Información del Préstamo</legend>

          <div className={styles.formGroup}>
            <label htmlFor="loanDays">Plazo del Préstamo (días) *</label>
            <select
              id="loanDays"
              value={loanDays}
              onChange={(e) => setLoanDays(e.target.value)}
              disabled={isLoading}
            >
              <option value="7">7 días</option>
              <option value="14">14 días</option>
              <option value="21">21 días</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Fecha Límite de Devolución</label>
            <div className={styles.dueDateDisplay}>
              <span className={styles.dateValue}>{formatDisplayDate(dueDate)}</span>
              <span className={styles.dateInfo}>(Calculado automáticamente)</span>
            </div>
          </div>
        </fieldset>

        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? 'Registrando...' : 'Registrar Préstamo'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className={styles.resetBtn}
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}
