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
            className={`${styles.navLink} ${isActive('/loan') || isActive('/') ? styles.active : ''}`}
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
      </ul>
    </nav>
  );
}
