/**
 * Extracts a user-friendly error message from an API error response
 * @param {Error} err - The error object from the API call
 * @returns {string} - A user-friendly error message
 */
export const extractErrorMessage = (err) => {
    if (err.response?.data?.message) {
        // Backend returned a structured error response with message field
        return err.response.data.message;
    } else if (err.response?.data?.error) {
        // Backend returned a structured error response with error field
        return err.response.data.error;
    } else if (err.response?.data) {
        // If data is a string or other format
        return typeof err.response.data === 'string' 
            ? err.response.data 
            : 'An unexpected error occurred. Please try again later.';
    } else if (err.message) {
        // Network or other client-side errors
        return err.message;
    }
    // Fallback message
    return 'An unexpected error occurred. Please try again later.';
};

/**
 * Handles API errors consistently across the application
 * @param {Error} err - The error object from the API call
 * @param {Function} showError - The error display function (e.g., from snackbar context)
 * @param {string} operation - The operation that failed (e.g., 'create', 'update', 'delete')
 * @param {string} entityName - The name of the entity (e.g., 'equipment brand', 'invoice')
 */
export const handleApiError = (err, showError, operation, entityName) => {
    console.error(`Error ${operation} ${entityName}:`, err);
    const errorMessage = extractErrorMessage(err);
    showError(`Failed to ${operation} ${entityName}: ${errorMessage}`);
};

/**
 * Creates a standardized error handler for common CRUD operations
 * @param {Function} showError - The error display function
 * @param {string} entityName - The name of the entity
 * @returns {Object} - Object with error handler functions for different operations
 */
export const createErrorHandlers = (showError, entityName) => ({
    handleCreateError: (err) => handleApiError(err, showError, 'create', entityName),
    handleUpdateError: (err) => handleApiError(err, showError, 'update', entityName),
    handleDeleteError: (err) => handleApiError(err, showError, 'delete', entityName),
    handleFetchError: (err) => handleApiError(err, showError, 'fetch', entityName),
    handleGenericError: (err, operation) => handleApiError(err, showError, operation, entityName)
}); 