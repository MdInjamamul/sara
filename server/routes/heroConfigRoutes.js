const express = require('express');
const router = express.Router();
const heroConfigController = require('../controllers/heroConfigController');

const { protect, admin } = require('../middleware/authMiddleware');

// Define routes
router.get('/', heroConfigController.getHeroConfig);
router.put('/', protect, admin, heroConfigController.updateHeroConfig);

module.exports = router;
