/**
 * Wraps an async route handler to automatically catch errors
 * and forward them to Express's global error handler.
 * Eliminates the need for try/catch in every controller method.
 *
 * Usage: router.get('/', asyncHandler(controller.getAll));
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
