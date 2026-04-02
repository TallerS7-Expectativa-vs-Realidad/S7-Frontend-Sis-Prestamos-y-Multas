import { AlertCircle, AlertTriangle } from 'lucide-react';
import styles from './DebtSummary.module.css';

function calculateWeeks(daysLate) {
  return Math.floor((daysLate - 1) / 7) + 1;
}

export default function DebtSummary({ debt }) {
  if (!debt) {
    return null;
  }

  const { days_late, units_fib, amount_debt, id_debt } = debt;
  const weeks = calculateWeeks(days_late);

  return (
    <div className={styles.debtSummary} role="region" aria-label="Resumen de multa">
      <div className={styles.debtHeader}>
        <h3 className={styles.debtTitle}>
          <AlertCircle size={24} aria-hidden={true} />
          Resumen de Multa
        </h3>
        <p className={styles.debtMessage}>
          El libro fue devuelto <strong>{days_late} día{days_late !== 1 ? 's' : ''}</strong> después de la fecha límite
          (equivalente a <strong>{weeks} semana{weeks !== 1 ? 's' : ''}</strong> completa{weeks !== 1 ? 's' : ''}).
        </p>
      </div>

      <div className={styles.debtDetails}>
        <div className={styles.debtItem}>
          <span className={styles.label}>Días de retraso</span>
          <span className={styles.value}>{days_late} día{days_late !== 1 ? 's' : ''}</span>
        </div>

        <div className={styles.debtItem}>
          <span className={styles.label}>Semanas completas</span>
          <span className={styles.value}>{weeks} semana{weeks !== 1 ? 's' : ''}</span>
        </div>

        <div className={styles.debtItem}>
          <span className={styles.label}>Unidades Fibonacci acumuladas</span>
          <span className={styles.value}>{units_fib} unidad{units_fib !== 1 ? 'es' : ''}</span>
        </div>

        <div className={`${styles.debtItem} ${styles.debtAmount}`}>
          <span className={styles.label}>Monto de la multa</span>
          <span className={styles.amount}>
            ${amount_debt.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {id_debt && (
        <div className={styles.debtReference}>
          ID de deuda: {id_debt}
        </div>
      )}

      <div className={styles.debtWarning}>
        <p>
          <AlertTriangle size={16} aria-hidden={true} />
          Esta multa debe ser pagada antes de poder solicitar nuevos préstamos.
        </p>
      </div>
    </div>
  );
}
