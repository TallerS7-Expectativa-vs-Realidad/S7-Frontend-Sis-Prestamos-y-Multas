/**
 * Loan Models - HU-01: Book Availability Search
 * 
 * DTOs and validations for loan-related operations.
 * Intentionally minimal to focus on HU-01 requirements.
 */

const { z } = require('zod');

/**
 * DTO for loan search result
 * Represents the availability status of a book
 */
const LoanSearchResultDTO = z.object({
  id: z.number().int().positive('Loan ID must be a positive integer'),
  name: z.string().min(1, 'Book name is required'),
  status: z.enum(['ON_LOAN', 'RETURNED'], 'Status must be ON_LOAN or RETURNED'),
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
