/**
 * DebtRepository
 * Handles all database operations related to reader debts
 */
class DebtRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get the latest pending debt for a reader
   * Returns the most recent PENDING debt record if it exists
   */
  async getLatestPendingDebtByReader(id_reader) {
    try {
      const query = `
        SELECT * FROM dept_reader 
        WHERE id_reader = $1 AND state_dept = 'PENDING'
        ORDER BY created_at DESC 
        LIMIT 1
      `;

      const result = await this.pool.query(query, [id_reader]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting debt by reader: ${error.message}`);
    }
  }

  /**
   * Get all pending debts for a reader
   */
  async getAllPendingDebtsByReader(id_reader) {
    try {
      const query = `
        SELECT * FROM dept_reader 
        WHERE id_reader = $1 AND state_dept = 'PENDING'
        ORDER BY created_at DESC
      `;

      const result = await this.pool.query(query, [id_reader]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting all debts by reader: ${error.message}`);
    }
  }

  /**
   * Get a debt by ID
   */
  async getDebtById(dept_id) {
    try {
      const query = 'SELECT * FROM dept_reader WHERE dept_id = $1';
      const result = await this.pool.query(query, [dept_id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting debt by ID: ${error.message}`);
    }
  }

  /**
   * Create a new debt record
   */
  async createDebt(debtData) {
    try {
      const {
        loan_id,
        id_reader,
        name_reader,
        units_fib,
        amount_dept,
      } = debtData;

      const query = `
        INSERT INTO dept_reader 
        (loan_id, id_reader, name_reader, units_fib, amount_dept, state_dept, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, 'PENDING', NOW(), NOW())
        RETURNING *
      `;

      const values = [loan_id, id_reader, name_reader, units_fib, amount_dept];
      const result = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating debt: ${error.message}`);
    }
  }

  /**
   * Update debt payment status
   */
  async markDebtAsPaid(dept_id) {
    try {
      const query = `
        UPDATE dept_reader 
        SET state_dept = 'PAID', updated_at = NOW()
        WHERE dept_id = $1
        RETURNING *
      `;

      const result = await this.pool.query(query, [dept_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error marking debt as paid: ${error.message}`);
    }
  }
}

module.exports = DebtRepository;
