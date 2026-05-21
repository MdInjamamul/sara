const asyncHandler = require('../middleware/asyncHandler');
const reportService = require('../services/reportService');

// @desc    Get order report data
// @route   GET /api/reports/orders?period=daily|monthly|yearly
const getOrderReport = asyncHandler(async (req, res) => {
    const period = req.query.period || 'monthly';
    const report = await reportService.getOrderReport(period);
    res.json(report);
});

module.exports = { getOrderReport };
