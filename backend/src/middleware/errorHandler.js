const { ZodError } = require('zod');

/**
 * Centralized error handling middleware for Express
 * Handles:
 * - Zod validation errors → 400
 * - Business logic errors (INVALID_LOAN_DAYS, BOOK_NOT_AVAILABLE, READER_HAS_DEBT) → 400/409
 * - Generic errors → 500
 */
module.exports = function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: 'INVALID_PAYLOAD',
      message: 'Invalid request payload',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle custom business logic errors with statusCode
  if (err.statusCode && err.code) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  // Handle generic errors
  return res.status(500).json({
    success: false,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
