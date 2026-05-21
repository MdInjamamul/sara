const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductBySlug,
    getTrendingProducts,
    getFeaturedProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');
const validate = require('../validators/validate');
const { createProductSchema, updateProductSchema } = require('../validators/productValidator');
const { protect, admin } = require('../middleware/authMiddleware');
const reviewRouter = require('./reviewRoutes');

// Mount review router
router.use('/:productId/reviews', reviewRouter);

// Public read routes (no validation needed on body)
router.get('/trending', getTrendingProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);
router.get('/', getProducts);

// Write routes — validation middleware runs BEFORE the controller
router.post('/', protect, admin, validate(createProductSchema), createProduct);
router.put('/:id', protect, admin, validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
