const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getSalesAnalytics,
    getTopProducts,
    getCategorySales,
    getOrderStatusDistribution
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

// All analytics routes require admin access
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesAnalytics);
router.get('/top-products', getTopProducts);
router.get('/category-sales', getCategorySales);
router.get('/order-status', getOrderStatusDistribution);

module.exports = router;
