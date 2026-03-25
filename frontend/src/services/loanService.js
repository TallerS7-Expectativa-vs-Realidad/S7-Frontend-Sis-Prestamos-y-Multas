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
  const res = await axios.post(`${API_BASE}/api/v1/loan`, loanData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res.data;
}

/**
 * Fetch loan details
 * @param {string} id - Loan ID
 * @returns {Promise} Loan details
 */
export async function getLoan(id) {
  const res = await axios.get(`${API_BASE}/api/v1/loan/${id}`);
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
 * @returns {Promise} Updated loan response
 */
export async function returnLoan(returnData) {
  const res = await axios.patch(`${API_BASE}/api/v1/loan`, returnData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res.data;
}
