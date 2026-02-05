/**
 * Utility functions for authentication
 */

/**
 * Get the authentication token from local storage
 */
export const getToken = (): Promise<string | null> => {
  return new Promise((resolve) => {
    const token = localStorage.getItem('auth-token');
    resolve(token);
  });
};

/**
 * Refresh token if needed
 */
export const refreshTokenIfNeeded = async (): Promise<void> => {
  // In a real implementation, you would check if the token is expired
  // and refresh it if needed. For now, we'll just return a resolved promise.
  // You could implement actual token refresh logic here based on your backend API.
  return Promise.resolve();
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const token = localStorage.getItem('auth-token');
    resolve(!!token); // Convert to boolean
  });
};

/**
 * Clear authentication data
 */
export const clearAuth = (): void => {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('auth-user');
};