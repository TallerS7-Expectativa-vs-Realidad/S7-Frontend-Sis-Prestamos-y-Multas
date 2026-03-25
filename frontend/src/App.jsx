import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoanPage from './pages/LoanPage.jsx';
import ReturnPage from './pages/ReturnPage.jsx';
import Navigation from './components/Navigation.jsx';
import styles from './App.module.css';

export default function App() {
  return (
    <Router>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Sistema de Préstamos y Multas</h1>
          <Navigation />
        </header>
        <main className={styles.main}>
          <Routes>
            <Route path="/loan" element={<LoanPage />} />
            <Route path="/return" element={<ReturnPage />} />
            <Route path="/" element={<LoanPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
