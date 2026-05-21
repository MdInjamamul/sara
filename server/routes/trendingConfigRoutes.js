const express = require('express');
const router = express.Router();
const trendingConfigController = require('../controllers/trendingConfigController');

// Define routes
router.get('/', trendingConfigController.getTrendingConfig);
router.put('/', trendingConfigController.updateTrendingConfig);

module.exports = router;
