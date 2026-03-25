import styles from './DebtSummary.module.css';

/**
 * Calculate number of complete weeks from days late
 * Formula: weeks = ((days_late - 1) // 7) + 1
 * @param {number} daysLate - Number of days late
 * @returns {number} Number of complete weeks
 */
function calculateWeeks(daysLate) {
  return Math.floor((daysLate - 1) / 7) + 1;
}

/**
 * DebtSummary Component
 * Displays late return fee details when a book is returned past the due date
 * @param {Object} debt - Debt details object
 * @param {number} debt.days_late - Number of days the book was returned late
 * @param {number} debt.units_fib - Number of Fibonacci units accumulated for the fee
 * @param {number} debt.amount_dept - Total fee amount in currency units
 * @param {string} [debt.dept_id] - Optional: Debt ID for reference
 * @returns {JSX.Element} Debt summary display
 */
export default function DebtSummary({ debt }) {
  if (!debt) {
    return null;
  }

  const { days_late, units_fib, amount_dept, dept_id } = debt;
  const weeks = calculateWeeks(days_late);

  return (
    <div className={styles.debtSummary} role="region" aria-label="Debt summary">
      <div className={styles.debtHeader}>
        <h3>📋 Resumen de Multa</h3>
        <p className={styles.debtMessage}>
          El libro fue devuelto <strong>{days_late} día{days_late !== 1 ? 's' : ''}</strong> después de la fecha límite
          (equivalente a <strong>{weeks} semana{weeks !== 1 ? 's' : ''}</strong> completa{weeks !== 1 ? 's' : ''}).
        </p>
      </div>

      <div className={styles.debtDetails}>
        <div className={styles.debtItem}>
          <span className={styles.label}>Días de retraso:</span>
          <span className={styles.value}>{days_late} día{days_late !== 1 ? 's' : ''}</span>
        </div>

        <div className={styles.debtItem}>
          <span className={styles.label}>Semanas completas:</span>
          <span className={styles.value}>{weeks} semana{weeks !== 1 ? 's' : ''}</span>
        </div>

        <div className={styles.debtItem}>
          <span className={styles.label}>Unidades Fibonacci acumuladas:</span>
          <span className={styles.value}>{units_fib} unidade{units_fib !== 1 ? 's' : ''}</span>
        </div>

        <div className={styles.debtItem + ' ' + styles.debtAmount}>
          <span className={styles.label}>Monto de la multa:</span>
          <span className={styles.amount}>
            ${amount_dept.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {dept_id && (
        <div className={styles.debtReference}>
          <small>ID de deuda: {dept_id}</small>
        </div>
      )}

      <div className={styles.debtWarning}>
        <p>
          ⚠️ <strong>Importante:</strong> Esta multa debe ser pagada antes de poder solicitar nuevos préstamos.
        </p>
      </div>
    </div>
  );
}
