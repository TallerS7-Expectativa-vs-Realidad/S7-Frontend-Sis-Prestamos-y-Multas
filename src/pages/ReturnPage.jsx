import ReturnForm from '../components/ReturnForm.jsx';
import styles from './ReturnPage.module.css';

export default function ReturnPage() {
  return (
    <div className={styles.container}>
      <section className={styles.content}>
        <ReturnForm />
      </section>
    </div>
  );
}
