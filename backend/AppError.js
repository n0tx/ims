/**
 * Custom Application Error Class for Domain-Specific Errors
 * Provides structured error handling with status codes and detailed messages
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a validation error (400)
   */
  static validation(message, code = 'VALIDATION_ERROR') {
    return new AppError(message, 400, code);
  }

  /**
   * Create a not found error (404)
   */
  static notFound(message, code = 'NOT_FOUND') {
    return new AppError(message, 404, code);
  }

  /**
   * Create a conflict error (409)
   */
  static conflict(message, code = 'CONFLICT') {
    return new AppError(message, 409, code);
  }

  /**
   * Create an internal server error (500)
   */
  static internal(message, code = 'INTERNAL_ERROR') {
    return new AppError(message, 500, code);
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        statusCode: this.statusCode
      }
    };
  }
}
