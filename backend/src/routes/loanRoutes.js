const { Router } = require('express');
const { createLoanSchema, returnLoanSchema } = require('../models/Loan');

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

  /**
   * PATCH /api/v1/loan
   * Register the return of a book (HU-03 and HU-04)
   * For on-time returns: closes loan without debt
   * For late returns: closes loan and generates debt
   * 
   * Body: { date_return, type_id_reader, id_book?, id_reader?, name_reader? }
   * - date_return: required, ISO 8601 datetime
   * - type_id_reader: required, 'CI' or 'DNI'
   * - id_book: optional (but at least one of id_book or id_reader must be provided)
   * - id_reader: optional (but at least one of id_book or id_reader must be provided)
   * - name_reader: optional (can be null only if id_book is provided)
   * 
   * Response: 200 (success) | 400 (invalid input) | 404 (loan not found) | 409 (already returned) | 500 (server error)
   */
  router.patch('/', async (req, res, next) => {
    try {
      // 1. Validate request payload against Zod schema
      const validatedData = returnLoanSchema.parse(req.body);

      // 2. Call service to return loan (handles business logic and validations)
      const updatedLoan = await loanService.returnLoan(validatedData);

      // 3. Return 200 with updated loan
      return res.status(200).json({
        success: true,
        data: updatedLoan,
        message: 'Loan return registered successfully',
      });
    } catch (err) {
      // Delegate error handling to express error middleware
      next(err);
    }
  });

  return router;
};
