import OverdueLoansTable from '../components/OverdueLoansTable.jsx';
import styles from './OverduePage.module.css';

/**
 * OverduePage Component
 * Page for viewing overdue loans with book and reader information
 * @returns {JSX.Element} Overdue loans page
 */
export default function OverduePage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2>Préstamos Vencidos</h2>
        <p className={styles.subtitle}>
          Libros fuera de plazo y lector responsable
        </p>
      </div>
      <div className={styles.content}>
        <OverdueLoansTable />
      </div>
    </div>
  );
}
