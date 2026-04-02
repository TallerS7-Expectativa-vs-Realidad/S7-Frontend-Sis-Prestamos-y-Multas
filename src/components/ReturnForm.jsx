import { useState, useRef } from 'react';
import { BookOpen, Search, AlertCircle, CheckCircle } from 'lucide-react';
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

export default function ReturnForm() {
  const { returnLoan, isLoading, error, success, loanData, reset } = useLoan();
  const idBookRef = useRef(null);

  // Form fields
  const [idBook, setIdBook] = useState('');
  const [title, setTitle] = useState('');
  const [typeIdReader, setTypeIdReader] = useState('CI');
  const [idReader, setIdReader] = useState('');
  const [dateReturn, setDateReturn] = useState('');
  const [baseFibAmount, setBaseFibAmount] = useState('1');

  // Validation state
  const [dateError, setDateError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [baseFibError, setBaseFibError] = useState('');
  const [businessError, setBusinessError] = useState(null);

  const maxDate = getTodayDate();

  const handleDateChange = (e) => {
    const value = e.target.value;
    setDateReturn(value);
    if (value) {
      const returnDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      returnDate.setHours(0, 0, 0, 0);
      if (returnDate > today) {
        setDateError('La fecha de devolución no puede ser posterior a hoy.');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  const handleBaseFibChange = (e) => {
    setBaseFibAmount(e.target.value);
    setBaseFibError('');
  };

  const handleBaseFibBlur = () => {
    if (!baseFibAmount || baseFibAmount.trim() === '') {
      setBaseFibError('');
      return;
    }
    const numValue = parseFloat(baseFibAmount);
    if (isNaN(numValue)) {
      setBaseFibError('Debe ser un número válido.');
      return;
    }
    if (numValue < 0.01) {
      setBaseFibError('El valor debe ser igual o mayor a 0.01.');
      return;
    }
    setBaseFibAmount(numValue.toFixed(2));
    setBaseFibError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusinessError(null);
    setSearchError('');

    // Validate date
    if (!dateReturn) {
      setDateError('Este campo es obligatorio.');
      return;
    }
    const returnDate = new Date(dateReturn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    returnDate.setHours(0, 0, 0, 0);
    if (returnDate > today) {
      setDateError('La fecha de devolución no puede ser posterior a hoy.');
      return;
    }

    // Validate baseFibAmount
    if (!baseFibAmount || baseFibAmount.trim() === '') {
      setBaseFibError('La multa base es obligatoria.');
      return;
    }
    const numBaseFib = parseFloat(baseFibAmount);
    if (isNaN(numBaseFib)) {
      setBaseFibError('Debe ser un número válido.');
      return;
    }
    if (numBaseFib < 0.01) {
      setBaseFibError('El valor debe ser igual o mayor a 0.01.');
      return;
    }

    // Validate smart-search: at least idBook or idReader
    if (!idBook.trim() && !idReader.trim()) {
      setSearchError('Ingresa al menos el ID del libro o la identificación del lector.');
      return;
    }

    const returnData = {
      id_book: idBook || null,
      title: title || null,
      date_return: dateReturn,
      type_id_reader: typeIdReader,
      id_reader: idReader || null,
      base_fib_amount: numBaseFib,
    };

    const result = await returnLoan(returnData);

    if (result && (!result.days_late || result.days_late === 0)) {
      // On-time return: reset form
      setIdBook('');
      setTitle('');
      setDateReturn('');
      setIdReader('');
      setTypeIdReader('CI');
      setBaseFibAmount('1');
      setDateError('');
      setSearchError('');
      setBaseFibError('');
      if (idBookRef.current) idBookRef.current.focus();
    }
    // Late return: do NOT reset — show DebtSummary
  };

  const handleReset = () => {
    reset();
    setIdBook('');
    setTitle('');
    setDateReturn('');
    setIdReader('');
    setTypeIdReader('CI');
    setBaseFibAmount('1');
    setDateError('');
    setSearchError('');
    setBaseFibError('');
    setBusinessError(null);
    if (idBookRef.current) idBookRef.current.focus();
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>Registrar Devolución de Libro</h2>

      {error && (
        <div className={styles.alertError} role="alert">
          <AlertCircle size={20} aria-hidden={true} />
          {error}
        </div>
      )}

      {success && loanData && !loanData.days_late && (
        <div className={styles.alertSuccess} role="alert">
          <CheckCircle size={20} aria-hidden={true} />
          <div>
            <p>Devolución registrada exitosamente.</p>
            {loanData.loan_id && <p className={styles.alertDetail}>ID del préstamo: {loanData.loan_id}</p>}
            <p className={styles.alertDetail}>No se generó multa.</p>
          </div>
        </div>
      )}

      {success && loanData && loanData.days_late > 0 && (
        <div className={styles.alertSuccess} role="alert">
          <CheckCircle size={20} aria-hidden={true} />
          <div>
            <p>Devolución registrada exitosamente.</p>
            {loanData.loan_id && <p className={styles.alertDetail}>ID del préstamo: {loanData.loan_id}</p>}
          </div>
        </div>
      )}

      {success && loanData && loanData.days_late > 0 && (
        <DebtSummary debt={loanData} />
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Identificación del Préstamo</legend>
          <p className={styles.helperText}>
            <Search size={16} aria-hidden={true} />
            Ingresa al menos el ID del libro o la identificación del lector para localizar el préstamo.
          </p>

          <div className={styles.formGroup}>
            <label htmlFor="idBook" className={styles.label}>ID del Libro</label>
            <input
              ref={idBookRef}
              id="idBook"
              type="text"
              value={idBook}
              onChange={(e) => { setIdBook(e.target.value); setBusinessError(null); setSearchError(''); }}
              placeholder="Ej: BOOK-001"
              className={styles.input}
              disabled={isLoading}
            />
            {searchError && !idReader.trim() && (
              <span className={styles.fieldError} id="idBook-error">{searchError}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>Título del Libro</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Cien años de soledad"
              disabled={!idBook || isLoading}
              className={styles.input}
            />
            <span className={styles.hint}>Opcional. Refina la búsqueda si hay múltiples copias.</span>
          </div>

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
            <label htmlFor="idReader" className={styles.label}>Número de Identificación del Lector</label>
            <input
              id="idReader"
              type="text"
              value={idReader}
              onChange={(e) => { setIdReader(e.target.value); setBusinessError(null); setSearchError(''); }}
              placeholder="Ej: 1023456789"
              disabled={isLoading}
              className={styles.input}
            />
            {searchError && !idBook.trim() && (
              <span className={styles.fieldError} id="idReader-error">{searchError}</span>
            )}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Información de Devolución</legend>

          <div className={styles.formGroup}>
            <label htmlFor="dateReturn" className={styles.label}>Fecha de Devolución *</label>
            <input
              id="dateReturn"
              type="date"
              value={dateReturn}
              onChange={handleDateChange}
              max={maxDate}
              required
              className={styles.input}
              disabled={isLoading}
              aria-describedby={dateError ? 'dateReturn-error' : undefined}
            />
            {dateError && (
              <span className={styles.fieldError} id="dateReturn-error">{dateError}</span>
            )}
            {dateReturn && !dateError && (
              <span className={styles.hint}>
                Devolución en: {formatDisplayDate(dateReturn)}
              </span>
            )}
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Configuración de Multa</legend>

          <div className={styles.formGroup}>
            <label htmlFor="baseFibAmount" className={styles.label}>Base de Multa Fibonacci (unidad monetaria) *</label>
            <input
              id="baseFibAmount"
              type="number"
              value={baseFibAmount}
              onChange={handleBaseFibChange}
              onBlur={handleBaseFibBlur}
              placeholder="Ej: 1.00"
              min="0.01"
              step="0.01"
              className={styles.input}
              disabled={isLoading}
              aria-describedby={baseFibError ? 'baseFibAmount-error' : 'baseFibAmount-hint'}
            />
            {baseFibError && (
              <span className={styles.fieldError} id="baseFibAmount-error">{baseFibError}</span>
            )}
            {!baseFibError && (
              <span className={styles.hint} id="baseFibAmount-hint">
                Este valor se multiplica por las unidades Fibonacci para calcular la multa total.
              </span>
            )}
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
            className={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner} aria-hidden="true"></span>
                Registrando...
              </>
            ) : (
              <>
                <BookOpen size={16} aria-hidden={true} />
                Registrar Devolución
              </>
            )}
          </button>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
            disabled={isLoading}
          >
            Limpiar
          </button>
        </div>
      </form>

      {isLoading && (
        <div aria-live="polite" className={styles.srOnly}>Registrando devolución...</div>
      )}
    </div>
  );
}
