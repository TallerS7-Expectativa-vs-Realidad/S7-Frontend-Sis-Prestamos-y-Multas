/**
 * LoanService
 * Handles business logic for loan operations
 */
class LoanService {
  constructor(loanRepository, debtRepository) {
    this.loanRepository = loanRepository;
    this.debtRepository = debtRepository;
  }

  /**
   * Create a new loan with all validations and business rules
   * Throws errors for:
   * - INVALID_LOAN_DAYS: loan_days not in [7, 14, 21]
   * - BOOK_NOT_AVAILABLE: book is already on loan
   * - READER_HAS_DEBT: reader has a pending debt
   */
  async createLoan(loanData) {
    // 1. Validate loan_days
    const validLoanDays = [7, 14, 21];
    const loanDaysNum = Number(loanData.loan_days);
    
    if (!validLoanDays.includes(loanDaysNum)) {
      const error = new Error('Invalid loan days');
      error.code = 'INVALID_LOAN_DAYS';
      error.statusCode = 400;
      throw error;
    }

    // 2. Check if book is available
    const isAvailable = await this.loanRepository.isBookAvailable(
      loanData.id_book
    );
    
    if (!isAvailable) {
      const error = new Error('Book is not available');
      error.code = 'BOOK_NOT_AVAILABLE';
      error.statusCode = 409;
      throw error;
    }

    // 3. Check if reader has pending debt
    const pendingDebt = await this.debtRepository.getLatestPendingDebtByReader(
      loanData.id_reader
    );
    
    if (pendingDebt) {
      const error = new Error('Reader has pending debt');
      error.code = 'READER_HAS_DEBT';
      error.statusCode = 409;
      throw error;
    }

    // 4. Calculate date_limit
    const today = new Date();
    const dateLimit = new Date(today);
    dateLimit.setDate(dateLimit.getDate() + loanDaysNum);

    // 5. Insert loan record
    const loanRecord = await this.loanRepository.insertLoan({
      id_book: loanData.id_book,
      title: loanData.title,
      type_id_reader: loanData.type_id_reader,
      id_reader: loanData.id_reader,
      name_reader: loanData.name_reader,
      loan_days: loanDaysNum,
      date_limit: dateLimit,
    });

    return loanRecord;
  }

  /**
   * Get a loan by ID
   */
  async getLoanById(loan_id) {
    return await this.loanRepository.getLoanById(loan_id);
  }
}

module.exports = LoanService;
