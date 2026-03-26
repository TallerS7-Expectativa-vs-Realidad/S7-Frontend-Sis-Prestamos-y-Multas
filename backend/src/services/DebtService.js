/**
 * DebtService
 * Handles business logic for debt operations - HU-06 only
 */

class DebtService {
  constructor(debtRepository) {
    this.debtRepository = debtRepository;
  }

  /**
   * Get a debt by ID
   */
  async getDebtById(id_debt) {
    return await this.debtRepository.getDebtById(id_debt);
  }

  /**
   * Mark a debt as paid
   */
  async markDebtAsPaid(id_debt) {
    return await this.debtRepository.markDebtAsPaid(id_debt);
  }

  /**
   * Get debt for a reader with optional filters
   * Requires: id_reader in filters
   * Optional: typeId, name_reader
   * 
   * @param {Object} filters - { id_reader: string, typeId?: string, name_reader?: string }
   * @returns {Object} Debt record if found
   * @throws {Error} with statusCode 400 if id_reader is missing
   * @throws {Error} with statusCode 404 if debt not found
   */
  async getDebtByReaderWithFilters(filters) {
    // Validate required filters
    if (!filters.id_reader) {
      const error = new Error('id_reader is required');
      error.statusCode = 400;
      error.code = 'INVALID_QUERY';
      throw error;
    }

    // Get debt from repository
    const debt = await this.debtRepository.getDebtByReaderWithFilters(filters);

    if (!debt) {
      const error = new Error('No debt found for this reader');
      error.statusCode = 404;
      error.code = 'DEBT_NOT_FOUND';
      throw error;
    }

    return debt;
  }

  /**
   * Pay a debt in full
   * Validates that:
   * - Debt exists
   * - Debt state is PENDING (not already paid)
   * 
   * @param {number} id_debt - Debt ID to pay
   * @returns {Object} Updated debt record with state_debt = PAID
   * @throws {Error} with statusCode 404 if debt not found
   * @throws {Error} with statusCode 409 if debt already paid
   */
  async payDebt(id_debt) {
    // Get the debt first to verify it exists and check state
    const debt = await this.debtRepository.getDebtById(id_debt);

    if (!debt) {
      const error = new Error('Debt not found');
      error.statusCode = 404;
      error.code = 'DEBT_NOT_FOUND';
      throw error;
    }

    // Check if debt is already paid
    if (debt.state_debt === 'PAID') {
      const error = new Error('This debt has already been paid');
      error.statusCode = 409;
      error.code = 'DEBT_ALREADY_PAID';
      throw error;
    }

    // Mark debt as paid
    const updatedDebt = await this.debtRepository.markDebtAsPaid(id_debt);
    return updatedDebt;
  }
}

module.exports = DebtService;
