import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, AlertCircle, CheckCircle, CreditCard, CircleAlert, UserCheck } from 'lucide-react';
import styles from './DebtPaymentForm.module.css';
import { useDebt } from '../hooks/useDebt.js';

export default function DebtPaymentForm() {
  const { getReaderDebt, payDebt, isLoading, error, success, debtData } = useDebt();

  const [typeIdReader, setTypeIdReader] = useState('CI');
  const [idReader, setIdReader] = useState('');
  const [nameReader, setNameReader] = useState('');
  const [searched, setSearched] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearched(false);

    const filters = {
      typeId: typeIdReader,
      id_reader: idReader,
      ...(nameReader && { name_reader: nameReader }),
    };

    await getReaderDebt(filters);
    setSearched(true);
  };

  const handlePaymentClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!debtData || !debtData.id_debt) return;

    setPaymentInProgress(true);
    setShowConfirmModal(false);
    const result = await payDebt(debtData.id_debt);
    setPaymentInProgress(false);

    if (result) {
      setIdReader('');
      setNameReader('');
      setTypeIdReader('CI');
      setSearched(false);
    }
  };

  const handleCancelPayment = () => {
    setShowConfirmModal(false);
  };

  const modalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') : null;

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.heading}>Registrar Pago de Multa</h2>

      {/* Search Section */}
      <div className={styles.searchSection}>
        <h3 className={styles.sectionTitle}>Búsqueda de Lector</h3>

        {error && (
          <div className={styles.alertError} role="alert">
            <AlertCircle size={20} aria-hidden={true} />
            {error}
          </div>
        )}

        <form onSubmit={handleSearch} className={styles.form}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>Información del Lector</legend>

            <div className={styles.formGroup}>
              <label htmlFor="typeIdReader" className={styles.label}>Tipo de Identificación *</label>
              <select
                id="typeIdReader"
                value={typeIdReader}
                onChange={(e) => setTypeIdReader(e.target.value)}
                disabled={isLoading}
                className={styles.select}
              >
                <option value="CI">Cédula de Identidad (CI)</option>
                <option value="DNI">Documento Nacional de Identificación (DNI)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="idReader" className={styles.label}>Número de Identificación *</label>
              <input
                id="idReader"
                type="text"
                value={idReader}
                onChange={(e) => setIdReader(e.target.value)}
                required
                placeholder="Ej: 1023456789"
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nameReader" className={styles.label}>Nombre del Lector (Opcional)</label>
              <input
                id="nameReader"
                type="text"
                value={nameReader}
                onChange={(e) => setNameReader(e.target.value)}
                placeholder="Ej: Juan Pérez"
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            <button
              type="submit"
              className={styles.searchBtn}
              disabled={isLoading || !idReader.trim()}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true"></span>
                  Buscando...
                </>
              ) : (
                <>
                  <Search size={16} aria-hidden={true} />
                  Buscar Deuda
                </>
              )}
            </button>
          </fieldset>
        </form>
      </div>

      {/* Debt Details Section */}
      {searched && debtData && (
        <div className={styles.debtSection}>
          <h3 className={styles.sectionTitle}>Detalles de la Deuda</h3>

          <div className={styles.debtDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID Lector:</span>
              <span className={styles.detailValue}>{debtData.id_reader}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Nombre Lector:</span>
              <span className={styles.detailValue}>{debtData.name_reader}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID Préstamo:</span>
              <span className={styles.detailValue}>{debtData.loan_id}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Estado:</span>
              <span className={styles.detailValue}>
                <span className={styles.statusBadge}>
                  <CircleAlert size={14} aria-hidden={true} />
                  {debtData.state_debt}
                </span>
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Monto:</span>
              <span className={styles.amount}>
                ${debtData.amount_debt?.toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ID Deuda:</span>
              <span className={styles.detailValueMono}>{debtData.id_debt}</span>
            </div>
          </div>

          <div className={styles.paymentSection}>
            <p className={styles.confirmation}>
              ¿Confirmas el pago total de esta multa?
            </p>
            <button
              type="button"
              className={styles.payBtn}
              onClick={handlePaymentClick}
              disabled={paymentInProgress}
            >
              {paymentInProgress ? (
                <>
                  <span className={styles.spinner} aria-hidden="true"></span>
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCard size={16} aria-hidden={true} />
                  Confirmar Pago
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && debtData?.state_debt === 'PAID' && (
        <div className={styles.alertSuccess} role="alert">
          <CheckCircle size={20} aria-hidden={true} />
          <div>
            <p>Pago registrado exitosamente.</p>
            <p className={styles.alertDetail}>
              <UserCheck size={14} aria-hidden={true} />
              El lector ha sido rehabilitado.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && modalRoot && createPortal(
        <div className={styles.modalOverlay} onClick={handleCancelPayment}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
            <h3 id="modal-title" className={styles.modalTitle}>Confirmar Pago</h3>
            <p className={styles.modalText}>
              ¿Estás seguro de registrar el pago total de <strong>
                ${debtData?.amount_debt?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>?
            </p>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={handleCancelPayment}>
                Cancelar
              </button>
              <button className={styles.modalConfirm} onClick={handleConfirmPayment}>
                <CreditCard size={16} aria-hidden={true} />
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>,
        modalRoot
      )}

      {isLoading && (
        <div aria-live="polite" className={styles.srOnly}>Buscando deuda...</div>
      )}
    </div>
  );
}
