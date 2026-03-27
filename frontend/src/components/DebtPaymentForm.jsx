import { useState } from 'react';
import styles from './DebtPaymentForm.module.css';
import { useDebt } from '../hooks/useDebt.js';

/**
 * DebtPaymentForm Component
 * Allows searching for reader debt and registering payment
 * @returns {JSX.Element} Debt payment form
 */
export default function DebtPaymentForm() {
  const { getReaderDebt, payDebt, isLoading, error, success, debtData } = useDebt();

  // Search form state
  const [typeIdReader, setTypeIdReader] = useState('DNI');
  const [idReader, setIdReader] = useState('');
  const [nameReader, setNameReader] = useState('');
  const [searched, setSearched] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearched(false);

    const filters = {
      typeId: typeIdReader,
      id_reader: idReader,
      ...(nameReader && { name_reader: nameReader }),
    };

    const result = await getReaderDebt(filters);
    setSearched(true);

    if (!result) {
      // Error state already set by hook
    }
  };

  const handlePayment = async () => {
    if (!debtData || !debtData.id_debt) {
      return;
    }

    setPaymentInProgress(true);
    const result = await payDebt(debtData.id_debt);
    setPaymentInProgress(false);

    if (result) {
      // Success! Reset form for next search
      setIdReader('');
      setNameReader('');
      setTypeIdReader('DNI');
      setSearched(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Registrar Pago de Multa</h2>

      {/* Search Section */}
      <div className={styles.searchSection}>
        <h3>Búsqueda de Lector</h3>

        {error && (
          <div className={styles.alert} data-type="error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSearch} className={styles.form}>
          <fieldset>
            <legend>Información del Lector</legend>

            <div className={styles.formGroup}>
              <label htmlFor="typeIdReader">Tipo de Identificación *</label>
              <select
                id="typeIdReader"
                value={typeIdReader}
                onChange={(e) => setTypeIdReader(e.target.value)}
                disabled={isLoading}
              >
                <option value="CI">Cédula de Identidad (CI)</option>
                <option value="DNI">Documento Nacional de Identificación (DNI)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="idReader">Número de Identificación *</label>
              <input
                id="idReader"
                type="text"
                value={idReader}
                onChange={(e) => setIdReader(e.target.value)}
                required
                placeholder="Ej: 1023456789"
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nameReader">Nombre del Lector (Opcional)</label>
              <input
                id="nameReader"
                type="text"
                value={nameReader}
                onChange={(e) => setNameReader(e.target.value)}
                placeholder="Ej: Juan Pérez"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className={styles.searchBtn}
              disabled={isLoading || !idReader.trim()}
            >
              {isLoading ? 'Buscando...' : 'Buscar Deuda'}
            </button>
          </fieldset>
        </form>
      </div>

      {/* Debt Details Section */}
      {searched && debtData && (
        <div className={styles.debtSection}>
          <h3>Detalles de la Deuda</h3>

          <div className={styles.debtDetails}>
            <div className={styles.detailRow}>
              <span className={styles.label}>ID Lector:</span>
              <span className={styles.value}>{debtData.id_reader}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Nombre Lector:</span>
              <span className={styles.value}>{debtData.name_reader}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>ID Préstamo:</span>
              <span className={styles.value}>{debtData.loan_id}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Estado:</span>
              <span className={styles.value}>
                <span className={styles.statusPending}>
                  {debtData.state_debt}
                </span>
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>Monto:</span>
              <span className={styles.amount}>
                ${debtData.amount_debt?.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.label}>ID Deuda:</span>
              <span className={styles.value}>{debtData.id_debt}</span>
            </div>
          </div>

          {/* Payment Confirmation */}
          <div className={styles.paymentSection}>
            <p className={styles.confirmation}>
              ¿Confirmas el pago total de esta multa?
            </p>

            <button
              type="button"
              className={styles.payBtn}
              onClick={handlePayment}
              disabled={paymentInProgress}
            >
              {paymentInProgress ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && debtData?.state_debt === 'PAID' && (
        <div className={styles.alert} data-type="success" role="alert">
          ✓ Pago registrado exitosamente. El lector ha sido rehabilitado.
        </div>
      )}
    </div>
  );
}
