import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DebtPaymentPage from './pages/DebtPaymentPage.jsx';
import LoanSearchPage from './pages/LoanSearchPage.jsx';
import OverduePage from './pages/OverduePage.jsx';
import NotImplementedPage from './pages/NotImplementedPage.jsx';
import LoanPage from './pages/LoanPage.jsx';
import ReturnPage from './pages/ReturnPage.jsx';
import Navigation from './components/Navigation.jsx';
import styles from './App.module.css';
import LoanCombinedPage from './pages/LoanCombinedPage.jsx';

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
            <Route path="/loan" element={<LoanCombinedPage />} />
            <Route path="/return" element={<ReturnPage />} />
            <Route path="/payment" element={<DebtPaymentPage />} />
            <Route path="/loans/outTime" element={<OverduePage />} />
            <Route path="/" element={<LoanCombinedPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
