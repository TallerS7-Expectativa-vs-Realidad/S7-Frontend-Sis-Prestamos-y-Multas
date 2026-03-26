import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Search for a book by name to check availability
 * @param {string} name - Book title or identifier to search
 * @returns {Promise} Search results with book status (AVAILABLE, ON_LOAN, etc.)
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
