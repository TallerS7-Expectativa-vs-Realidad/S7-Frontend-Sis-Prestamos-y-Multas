/**
 * Loan Models - HU-01: Book Availability Search
 * 
 * DTOs and validations for loan-related operations.
 * Intentionally minimal to focus on HU-01 requirements.
 */

const { z } = require('zod');

/**
 * DTO for loan search result
 * Represents the availability status of a book copy
 * Note: Each id_book represents a physical copy of the book. Same title + different id_book = different copy.
 */
const LoanSearchResultDTO = z.object({
  id_book: z.string().min(1, 'Book ID is required'),
  loan_id: z.number().int().positive().nullable().optional(),
  status: z.enum(['ON_LOAN', 'RETURNED'], 'Status must be ON_LOAN or RETURNED'),
  message: z.string().optional(),
});

/**
 * DTO for search response
 */
const SearchByNameResponseDTO = z.object({
  results: z.array(LoanSearchResultDTO),
  message: z.string().optional(),
});

module.exports = {
  LoanSearchResultDTO,
  SearchByNameResponseDTO,
};
