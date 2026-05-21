const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Apply admin auth to all routes
router.use(adminAuth);

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalCategories = await Category.countDocuments();
        const outOfStock = await Product.countDocuments({ inStock: false });
        const featuredProducts = await Product.countDocuments({ isFeatured: true });

        // Products per category
        const categories = await Category.find({});
        const categoryStats = await Promise.all(
            categories.map(async (cat) => {
                const count = await Product.countDocuments({ category: cat._id });
                return {
                    name: cat.name,
                    slug: cat.slug,
                    productCount: count
                };
            })
        );

        res.json({
            totalProducts,
            totalCategories,
            outOfStock,
            featuredProducts,
            categoryStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
