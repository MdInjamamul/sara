const express = require('express');
const router = express.Router();
const {
    getHomepageConfig,
    updateHeroSlides,
    updateTrendingProducts,
    updateCategoryDisplay
} = require('../controllers/adminHomepageController');

router.get('/', getHomepageConfig);
router.put('/hero', updateHeroSlides);
router.put('/trending', updateTrendingProducts);
router.put('/categories', updateCategoryDisplay);

module.exports = router;
