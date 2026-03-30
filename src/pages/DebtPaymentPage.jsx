import DebtPaymentForm from '../components/DebtPaymentForm.jsx';
import styles from './DebtPaymentPage.module.css';

export default function DebtPaymentPage() {
  return (
    <div className={styles.container}>
      <section className={styles.content}>
        <DebtPaymentForm />
      </section>
    </div>
  );
}
