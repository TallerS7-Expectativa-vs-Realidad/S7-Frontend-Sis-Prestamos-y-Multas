import { Link, useLocation } from 'react-router-dom';
import { BookMarked, BookOpen, AlertTriangle, CheckCircle } from 'lucide-react';
import styles from './Navigation.module.css';

const navItems = [
  { label: 'Registrar Préstamo', href: '/loan', icon: BookMarked },
  { label: 'Registrar Devolución', href: '/return', icon: BookOpen },
  { label: 'Préstamos Vencidos', href: '/loans/overdue', icon: AlertTriangle },
  { label: 'Pagar Multa', href: '/payment', icon: CheckCircle },
];

/**
 * Navigation component — sidebar left, fixed
 */
export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/loan') return location.pathname === '/loan' || location.pathname === '/';
    return location.pathname === path;
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandText}>Biblioteca</span>
      </div>
      <ul className={styles.navList}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`${styles.navLink} ${active ? styles.active : ''}`}
              >
                <Icon size={20} aria-hidden={true} />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
