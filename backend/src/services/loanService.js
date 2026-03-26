/**
 * Loan Service - HU-01: Book Availability Search
 * 
 * Contains business logic for loan-related operations.
 * Focuses on HU-01: searching for book availability.
 */

class LoanService {
  constructor(loanRepository) {
    this.loanRepository = loanRepository;
  }

  /**
   * Search for book availability by title (case-insensitive)
   * 
   * Business Rules (from spec):
   * - Búsqueda case-insensitive por title
   * - Si no hay registros, devolver sin historial y considerar disponible
   * - La disponibilidad se determina por el último estado conocido en historial
   * 
   * @param {string} name - Book title to search for
   * @returns {Promise<Object>} Response with results array and optional message
   * @throws {Error} If name is invalid or database access fails
   */
  async searchByName(name) {
    try {
      // Validation
      if (!name || typeof name !== 'string') {
        const error = new Error('Book name must be a non-empty string');
        error.code = 'INVALID_NAME';
        error.statusCode = 400;
        throw error;
      }

      const trimmedName = name.trim();
      if (trimmedName.length === 0) {
        const error = new Error('Book name must be a non-empty string');
        error.code = 'INVALID_NAME';
        error.statusCode = 400;
        throw error;
      }

      // Query repository for partial match (more user-friendly search)
      const loanRecords = await this.loanRepository.findByName(trimmedName);

      // If no records found, return empty results with message
      if (!loanRecords || loanRecords.length === 0) {
        return {
          results: [],
          message: 'No loan history found for this book. Book is available for loan.',
        };
      }

      // Per spec: "La disponibilidad se determina por el último estado conocido en historial"
      // Group by book (in case same title is registered multiple times) and get the latest status
      const uniqueBooks = this._deduplicateBooks(loanRecords);

      return {
        results: uniqueBooks,
      };
    } catch (error) {
      // Re-throw with context preserved
      throw error;
    }
  }

  /**
   * Helper: Deduplicate books by title, keeping the most recent loan record
   * 
   * @private
   * @param {Array} loanRecords - Array of loan records from query
   * @returns {Array} Array of deduplicated book records with latest status
   */
  _deduplicateBooks(loanRecords) {
    const bookMap = new Map();

    for (const record of loanRecords) {
      const key = record.name.toLowerCase();

      // If not yet in map, or this record is more recent, update
      if (!bookMap.has(key)) {
        bookMap.set(key, record);
      }
      // Note: Already sorted DESC by created_at from query, so first occurrence is latest
    }

    return Array.from(bookMap.values());
  }

  /**
   * Get all overdue loans (HU-05)
   * Lists loans where state=ON_LOAN and date_limit < today
   * 
   * Business Rules (from spec):
   * - Exclude loans with state=RETURNED
   * - Consider overdue: date_limit < today AND state=ON_LOAN
   * - Output includes: loan_id, id_book, title, state, id_reader, name_reader, date_limit, date_return
   * 
   * @returns {Promise<Object>} Response object with overdue loans array
   * @throws {Error} If database access fails
   */
  async getOverdue() {
    try {
      const overdueLoans = await this.loanRepository.findOverdue();

      return {
        data: overdueLoans,
        count: overdueLoans.length,
      };
    } catch (error) {
      throw new Error(`Error fetching overdue loans: ${error.message}`);
    }
  }
}

module.exports = LoanService;
