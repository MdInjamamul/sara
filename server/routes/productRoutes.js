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

// Public read routes (no validation needed on body)
router.get('/trending', getTrendingProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', getProductBySlug);
router.get('/', getProducts);

// Write routes — validation middleware runs BEFORE the controller
router.post('/', validate(createProductSchema), createProduct);
router.put('/:id', validate(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
