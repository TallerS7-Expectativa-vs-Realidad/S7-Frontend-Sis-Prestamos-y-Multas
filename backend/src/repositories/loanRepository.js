/**
 * Loan Repository
 * 
 * DEPRECATED: All loan-related database operations have been removed.
 * HU-06 (pago de multas) does not require loan creation or return functionality.
 * Loan-related features (HU-02, HU-03, HU-04, HU-05) are not implemented in this backend.
 */

class LoanRepository {
  constructor(pool) {
    this.pool = pool;
  }
  
  // Intentionally empty - methods for HU-01, HU-02, HU-03, HU-04, HU-05 have been removed
}

module.exports = LoanRepository;
