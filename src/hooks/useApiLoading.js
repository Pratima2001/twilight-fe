"use client";

import { useState, useCallback } from "react";

/**
 * Custom hook for managing API call loading states
 * 
 * @returns {Object} Object containing loading state and wrapper function
 * 
 * @example
 * const { isLoading, withLoading } = useApiLoading();
 * 
 * const fetchData = async () => {
 *   const data = await withLoading(async () => {
 *     const response = await fetch('/api/data');
 *     return response.json();
 *   });
 *   setData(data);
 * };
 */
export default function useApiLoading(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);

  /**
   * Wraps an async function with loading state management
   * @param {Function} asyncFn - Async function to execute
   * @returns {Promise} Result of the async function
   */
  const withLoading = useCallback(async (asyncFn) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await asyncFn();
      return result;
    } catch (err) {
      setError(err);
      console.error("API Error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Manually set loading state
   */
  const setLoading = useCallback((value) => {
    setIsLoading(value);
  }, []);

  /**
   * Reset error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    withLoading,
    setLoading,
    clearError,
  };
}
