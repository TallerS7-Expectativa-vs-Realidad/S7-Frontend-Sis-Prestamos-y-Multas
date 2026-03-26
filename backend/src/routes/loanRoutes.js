/**
 * Loan Routes
 * 
 * DEPRECATED: All loan-related routes have been removed.
 * HU-06 (pago de multas) does not require loan creation or return endpoints.
 * Loan-related features (HU-02, HU-03, HU-04, HU-05) are not implemented in this backend.
 */

module.exports = function makeLoanRouter({ loanService }) {
  // Intentionally empty - routes for HU-02 (create loan) and HU-03/04 (return loan) have been removed
  const { Router } = require('express');
  return Router();
};
