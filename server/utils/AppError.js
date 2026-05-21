/**
 * Custom operational error class.
 * Extends the native Error to include an HTTP status code.
 * Used throughout the Service layer to signal business-rule violations.
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        // Captures the stack trace, excluding this constructor call
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
