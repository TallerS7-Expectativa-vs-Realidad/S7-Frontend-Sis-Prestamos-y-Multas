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

  /**
   * Register the return of a loan (HU-03 and HU-04)
   * Validates:
   * - At least one of id_book or id_reader is provided
   * - Loan exists (404 if not found or multiple matches)
   * - Loan is not already returned (409 if already returned)
   * Updates loan with date_return and state=RETURNED
   * 
   * Search logic:
   * - If both id_book and id_reader provided: find by both (exact match)
   * - If only id_book provided: find by book (use name_reader to narrow search if provided)
   * - If only id_reader provided: find by reader
   */
  async returnLoan(returnData) {
    const { id_book, id_reader, name_reader, date_return, type_id_reader } = returnData;

    let loan = null;
    
    // Normalize inputs: convert empty strings to null
    const normalizedIdBook = id_book && String(id_book).trim() !== '' ? String(id_book).trim() : null;
    const normalizedIdReader = id_reader && String(id_reader).trim() !== '' ? String(id_reader).trim() : null;
    const normalizedNameReader = name_reader && String(name_reader).trim() !== '' ? String(name_reader).trim() : null;

    // Search for loan based on provided criteria
    try {
      if (normalizedIdBook && normalizedIdReader) {
        // Both id_book and id_reader provided: exact match
        loan = await this.loanRepository.getActiveLoanByBookAndReader(
          normalizedIdBook,
          normalizedIdReader
        );
      } else if (normalizedIdBook && normalizedNameReader) {
        // id_book and name_reader provided: search by book with reader name
        loan = await this.loanRepository.getActiveLoanByTitleAndReader(
          normalizedNameReader,
          normalizedIdBook
        );
      } else if (normalizedIdBook) {
        // Only id_book provided: search by book
        loan = await this.loanRepository.getActiveLoanByBook(normalizedIdBook);
      } else if (normalizedIdReader) {
        // Only id_reader provided: search by reader
        loan = await this.loanRepository.getActiveLoanByReader(normalizedIdReader);
      }
    } catch (error) {
      const err = new Error(`Error searching for loan: ${error.message}`);
      err.code = 'SEARCH_ERROR';
      err.statusCode = 500;
      throw err;
    }

    // Check if loan was found
    if (!loan) {
      const error = new Error('Loan not found with provided criteria');
      error.code = 'LOAN_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Check if loan is already returned
    if (loan.state === 'RETURNED') {
      const error = new Error('Loan has already been returned');
      error.code = 'ALREADY_RETURNED';
      error.statusCode = 409;
      throw error;
    }

    // Update loan return information
    try {
      const updatedLoan = await this.loanRepository.updateReturn(loan.loan_id, date_return);
      return updatedLoan;
    } catch (error) {
      const err = new Error(`Error updating loan: ${error.message}`);
      err.code = 'UPDATE_ERROR';
      err.statusCode = 500;
      throw err;
    }
  }
}

module.exports = LoanService;
