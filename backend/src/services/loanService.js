/**
 * LoanService
 * Handles business logic for loan operations
 */
class LoanService {
  constructor(loanRepository, debtService) {
    this.loanRepository = loanRepository;
    this.debtService = debtService;
  }

  async searchAvailabilityByName(name) {
    const normalizedName = String(name || '').trim();

    if (!normalizedName) {
      const error = new Error('Invalid book name');
      error.code = 'INVALID_NAME';
      error.statusCode = 400;
      throw error;
    }

    const results = await this.loanRepository.findByName(normalizedName);

    if (results.length === 0) {
      return {
        results: [],
        message: 'El libro no registra historial de préstamo y se considera disponible para préstamo.',
      };
    }

    return {
      results,
      message: 'Consulta realizada correctamente.',
    };
  }

  /**
   * Create a new loan with all validations and business rules
   * Throws specific business logic errors:
   * - INVALID_LOAN_DAYS (400): loan_days not in [7, 14, 21]
   * - BOOK_NOT_AVAILABLE (409): book is already on loan
   * - READER_HAS_DEBT (409): reader has a pending debt
   * 
   * These errors are caught by middleware/errorHandler.js which returns
   * the appropriate HTTP status code and error code to the client.
   * 
   * @param {Object} loanData - Validated loan data from Zod schema
   * @returns {Object} The created loan record
   * @throws {Error} Custom error with code and statusCode properties
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
    const pendingDebt = await this.debtService.getLatestPendingDebtByReader(
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
   * Register the return of a loan (HU-03 on-time and HU-04 late returns)
   * Throws specific business logic errors:
   * - LOAN_NOT_FOUND (404): no active loan found with provided criteria
   * - ALREADY_RETURNED (409): loan is already in RETURNED state
   * - SEARCH_ERROR (500): error during database search
   * - UPDATE_ERROR (500): error updating loan return info
   * - DEBT_CREATION_ERROR (500): error creating debt (HU-04 only)
   * 
   * These errors are caught by middleware/errorHandler.js which returns
   * the appropriate HTTP status code and error code to the client.
   * 
   * For late returns (days_late > 0), calculates Fibonacci-based penalty using:
   * - days_late = (date_return - date_limit).days
   * - weeks = ((days_late - 1) // 7) + 1
  * - amount_debt = sum of (Fibonacci[i] * base_fib_amount) for each week (cumulative)
   * 
   * Search logic (flexible identifier):
   * - If both id_book and id_reader: find by both (exact match)
   * - If id_book + name_reader: find by book with reader name narrowing
   * - If only id_book: find most recent loan for that book
   * - If only id_reader: find most recent loan for that reader
   * 
   * @param {Object} returnData - Validated return data from Zod schema
   * @returns {Object} { loan, debt, days_late } 
   *   - loan: updated loan with state=RETURNED
   *   - debt: null if on-time, debt object if late (HU-04)
   *   - days_late: number of days past deadline (0 if on-time)
   * @throws {Error} Custom error with code and statusCode properties
   */
  async returnLoan(returnData) {
    const { id_book, id_reader, name_reader, date_return, type_id_reader, base_fib_amount } = returnData;

    let activeLoan = null;
    let latestLoan = null;
    
    // Normalize inputs: convert empty strings to null
    const normalizedIdBook = id_book && String(id_book).trim() !== '' ? String(id_book).trim() : null;
    const normalizedIdReader = id_reader && String(id_reader).trim() !== '' ? String(id_reader).trim() : null;
    const normalizedNameReader = name_reader && String(name_reader).trim() !== '' ? String(name_reader).trim() : null;

    // Search for loan based on provided criteria
    try {
      if (normalizedIdBook && normalizedIdReader) {
        activeLoan = await this.loanRepository.getActiveLoanByBookAndReader(
          normalizedIdBook,
          normalizedIdReader
        );
        latestLoan = await this.loanRepository.getLatestLoanByBookAndReader(
          normalizedIdBook,
          normalizedIdReader
        );
      } else if (normalizedIdBook) {
        activeLoan = await this.loanRepository.getActiveLoanByBook(normalizedIdBook);
        latestLoan = await this.loanRepository.getLatestLoanByBook(normalizedIdBook);
      } else if (normalizedIdReader) {
        activeLoan = await this.loanRepository.getActiveLoanByReader(normalizedIdReader);
        latestLoan = await this.loanRepository.getLatestLoanByReader(normalizedIdReader);
      }
    } catch (error) {
      const err = new Error(`Error searching for loan: ${error.message}`);
      err.code = 'SEARCH_ERROR';
      err.statusCode = 500;
      throw err;
    }

    if (!activeLoan && latestLoan && latestLoan.state === 'RETURNED') {
      const error = new Error('Loan has already been returned');
      error.code = 'ALREADY_RETURNED';
      error.statusCode = 409;
      throw error;
    }

    if (!activeLoan) {
      const error = new Error('Loan not found with provided criteria');
      error.code = 'LOAN_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }

    // Update loan return information
    let updatedLoan;
    try {
      updatedLoan = await this.loanRepository.updateReturn(activeLoan.loan_id, date_return);
    } catch (error) {
      const err = new Error(`Error updating loan: ${error.message}`);
      err.code = 'UPDATE_ERROR';
      err.statusCode = 500;
      throw err;
    }

    // ============================================================
    // PROCESS LATE RETURN & GENERATE DEBT (HU-04)
    // ============================================================
    let debtRecord = null;
    
    // Calculate days late
    const returnDate = new Date(date_return);
      const limitDate = new Date(activeLoan.date_limit);
    const timeDiff = returnDate.getTime() - limitDate.getTime();
    const days_late = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // Convert ms to days

    // If late, create debt record
    if (days_late > 0) {
      try {
        const { units_fib, amount_debt } = this.debtService.calculateFibUnits(
          days_late,
          base_fib_amount
        );

        debtRecord = await this.debtService.createDebt({
          loan_id: activeLoan.loan_id,
          type_id_reader: activeLoan.type_id_reader,
          id_reader: activeLoan.id_reader,
          name_reader: activeLoan.name_reader,
          units_fib,
          amount_debt,
        });
      } catch (error) {
        const err = new Error(`Error creating debt record: ${error.message}`);
        err.code = 'DEBT_CREATION_ERROR';
        err.statusCode = 500;
        throw err;
      }
    }

    // Return both loan and debt (debt will be null if no penalty)
    return {
      loan: updatedLoan,
      debt: debtRecord,
      days_late: days_late > 0 ? days_late : 0,
    };
  }
}

module.exports = LoanService;
