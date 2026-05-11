// Placeholder admin authentication middleware
// TODO: Replace with JWT/session auth in a future phase
const adminAuth = (req, res, next) => {
    // For now, all admin routes are accessible without authentication
    next();
};

module.exports = adminAuth;
