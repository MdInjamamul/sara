const AppError = require('../utils/AppError');

/**
 * Global error-handling middleware.
 * Differentiates between operational errors (AppError) and unexpected crashes.
 * Always returns a consistent JSON shape: { message }
 */
const errorHandler = (err, req, res, next) => {
    // If headers already sent, delegate to Express default handler
    if (res.headersSent) {
        return next(err);
    }

    // Mongoose validation error → 400
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: messages.join(', ') });
    }

    // Mongoose bad ObjectId → 400
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Mongoose duplicate key → 409
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(', ');
        return res.status(409).json({ message: `Duplicate value for: ${field}` });
    }

    // Joi validation error (from our validate middleware) → 400
    if (err.isJoi) {
        return res.status(400).json({ message: err.details.map((d) => d.message).join(', ') });
    }

    // Our custom AppError → use its statusCode
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ message: err.message });
    }

    // Unexpected / programmer error → 500
    console.error('UNEXPECTED ERROR:', err);
    res.status(500).json({
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong'
            : err.message
    });
};

module.exports = { errorHandler };
