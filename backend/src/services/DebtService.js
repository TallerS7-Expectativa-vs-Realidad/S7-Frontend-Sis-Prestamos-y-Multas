/**
 * DebtService
 * Handles business logic for debt operations
 */
class DebtService {
  constructor(debtRepository) {
    this.debtRepository = debtRepository;
  }

  /**
   * Get the latest pending debt for a reader
   */
  async getLatestPendingDebtByReader(id_reader) {
    return await this.debtRepository.getLatestPendingDebtByReader(id_reader);
  }

  /**
   * Get all pending debts for a reader
   */
  async getAllPendingDebtsByReader(id_reader) {
    return await this.debtRepository.getAllPendingDebtsByReader(id_reader);
  }

  /**
   * Get a debt by ID
   */
  async getDebtById(dept_id) {
    return await this.debtRepository.getDebtById(dept_id);
  }

  /**
   * Create a new debt record
   */
  async createDebt(debtData) {
    return await this.debtRepository.createDebt(debtData);
  }

  /**
   * Mark a debt as paid
   */
  async markDebtAsPaid(dept_id) {
    return await this.debtRepository.markDebtAsPaid(dept_id);
  }
}

module.exports = DebtService;
