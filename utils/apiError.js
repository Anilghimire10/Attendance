class ApiError extends Error {
  /**
   * Create an ApiError instance.
   * @param {number} statusCode - HTTP status code of the error.
   * @param {string} message - Human-readable error message.
   * @param {boolean} isOperational - True if the error is expected/operational.
   */
  constructor(message, statusCode, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
