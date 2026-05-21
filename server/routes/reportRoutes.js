const express = require('express');
const router = express.Router();
const { getOrderReport } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/orders', protect, admin, getOrderReport);

module.exports = router;
