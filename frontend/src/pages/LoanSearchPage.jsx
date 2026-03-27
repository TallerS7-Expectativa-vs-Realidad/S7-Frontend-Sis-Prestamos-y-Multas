import LoanSearch from '../components/LoanSearch.jsx';
import styles from './LoanSearchPage.module.css';

/**
 * LoanSearchPage Component
 * Page for book availability search
 * @returns {JSX.Element} Loan search page
 */
export default function LoanSearchPage() {
  return (
    <div className={styles.page}>
      <LoanSearch />
    </div>
  );
}
