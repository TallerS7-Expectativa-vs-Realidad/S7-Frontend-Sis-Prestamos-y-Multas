import { useState, useEffect } from 'react';
import { useLoan } from '../hooks/useLoan.js';
import styles from './OverdueLoansTable.module.css';

/**
 * OverdueLoansTable Component
 * Displays a table of overdue loans with book and reader information
 * @returns {JSX.Element} Table component
 */
export default function OverdueLoansTable() {
  const { getOverdue, isLoading, error, overdueLoans } = useLoan();
  const [displayData, setDisplayData] = useState([]);

  useEffect(() => {
    const fetchOverdueLoans = async () => {
      const loans = await getOverdue();
      setDisplayData(loans || []);
    };

    fetchOverdueLoans();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Cargando préstamos vencidos...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!displayData || displayData.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay préstamos vencidos en este momento</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID Préstamo</th>
            <th>Libro</th>
            <th>Estado</th>
            <th>Lector</th>
            <th>Fecha Límite</th>
            <th>Fecha Devolución</th>
          </tr>
        </thead>
        <tbody>
          {displayData.map((loan) => (
            <tr key={loan.loan_id}>
              <td>{loan.loan_id}</td>
              <td>{loan.title}</td>
              <td><span className={styles.badge}>{loan.state}</span></td>
              <td>{loan.name_reader}</td>
              <td>{formatDate(loan.date_limit)}</td>
              <td>{formatDate(loan.date_return)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.info}>
        Total de préstamos vencidos: <strong>{displayData.length}</strong>
      </div>
    </div>
  );
}
