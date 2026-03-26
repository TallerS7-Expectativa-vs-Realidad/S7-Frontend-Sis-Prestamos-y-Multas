import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Search for a book by name to check availability
 * @param {string} name - Book title or identifier to search
 * @returns {Promise} Array of book copies with: { id_book, loan_id, status }
 *   - id_book: Unique identifier for each copy
 *   - loan_id: ID of the last loan (null if no history)
 *   - status: "ON_LOAN" or "RETURNED"
 */
export async function searchBookByName(name) {
  try {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      throw new Error('INVALID_NAME');
    }

    const res = await axios.get(`${API_BASE}/api/v1/loans/${encodeURIComponent(name.trim())}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return res.data?.results ?? res.data;
  } catch (err) {
    // Re-throw error with meaningful classification
    if (err.response?.status === 400) {
      const errorCode = err.response.data?.code || 'INVALID_NAME';
      throw new Error(errorCode);
    }
    throw err;
  }
}

/**
 * Get list of overdue loans (not returned and past date_limit)
 * @returns {Promise} Array of overdue loans with book and reader information
 */
export async function getOverdueLoans() {
  try {
    const res = await axios.get(`${API_BASE}/api/v1/loans/outTime`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return res.data?.data ?? res.data ?? [];
  } catch (err) {
    if (err.response?.status === 404) {
      // No overdue loans found
      return [];
    }
    throw err;
  }
}
