/**
 * Loan Routes - HU-01: Book Availability Search + HU-05: Overdue Loans
 * 
 * HTTP routes for loan-related operations.
 * - HU-01: GET /api/v1/loans/{name} to search book availability.
 * - HU-05: GET /api/v1/loans/outTime to list overdue loans.
 */

module.exports = function makeLoanRouter({ loanService }) {
  const { Router } = require('express');
  const router = Router();

  /**
   * GET /api/v1/loans/outTime
   * List all overdue loans (HU-05)
   * 
   * Responses:
   *   - 200 OK: { data: [...], count: number }
   *   - 500 Internal Server Error: error details
   * 
   * Returns loans where state=ON_LOAN and date_limit < today
   * Includes: loan_id, id_book, title, state, id_reader, name_reader, date_limit, date_return
   * 
   * Example:
   *   GET /api/v1/loans/outTime
   */
  router.get('/outTime', async (req, res, next) => {
    try {
      const response = await loanService.getOverdue();
      res.status(200).json(response);
    } catch (error) {
      // Delegate to error handler middleware
      next(error);
    }
  });

  /**
   * GET /api/v1/loans/{name}
   * Search for book availability by title (case-insensitive)
   * 
   * Path Parameters:
   *   - name (string): Book title to search for
   * 
   * Responses:
   *   - 200 OK: { results: [...], message?: string }
   *   - 400 Bad Request: { message: "INVALID_NAME" }
   * 
   * Examples:
   *   GET /api/v1/loans/Harry%20Potter
   *   GET /api/v1/loans/the%20hobbit
   */
  router.get('/:name', async (req, res, next) => {
    try {
      const { name } = req.params;

      // Call service to search for book
      const response = await loanService.searchByName(name);

      // Return 200 OK with results
      res.status(200).json(response);
    } catch (error) {
      // Service throws errors with .code and .statusCode properties
      if (error.code === 'INVALID_NAME') {
        return res.status(error.statusCode || 400).json({
          message: 'INVALID_NAME',
          details: error.message,
        });
      }

      // Delegate to error handler middleware
      next(error);
    }
  });

  return router;
};

