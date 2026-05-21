const asyncHandler = require('../middleware/asyncHandler');
const productService = require('../services/productService');
const createProductDto = require('../dtos/input/createProductDto');
const updateProductDto = require('../dtos/input/updateProductDto');
const { productDto, productListDto } = require('../dtos/output/productDto');

/**
 * Product Controller — The thin orchestration layer.
 * No try/catch, no DB calls, no business logic.
 * Only job: call Service → format with DTO → send response.
 */

// @desc    Get all products
// @route   GET /api/products
const getProducts = asyncHandler(async (req, res) => {
    const products = await productService.getAllProducts(req.query);
    res.json(productListDto(products));
});

// @desc    Get single product by slug
// @route   GET /api/products/:slug
const getProductBySlug = asyncHandler(async (req, res) => {
    const product = await productService.getProductBySlug(req.params.slug);
    res.json(productDto(product));
});

// @desc    Get trending/new products
// @route   GET /api/products/trending
const getTrendingProducts = asyncHandler(async (req, res) => {
    const products = await productService.getTrendingProducts();
    res.json(productListDto(products));
});

// @desc    Get featured products
// @route   GET /api/products/featured
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const products = await productService.getFeaturedProducts();
    res.json(productListDto(products));
});

// @desc    Create a product
// @route   POST /api/products
const createProduct = asyncHandler(async (req, res) => {
    const dto = createProductDto(req.body);
    const product = await productService.createProduct(dto);
    res.status(201).json(productDto(product));
});

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
    const dto = updateProductDto(req.body);
    const product = await productService.updateProduct(req.params.id, dto);
    res.json(productDto(product));
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
    const result = await productService.deleteProduct(req.params.id);
    res.json(result);
});

module.exports = {
    getProducts,
    getProductBySlug,
    getTrendingProducts,
    getFeaturedProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
