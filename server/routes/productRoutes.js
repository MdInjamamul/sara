const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductBySlug,
    getTrendingProducts,
    getFeaturedProducts
} = require('../controllers/productController');

router.get('/trending', getTrendingProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);
router.get('/', getProducts);

module.exports = router;
