import LoanForm from '../components/LoanForm.jsx';
import styles from './LoanPage.module.css';

export default function LoanPage() {
  return (
    <div className={styles.container}>
      <section className={styles.content}>
        <LoanForm />
      </section>
    </div>
  );
}
