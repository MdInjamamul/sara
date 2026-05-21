const express = require('express');
const router = express.Router();
const trendingConfigController = require('../controllers/trendingConfigController');

const { protect, admin } = require('../middleware/authMiddleware');

// Define routes
router.get('/', trendingConfigController.getTrendingConfig);
router.put('/', protect, admin, trendingConfigController.updateTrendingConfig);

module.exports = router;
