import styles from './NotImplementedPage.module.css';

export default function NotImplementedPage() {
  return (
    <div className={styles.container}>
      <section className={styles.content}>
        <div className={styles.message}>
          <div className={styles.icon}>🚧</div>
          <h2>Funcionalidad No Implementada</h2>
          <p>Esta funcionalidad aún no ha sido implementada en esta versión.</p>
          <p className={styles.hint}>Por favor, regresa más tarde o utiliza otra sección disponible.</p>
        </div>
      </section>
    </div>
  );
}
