import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Create a new loan for a reader
 * @param {Object} loanData - Loan data
 * @param {string} loanData.id_book - Book ID
 * @param {string} loanData.title - Book title
 * @param {string} loanData.type_id_reader - Reader ID type
 * @param {string} loanData.id_reader - Reader ID
 * @param {string} loanData.name_reader - Reader name
 * @param {number} loanData.loan_days - Loan duration (7, 14, or 21)
 * @returns {Promise} API response
 */
export async function createLoan(loanData) {
  const res = await axios.post(`${API_BASE}/api/v1/loans`, loanData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res.data?.data ?? res.data;
}

/**
 * Search loans by book name
 * @param {string} name - Book title or fragment
 * @returns {Promise} Search results
 */
export async function searchLoanByName(name) {
  const res = await axios.get(`${API_BASE}/api/v1/loans/${encodeURIComponent(name)}`);
  return res.data;
}

/**
 * Return a book (register return within due date)
 * @param {Object} returnData - Return data
 * @param {string} returnData.id_book - Book ID (optional if id_reader is provided)
 * @param {string} returnData.title - Book title (optional, only used if id_book is provided)
 * @param {string} returnData.date_return - Return date (YYYY-MM-DD, required)
 * @param {string} returnData.type_id_reader - Reader ID type (DNI or CI, required)
 * @param {string} returnData.id_reader - Reader ID (optional if id_book is provided)
 * @returns {Promise} Normalized return response with loan and debt data
 */
export async function returnLoan(returnData) {
  const res = await axios.patch(`${API_BASE}/api/v1/loans`, returnData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Normalize backend response structure
  // Backend returns: { success, data: { loan, debt, days_late } }
  // Frontend expects: { loan_id, state, date_return, days_late?, units_fib?, amount_debt?, id_debt? }
  const backendResponse = res.data;
  
  if (backendResponse.data) {
    const { loan, debt, days_late } = backendResponse.data;
    
    // Merge loan and debt data into a single object
    const normalizedData = {
      // Loan info
      loan_id: loan.loan_id,
      id_book: loan.id_book,
      title: loan.title,
      id_reader: loan.id_reader,
      name_reader: loan.name_reader,
      date_return: loan.date_return,
      state: loan.state,
      
      // Debt info (if late return)
      days_late: days_late || null,
      ...(debt && {
        id_debt: debt.id_debt,
        units_fib: debt.units_fib,
        amount_debt: debt.amount_debt,
        state_debt: debt.state_debt
      })
    };
    
    return normalizedData;
  }
  
  // Fallback for different response structure
  return backendResponse;
}
