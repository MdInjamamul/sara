const asyncHandler = require('../middleware/asyncHandler');
const analyticsService = require('../services/analyticsService');

/**
 * Analytics Controller — Thin layer for analytics endpoints.
 */

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await analyticsService.getDashboardStats();
    res.json(stats);
});

// @desc    Get sales analytics by period
// @route   GET /api/analytics/sales?period=daily|monthly|yearly
const getSalesAnalytics = asyncHandler(async (req, res) => {
    const period = req.query.period || 'monthly';
    const data = await analyticsService.getSalesAnalytics(period);
    res.json(data);
});

// @desc    Get top selling products
// @route   GET /api/analytics/top-products?limit=10
const getTopProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const data = await analyticsService.getTopProducts(limit);
    res.json(data);
});

// @desc    Get sales by category
// @route   GET /api/analytics/category-sales
const getCategorySales = asyncHandler(async (req, res) => {
    const data = await analyticsService.getCategorySales();
    res.json(data);
});

// @desc    Get order status distribution
// @route   GET /api/analytics/order-status
const getOrderStatusDistribution = asyncHandler(async (req, res) => {
    const data = await analyticsService.getOrderStatusDistribution();
    res.json(data);
});

module.exports = {
    getDashboardStats,
    getSalesAnalytics,
    getTopProducts,
    getCategorySales,
    getOrderStatusDistribution
};
