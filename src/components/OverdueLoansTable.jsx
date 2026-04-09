import { useState, useEffect } from 'react';
import { AlertTriangle, BookOpen, RefreshCw, AlertCircle } from 'lucide-react';
import { useLoan } from '../hooks/useLoan.js';
import styles from './OverdueLoansTable.module.css';

/**
 * Calculate days overdue from today vs date_limit
 */
function calculateDaysOverdue(dateLimitStr) {
  if (!dateLimitStr) return 0;
  const limit = new Date(dateLimitStr);
  const today = new Date();
  limit.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const diff = today - limit;
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0;
}

export default function OverdueLoansTable() {
  const { getOverdue, isLoading, error, overdueLoans } = useLoan();
  const [displayData, setDisplayData] = useState([]);

  const fetchData = async () => {
    const loans = await getOverdue();
    setDisplayData(loans || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading} aria-live="polite" aria-label="Cargando préstamos vencidos">
        <div className={styles.skeleton}>
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
          <div className={styles.skeletonRow} />
        </div>
        <span>Cargando préstamos vencidos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState} role="alert">
        <AlertCircle size={48} aria-hidden={true} className={styles.errorIcon} />
        <h3 className={styles.errorHeading}>No se pudieron cargar los préstamos vencidos</h3>
        <p className={styles.errorText}>Verifica tu conexión e intenta de nuevo.</p>
        <button className={styles.retryBtn} onClick={fetchData}>
          <RefreshCw size={16} aria-hidden={true} />
          Reintentar
        </button>
      </div>
    );
  }

  if (!displayData || displayData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <BookOpen size={48} aria-hidden={true} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No hay préstamos vencidos</h3>
        <p className={styles.emptyText}>
          Todos los préstamos están dentro del plazo o ya fueron devueltos.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">ID Préstamo</th>
            <th scope="col">Libro</th>
            <th scope="col">Lector Responsable</th>
            <th scope="col" className={styles.alignCenter}>Estado</th>
            <th scope="col">Fecha Límite</th>
            <th scope="col" className={styles.alignRight}>Días de Atraso</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((loan) => {
            const daysOverdue = calculateDaysOverdue(loan.date_limit);
            return (
              <tr key={loan.loan_id}>
                <td className={styles.cellMono}>{loan.loan_id}</td>
                <td>
                  <div className={styles.compositeCell}>
                    <span className={styles.primaryText}>{loan.title}</span>
                    {loan.id_book && <span className={styles.secondaryText}>{loan.id_book}</span>}
                  </div>
                </td>
                <td>
                  <div className={styles.compositeCell}>
                    <span className={styles.primaryText}>{loan.name_reader}</span>
                    {loan.id_reader && (
                      <span className={styles.secondaryText}>
                        {loan.type_id_reader ? `${loan.type_id_reader} ` : ''}{loan.id_reader}
                      </span>
                    )}
                  </div>
                </td>
                <td className={styles.alignCenter}>
                  <span className={styles.badge}>
                    <AlertTriangle size={14} aria-hidden={true} />
                    Vencido
                  </span>
                </td>
                <td className={styles.cellMono}>{formatDate(loan.date_limit)}</td>
                <td className={styles.alignRight}>
                  <span className={styles.daysOverdue}>
                    {daysOverdue} {daysOverdue === 1 ? 'día' : 'días'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className={styles.info}>
        Total de préstamos vencidos: <strong>{displayData.length}</strong>
      </div>
    </div>
  );
}
