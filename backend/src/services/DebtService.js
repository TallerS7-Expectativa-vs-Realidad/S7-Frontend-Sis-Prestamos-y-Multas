/**
 * DebtService
 * Handles business logic for debt operations
 */

// ============================================================
// CONSTANTS
// ============================================================
// Base amount for Fibonacci unit (can be configured per library)
const BASE_FIB_AMOUNT = 1.00;

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

  /**
   * Calculate Fibonacci units based on days late
   * Rules (from PRD and HU-04 spec):
   * - If days_late <= 0, no debt (return 0 units)
   * - weeks = ((days_late - 1) // 7) + 1 (complete weeks only)
   * - units_fib = sum(Fibonacci[0..weeks-1])
   * - amount_dept = units_fib * BASE_FIB_AMOUNT
   * 
   * Examples:
   * - 1 day late: weeks=1, fib[0]=1, sum=1
   * - 7 days late: weeks=1, fib[0]=1, sum=1
   * - 8 days late: weeks=2, fib[0,1]=[1,1], sum=2
   * - 15 days late: weeks=3, fib[0,1,2]=[1,1,2], sum=4
   * - 22 days late: weeks=4, fib[0,1,2,3]=[1,1,2,3], sum=7
   * 
   * @param {number} days_late - Number of days the book is late
   * @returns {Object} { units_fib, amount_dept }
   */
  calculateFibUnits(days_late) {
    // No debt if return is on time or early
    if (days_late <= 0) {
      return { units_fib: 0, amount_dept: 0 };
    }

    // Calculate complete weeks
    const weeks = Math.floor((days_late - 1) / 7) + 1;

    // Generate Fibonacci sequence up to 'weeks' terms
    const fibSequence = this._generateFibonacciSequence(weeks);

    // Sum the Fibonacci units
    const units_fib = fibSequence.reduce((sum, val) => sum + val, 0);

    // Calculate monetary amount
    const amount_dept = units_fib * BASE_FIB_AMOUNT;

    return {
      units_fib,
      amount_dept: parseFloat(amount_dept.toFixed(2)), // Round to 2 decimal places
    };
  }

  /**
   * Generate Fibonacci sequence with 'n' terms
   * Starts with 1, 1, 2, 3, 5, 8, ...
   * 
   * @param {number} n - Number of Fibonacci terms to generate
   * @returns {number[]} Array of Fibonacci numbers
   * @private
   */
  _generateFibonacciSequence(n) {
    if (n <= 0) return [];
    if (n === 1) return [1];
    
    const fib = [1, 1];
    for (let i = 2; i < n; i++) {
      fib.push(fib[i - 1] + fib[i - 2]);
    }
    return fib;
  }
}

module.exports = DebtService;
