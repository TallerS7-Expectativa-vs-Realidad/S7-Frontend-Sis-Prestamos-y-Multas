import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Get reader debt information by search filters
 * @param {Object} filters - Search filters
 * @param {string} [filters.typeId] - Reader ID type (DNI or CI)
 * @param {string} [filters.id_reader] - Reader ID
 * @param {string} [filters.name_reader] - Reader name (optional)
 * @returns {Promise} Reader debt data or empty array if not found
 */
export async function getReaderDebt(filters) {
  try {
    const params = new URLSearchParams();
    
    if (filters.typeId) {
      params.append('typeId', filters.typeId);
    }
    if (filters.id_reader) {
      params.append('id', filters.id_reader);
    }
    if (filters.name_reader) {
      params.append('name', filters.name_reader);
    }

    const res = await axios.get(`${API_BASE}/api/v1/readers/debt?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return res.data?.data ?? res.data;
  } catch (err) {
    // Return empty array if debt not found (404) instead of throwing
    if (err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Register payment for a debt (mark as PAID)
 * @param {string} idDebt - Debt ID to pay
 * @returns {Promise} Updated debt data
 */
export async function payDebt(idDebt) {
  const res = await axios.patch(
    `${API_BASE}/api/v1/debts/${idDebt}`,
    { state_debt: 'PAID' },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  return res.data?.data ?? res.data;
}
