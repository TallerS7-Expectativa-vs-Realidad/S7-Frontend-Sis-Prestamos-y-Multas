import { useState } from 'react';
import { createLoan, returnLoan as returnLoanService } from '../services/loanService.js';

/**
 * Hook for managing loan creation
 * @returns {Object} Hook state and methods
 */
export function useLoan() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loanData, setLoanData] = useState(null);

  const register = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await createLoan(data);
      setLoanData(response);
      setSuccess(true);
      return response;
    } catch (err) {
      let errorMessage = 'Unknown error occurred';

      if (err.response) {
        const status = err.response.status;
        const errorCode = err.response.data?.error;

        if (status === 400) {
          if (errorCode === 'INVALID_LOAN_DAYS') {
            errorMessage = 'Loan days must be 7, 14, or 21';
          } else if (errorCode === 'INVALID_PAYLOAD') {
            errorMessage = 'Invalid data provided';
          } else {
            errorMessage = err.response.data?.message || 'Invalid request';
          }
        } else if (status === 409) {
          if (errorCode === 'BOOK_NOT_AVAILABLE') {
            errorMessage = 'The book is not available for loan';
          } else if (errorCode === 'READER_HAS_DEBT') {
            errorMessage = 'Reader has pending debt and cannot borrow books';
          } else {
            errorMessage = err.response.data?.message || 'Conflict error';
          }
        } else {
          errorMessage = err.response.data?.message || `Error: ${status}`;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const returnLoan = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await returnLoanService(data);
      setLoanData(response);
      setSuccess(true);
      return response;
    } catch (err) {
      let errorMessage = 'Unknown error occurred';

      if (err.response) {
        const status = err.response.status;
        const errorCode = err.response.data?.error;

        if (status === 400) {
          if (errorCode === 'INVALID_PAYLOAD') {
            errorMessage = 'Invalid data provided';
          } else {
            errorMessage = err.response.data?.message || 'Invalid request';
          }
        } else if (status === 404) {
          if (errorCode === 'LOAN_NOT_FOUND') {
            errorMessage = 'Loan not found';
          } else {
            errorMessage = err.response.data?.message || 'Loan not found';
          }
        } else if (status === 409) {
          if (errorCode === 'ALREADY_RETURNED') {
            errorMessage = 'This loan has already been returned';
          } else {
            errorMessage = err.response.data?.message || 'Conflict error';
          }
        } else {
          errorMessage = err.response.data?.message || `Error: ${status}`;
        }
      } else if (err.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
    setLoanData(null);
  };

  return {
    register,
    returnLoan,
    reset,
    isLoading,
    error,
    success,
    loanData
  };
}
