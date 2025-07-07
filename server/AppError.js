/**
 * Frontend Server AppError Placeholder
 * This file exists for compatibility but is not used.
 * All error handling logic is implemented in the backend API on port 8000.
 * The frontend handles API errors through the React query client.
 */

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    console.log('Frontend AppError placeholder - backend handles actual errors');
  }
}

export default AppError;
