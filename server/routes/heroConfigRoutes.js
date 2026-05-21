const express = require('express');
const router = express.Router();
const heroConfigController = require('../controllers/heroConfigController');

// Define routes
router.get('/', heroConfigController.getHeroConfig);
router.put('/', heroConfigController.updateHeroConfig);

module.exports = router;
