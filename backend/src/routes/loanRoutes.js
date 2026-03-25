const { Router } = require('express');
const { createLoanSchema } = require('../models/Loan');

/**
 * Factory function to create loan router with injected service
 * Follows dependency injection pattern as per backend.instructions.md
 */
module.exports = function makeLoanRouter({ loanService }) {
  const router = Router();

  /**
   * POST /api/v1/loan
   * Register a new book loan for a reader
   * 
   * Body: { id_book, title, type_id_reader, id_reader, name_reader, loan_days }
   * Response: 201 (success) | 400 (invalid input) | 409 (conflict) | 500 (server error)
   */
  router.post('/', async (req, res, next) => {
    try {
      // 1. Validate request payload against Zod schema
      const validatedData = createLoanSchema.parse(req.body);

      // 2. Call service to create loan (handles business logic and validations)
      const loan = await loanService.createLoan(validatedData);

      // 3. Return 201 with created loan
      return res.status(201).json({
        success: true,
        data: loan,
        message: 'Loan created successfully',
      });
    } catch (err) {
      // Delegate error handling to express error middleware
      next(err);
    }
  });

  return router;
};
