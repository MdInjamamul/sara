const Product = require('../models/Product');
const Category = require('../models/Category');

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res) => {
    try {
        const { category, featured, limit } = req.query;
        let query = {};

        if (category) {
            query.categorySlug = category;
        }
        if (featured === 'true') {
            query.isFeatured = true;
        }

        let products = Product.find(query).populate('category');

        if (limit) {
            products = products.limit(parseInt(limit));
        }

        const result = await products;
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
const getProductBySlug = async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug }).populate('category');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trending/new products
// @route   GET /api/products/trending
const getTrendingProducts = async (req, res) => {
    try {
        const products = await Product.find({
            $or: [{ isNew: true }, { isBestseller: true }]
        }).limit(6).populate('category');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isFeatured: true }).limit(8).populate('category');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductBySlug,
    getTrendingProducts,
    getFeaturedProducts
};
