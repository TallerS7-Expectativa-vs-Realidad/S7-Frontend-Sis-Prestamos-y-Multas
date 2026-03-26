/**
 * Loan Routes - HU-01: Book Availability Search
 * 
 * HTTP routes for loan-related operations.
 * Focuses on HU-01: GET /api/v1/loans/{name} to search book availability.
 */

module.exports = function makeLoanRouter({ loanService }) {
  const { Router } = require('express');
  const router = Router();

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

