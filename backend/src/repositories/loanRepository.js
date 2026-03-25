/**
 * LoanRepository
 * Handles all database operations related to loans
 */
class LoanRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Check if a book is available for loan
   * A book is available if:
   * - No loan records exist for it, OR
   * - The latest loan record has state = 'RETURNED'
   */
  async isBookAvailable(id_book) {
    try {
      const query = `
        SELECT state FROM loan_books 
        WHERE id_book = $1 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      const result = await this.pool.query(query, [id_book]);
      
      // If no records exist, book is available
      if (result.rows.length === 0) {
        return true;
      }
      
      // If latest record has state = 'RETURNED', book is available
      return result.rows[0].state === 'RETURNED';
    } catch (error) {
      throw new Error(`Error checking book availability: ${error.message}`);
    }
  }

  /**
   * Insert a new loan record
   */
  async insertLoan(loanData) {
    try {
      const {
        id_book,
        title,
        type_id_reader,
        id_reader,
        name_reader,
        loan_days,
        date_limit,
      } = loanData;

      const query = `
        INSERT INTO loan_books 
        (id_book, title, type_id_reader, id_reader, name_reader, loan_days, state, date_limit, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `;

      const values = [
        id_book,
        title,
        type_id_reader,
        id_reader,
        name_reader,
        loan_days,
        'ON_LOAN',
        date_limit,
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error inserting loan: ${error.message}`);
    }
  }

  /**
   * Get a loan by ID
   */
  async getLoanById(loan_id) {
    try {
      const query = 'SELECT * FROM loan_books WHERE loan_id = $1';
      const result = await this.pool.query(query, [loan_id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting loan by ID: ${error.message}`);
    }
  }
}

module.exports = LoanRepository;
