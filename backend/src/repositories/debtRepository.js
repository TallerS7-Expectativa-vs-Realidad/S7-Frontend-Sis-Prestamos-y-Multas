/**
 * DebtRepository
 * Handles all database operations related to reader debts - HU-06 only
 */
class DebtRepository {
  constructor(pool) {
    this.pool = pool;
  }

  /**
   * Get a debt by ID
   */
  async getDebtById(id_debt) {
    try {
      const query = 'SELECT * FROM debt_reader WHERE id_debt = $1';
      const result = await this.pool.query(query, [id_debt]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting debt by ID: ${error.message}`);
    }
  }

  /**
   * Update debt payment status
   */
  async markDebtAsPaid(id_debt) {
    try {
      const query = `
        UPDATE debt_reader 
        SET state_debt = 'PAID', updated_at = NOW()
        WHERE id_debt = $1
        RETURNING *
      `;

      const result = await this.pool.query(query, [id_debt]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error marking debt as paid: ${error.message}`);
    }
  }

  /**
   * Get latest debt for a reader with optional filters
   * Filters by: typeId (optional), id_reader (required), name_reader (optional)
   * Returns the most recent debt record (PENDING or PAID)
   */
  async getDebtByReaderWithFilters(filters) {
    try {
      let query = 'SELECT * FROM debt_reader WHERE 1=1';
      const values = [];
      let paramCount = 1;

      // id_reader is required
      if (filters.id_reader) {
        query += ` AND id_reader = $${paramCount}`;
        values.push(filters.id_reader);
        paramCount++;
      }

      // typeId is optional
      if (filters.typeId) {
        query += ` AND type_id_reader = $${paramCount}`;
        values.push(filters.typeId);
        paramCount++;
      }

      // name_reader is optional
      if (filters.name_reader) {
        query += ` AND name_reader = $${paramCount}`;
        values.push(filters.name_reader);
        paramCount++;
      }

      // Order by created_at DESC and get the latest one
      query += ` ORDER BY created_at DESC LIMIT 1`;

      const result = await this.pool.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error getting debt by reader with filters: ${error.message}`);
    }
  }
}

module.exports = DebtRepository;
