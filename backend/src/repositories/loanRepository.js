/**
 * Loan Repository - HU-01: Book Availability Search
 * 
 * Handles all database operations related to loans.
 * Focuses on HU-01: searching for book availability by title (case-insensitive).
 */

class LoanRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Find all loans by book title (case-insensitive)
   * Returns the most recent loan record for each unique book title.
   * 
   * @param {string} title - Book title to search for (case-insensitive)
   * @returns {Promise<Array>} Array of loan records. Empty array if no matches found.
   * @throws {Error} If database query fails
   */
  async findByName(title) {
    try {
      if (!title || typeof title !== 'string' || title.trim() === '') {
        throw new Error('Title must be a non-empty string');
      }

      // Query: Get all loans matching the title (case-insensitive), 
      // ordered by created_at DESC to get the most recent record per book
      const query = `
        SELECT 
          loan_id AS id,
          title AS name,
          state AS status
        FROM loan_books
        WHERE LOWER(title) LIKE LOWER($1)
        ORDER BY created_at DESC
      `;

      // Use LIKE with the title to support partial matches
      const searchPattern = `%${title}%`;
      const result = await this.pool.query(query, [searchPattern]);

      return result.rows;
    } catch (error) {
      throw new Error(`Error searching loans by title: ${error.message}`);
    }
  }

  /**
   * Find exact loan by title (case-insensitive, exact match)
   * Returns all loan records for the exact book title.
   * 
   * @param {string} title - Exact book title to search for
   * @returns {Promise<Array>} Array of loan records matching the exact title
   * @throws {Error} If database query fails
   */
  async findByNameExact(title) {
    try {
      if (!title || typeof title !== 'string' || title.trim() === '') {
        throw new Error('Title must be a non-empty string');
      }

      const query = `
        SELECT 
          loan_id AS id,
          title AS name,
          state AS status
        FROM loan_books
        WHERE LOWER(title) = LOWER($1)
        ORDER BY created_at DESC
      `;

      const result = await this.pool.query(query, [title]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching loans by exact title: ${error.message}`);
    }
  }

  /**
   * Find all overdue loans (HU-05)
   * Returns loans where state=ON_LOAN and date_limit < today
   * 
   * Business Rules:
   * - Exclude loans with state=RETURNED
   * - Include only loans where date_limit < today AND state=ON_LOAN
   * - Return minimal structure: loan_id, id_book, title, state, id_reader, name_reader, date_limit, date_return
   * 
   * @returns {Promise<Array>} Array of overdue loan records
   * @throws {Error} If database query fails
   */
  async findOverdue() {
    try {
      const query = `
        SELECT 
          loan_id,
          id_book,
          title,
          state,
          id_reader,
          name_reader,
          date_limit,
          date_return
        FROM loan_books
        WHERE state = 'ON_LOAN'
          AND date_limit < CURRENT_DATE
        ORDER BY date_limit ASC
      `;

      const result = await this.pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching overdue loans: ${error.message}`);
    }
  }
}

module.exports = LoanRepository;
