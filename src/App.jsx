import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DebtPaymentPage from './pages/DebtPaymentPage.jsx';
import OverduePage from './pages/OverduePage.jsx';
import ReturnPage from './pages/ReturnPage.jsx';
import Navigation from './components/Navigation.jsx';
import styles from './App.module.css';
import LoanCombinedPage from './pages/LoanCombinedPage.jsx';

export default function App() {
  return (
    <Router>
      <div className={styles.layout}>
        <Navigation />
        <main className={styles.main}>
          <Routes>
            <Route path="/loan" element={<LoanCombinedPage />} />
            <Route path="/return" element={<ReturnPage />} />
            <Route path="/payment" element={<DebtPaymentPage />} />
            <Route path="/loans/overdue" element={<OverduePage />} />
            <Route path="/" element={<LoanCombinedPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
