/**
 * Loan Service
 * 
 * DEPRECATED: All loan-related business logic has been removed.
 * HU-06 (pago de multas) does not require loan creation or return functionality.
 * Loan-related features (HU-02, HU-03, HU-04, HU-05) are not implemented in this backend.
 */

class LoanService {
  constructor(loanRepository, debtService) {
    this.loanRepository = loanRepository;
    this.debtService = debtService;
  }
  
  // Intentionally empty - methods for HU-02, HU-03, HU-04, HU-05 have been removed
}

module.exports = LoanService;
