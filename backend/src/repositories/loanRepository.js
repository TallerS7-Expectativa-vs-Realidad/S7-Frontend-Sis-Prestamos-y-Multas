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

  async findByName(name) {
    try {
      const query = `
        SELECT DISTINCT ON (id_book)
          id_book AS id,
          title AS name,
          state AS status
        FROM loan_books
        WHERE title ILIKE $1
        ORDER BY id_book, created_at DESC
      `;

      const result = await this.pool.query(query, [`%${name}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding loans by name: ${error.message}`);
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

  /**
   * Get active loan by id_book (returns most recent ON_LOAN record)
   */
  async getActiveLoanByBook(id_book) {
    try {
      const query = `
        SELECT * FROM loan_books 
        WHERE id_book = $1 AND state = 'ON_LOAN'
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      const result = await this.pool.query(query, [id_book]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting active loan by book: ${error.message}`);
    }
  }

  async getLatestLoanByBook(id_book) {
    try {
      const query = `
        SELECT * FROM loan_books
        WHERE id_book = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await this.pool.query(query, [id_book]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting latest loan by book: ${error.message}`);
    }
  }

  /**
   * Get active loan by id_reader (returns most recent ON_LOAN record)
   */
  async getActiveLoanByReader(id_reader) {
    try {
      const query = `
        SELECT * FROM loan_books 
        WHERE id_reader = $1 AND state = 'ON_LOAN'
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      const result = await this.pool.query(query, [id_reader]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting active loan by reader: ${error.message}`);
    }
  }

  async getLatestLoanByReader(id_reader) {
    try {
      const query = `
        SELECT * FROM loan_books
        WHERE id_reader = $1
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await this.pool.query(query, [id_reader]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting latest loan by reader: ${error.message}`);
    }
  }

  /**
   * Get active loan by id_book AND id_reader (for exact match)
   */
  async getActiveLoanByBookAndReader(id_book, id_reader) {
    try {
      const query = `
        SELECT * FROM loan_books 
        WHERE id_book = $1 AND id_reader = $2 AND state = 'ON_LOAN'
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      const result = await this.pool.query(query, [id_book, id_reader]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting active loan by book and reader: ${error.message}`);
    }
  }

  async getLatestLoanByBookAndReader(id_book, id_reader) {
    try {
      const query = `
        SELECT * FROM loan_books
        WHERE id_book = $1 AND id_reader = $2
        ORDER BY created_at DESC
        LIMIT 1
      `;

      const result = await this.pool.query(query, [id_book, id_reader]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting latest loan by book and reader: ${error.message}`);
    }
  }

  /**
   * Get active loan by title AND id_reader (for search by name)
   */
  async getActiveLoanByTitleAndReader(title, id_reader) {
    try {
      const query = `
        SELECT * FROM loan_books 
        WHERE title ILIKE $1 AND id_reader = $2 AND state = 'ON_LOAN'
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      const result = await this.pool.query(query, [title, id_reader]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting active loan by title and reader: ${error.message}`);
    }
  }

  /**
   * Get active loan by title only (returns most recent ON_LOAN record with matching title)
   */
  async getActiveLoanByTitle(title) {
    try {
      const query = `
        SELECT * FROM loan_books 
        WHERE title ILIKE $1 AND state = 'ON_LOAN'
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      
      const result = await this.pool.query(query, [title]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting active loan by title: ${error.message}`);
    }
  }

  /**
   * Update loan return information
   * Sets date_return and changes state to RETURNED
   */
  async updateReturn(loan_id, date_return) {
    try {
      const query = `
        UPDATE loan_books 
        SET date_return = $1, state = 'RETURNED', updated_at = NOW()
        WHERE loan_id = $2
        RETURNING *
      `;

      const result = await this.pool.query(query, [date_return, loan_id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating loan return: ${error.message}`);
    }
  }
}

module.exports = LoanRepository;
