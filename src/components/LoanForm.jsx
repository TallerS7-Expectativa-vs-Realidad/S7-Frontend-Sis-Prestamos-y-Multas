import { useState, useRef } from 'react';
import { BookMarked, CircleX, AlertCircle } from 'lucide-react';
import styles from './LoanForm.module.css';
import { useLoan } from '../hooks/useLoan.js';

/**
 * Calculates the loan due date based on current date and loan days
 * @param {number} days - Number of days for the loan (7, 14, 21)
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
function calculateDueDate(days) {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setDate(today.getDate() + days);
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

const LOAN_DAY_OPTIONS = [
  { value: '7', label: '7 días', description: '1 semana' },
  { value: '14', label: '14 días', description: '2 semanas' },
  { value: '21', label: '21 días', description: '3 semanas' },
];

export default function LoanForm() {
  const { register, isLoading, error, success, loanData, reset } = useLoan();
  const idBookRef = useRef(null);

  // Form fields
  const [idBook, setIdBook] = useState('');
  const [title, setTitle] = useState('');
  const [typeIdReader, setTypeIdReader] = useState('DNI');
  const [idReader, setIdReader] = useState('');
  const [nameReader, setNameReader] = useState('');
  const [loanDays, setLoanDays] = useState('7');
  const [businessError, setBusinessError] = useState(null);

  // Calculated due date
  const dueDate = calculateDueDate(parseInt(loanDays, 10));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusinessError(null);

    const payload = {
      id_book: idBook,
      title,
      type_id_reader: typeIdReader,
      id_reader: idReader,
      name_reader: nameReader,
      loan_days: loanDays
    };

    const result = await register(payload);

    if (result) {
      // Clear form on success
      setIdBook('');
      setTitle('');
      setIdReader('');
      setNameReader('');
      setLoanDays('7');
      if (idBookRef.current) idBookRef.current.focus();
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
    setBusinessError(null);
    if (idBookRef.current) idBookRef.current.focus();
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>Registrar Préstamo de Libro</h2>

      {error && (
        <div className={styles.alertError} role="alert">
          <CircleX size={20} aria-hidden={true} />
          {error}
        </div>
      )}

      {success && loanData && (
        <div className={styles.alertSuccess} role="alert">
          Préstamo registrado exitosamente
          {loanData.loan_id && <p className={styles.alertDetail}>ID del préstamo: {loanData.loan_id}</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Información del Libro</legend>

          <div className={styles.formGroup}>
            <label htmlFor="idBook" className={styles.label}>ID del Libro *</label>
            <input
              ref={idBookRef}
              id="idBook"
              type="text"
              value={idBook}
              onChange={(e) => { setIdBook(e.target.value); setBusinessError(null); }}
              required
              placeholder="Ej: BOOK-001"
              disabled={isLoading}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Título del Libro *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ej: Cien años de soledad"
              disabled={isLoading}
              className={styles.input}
            />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Información del Lector</legend>

          <div className={styles.formGroup}>
            <label htmlFor="typeIdReader" className={styles.label}>Tipo de Identificación *</label>
            <select
              id="typeIdReader"
              value={typeIdReader}
              onChange={(e) => setTypeIdReader(e.target.value)}
              disabled={isLoading}
              className={styles.select}
            >
              <option value="CI">Cédula de Identidad (CI)</option>
              <option value="DNI">Documento Nacional de Identificación (DNI)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="idReader" className={styles.label}>Número de Identificación *</label>
            <input
              id="idReader"
              type="text"
              value={idReader}
              onChange={(e) => { setIdReader(e.target.value); setBusinessError(null); }}
              required
              placeholder="Ej: 1023456789"
              disabled={isLoading}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="nameReader" className={styles.label}>Nombre del Lector *</label>
            <input
              id="nameReader"
              type="text"
              value={nameReader}
              onChange={(e) => setNameReader(e.target.value)}
              required
              placeholder="Ej: Juan García"
              disabled={isLoading}
              className={styles.input}
            />
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Información del Préstamo</legend>

          <div className={styles.formGroup}>
            <fieldset className={styles.radioFieldset}>
              <legend className={styles.radioLegend}>Plazo del Préstamo *</legend>
              <div className={styles.radioGroup}>
                {LOAN_DAY_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`${styles.radioOption} ${loanDays === option.value ? styles.radioSelected : ''}`}
                  >
                    <input
                      type="radio"
                      name="loanDays"
                      value={option.value}
                      checked={loanDays === option.value}
                      onChange={(e) => setLoanDays(e.target.value)}
                      disabled={isLoading}
                      className={styles.radioInput}
                    />
                    <span className={styles.radioIndicator}></span>
                    <span className={styles.radioContent}>
                      <span className={styles.radioLabel}>{option.label}</span>
                      <span className={styles.radioDesc}>{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Fecha Límite de Devolución</label>
            <div className={styles.dueDateDisplay}>
              <span className={styles.dateValue}>{formatDisplayDate(dueDate)}</span>
              <span className={styles.dateInfo}>(Calculado automáticamente)</span>
            </div>
          </div>
        </fieldset>

        {businessError && (
          <div className={styles.businessAlert} role="alert">
            <AlertCircle size={20} aria-hidden={true} />
            {businessError}
          </div>
        )}

        <div className={styles.formActions}>
          <button
            type="submit"
            disabled={isLoading}
            className={styles.submitBtn}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} aria-hidden="true"></span>
                Registrando...
              </>
            ) : (
              <>
                <BookMarked size={16} aria-hidden={true} />
                Registrar Préstamo
              </>
            )}
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

      {isLoading && (
        <div aria-live="polite" className={styles.srOnly}>Registrando préstamo...</div>
      )}
    </div>
  );
}
