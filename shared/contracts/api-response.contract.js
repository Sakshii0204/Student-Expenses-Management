/**
 * Standard API Response Envelope Contract
 * Used across Developer 1, 2, and 3 services.
 */

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_ERROR: 500,
};

/**
 * Format uniform success response
 * @param {any} data - Payload
 * @param {string} message - Human-readable summary
 * @param {number} statusCode - HTTP status code
 */
export function successResponse(data = null, message = 'Operation successful', statusCode = 200) {
  return {
    success: true,
    statusCode,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Format uniform error response
 * @param {string} message - Primary error summary
 * @param {number} statusCode - HTTP status code
 * @param {Array|Object|null} errors - Detailed validation or sub-errors
 */
export function errorResponse(message = 'An unexpected error occurred', statusCode = 500, errors = null) {
  return {
    success: false,
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
}
