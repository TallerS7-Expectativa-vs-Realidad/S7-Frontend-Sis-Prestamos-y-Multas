import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';

/**
 * Navigation component with links to main features
 */
export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li>
          <Link
            to="/loan"
            className={`${styles.navLink} ${isActive('/loan') ? styles.active : ''}`}
          >
            Registrar Préstamo
          </Link>
        </li>
        <li>
          <Link
            to="/return"
            className={`${styles.navLink} ${isActive('/return') ? styles.active : ''}`}
          >
            Registrar Devolución
          </Link>
        </li>
        <li>
          <Link
            to="/payment"
            className={`${styles.navLink} ${isActive('/payment') ? styles.active : ''}`}
          >
            Pagar Multa
          </Link>
        </li>
      </ul>
    </nav>
  );
}
