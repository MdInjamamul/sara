const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    getAllProductsAdmin,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/adminProductController');

router.route('/')
    .get(getAllProductsAdmin)
    .post(upload.array('images', 5), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(upload.array('images', 5), updateProduct)
    .delete(deleteProduct);

module.exports = router;
