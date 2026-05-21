const HomepageConfig = require('../models/HomepageConfig');
const Product = require('../models/Product');
const Category = require('../models/Category');

// Helper to get or create the singleton config
const getConfig = async () => {
    let config = await HomepageConfig.findOne({ isSingleton: true });
    if (!config) {
        config = await HomepageConfig.create({ isSingleton: true });
    }
    return config;
};

// @desc    Get homepage configuration (Admin)
// @route   GET /api/admin/homepage
const getHomepageConfig = async (req, res) => {
    try {
        const config = await getConfig();
        
        // Populate product details for the admin view
        await config.populate({
            path: 'heroSlides.products',
            select: 'name slug categorySlug images price inStock'
        });
        
        await config.populate({
            path: 'trendingProducts',
            select: 'name slug categorySlug images price inStock'
        });

        // Map is not easily populated via Mongoose .populate() directly in the same way,
        // so we can resolve the category display products manually
        const populatedConfig = config.toObject();
        
        if (config.categoryDisplayProducts) {
            populatedConfig.populatedCategoryDisplay = {};
            for (const [catSlug, productId] of config.categoryDisplayProducts.entries()) {
                const product = await Product.findById(productId).select('name images categorySlug');
                if (product) {
                    populatedConfig.populatedCategoryDisplay[catSlug] = product;
                }
            }
        }

        res.json(populatedConfig);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update hero slides
// @route   PUT /api/admin/homepage/hero
const updateHeroSlides = async (req, res) => {
    try {
        const { heroSlides } = req.body;
        
        // Validation
        if (!Array.isArray(heroSlides)) {
            return res.status(400).json({ message: 'heroSlides must be an array' });
        }

        for (const slide of heroSlides) {
            if (slide.products && slide.products.length !== 3) {
                return res.status(400).json({ 
                    message: `Slide for ${slide.categorySlug} must have exactly 3 products.` 
                });
            }
        }

        const config = await getConfig();
        config.heroSlides = heroSlides;
        await config.save();

        res.json(config);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update trending products
// @route   PUT /api/admin/homepage/trending
const updateTrendingProducts = async (req, res) => {
    try {
        const { trendingProducts } = req.body; // Array of product IDs
        
        if (!Array.isArray(trendingProducts) || trendingProducts.length !== 9) {
            return res.status(400).json({ message: 'Must provide exactly 9 trending products.' });
        }

        // Validate the category rule (max 2 per category)
        const products = await Product.find({ _id: { $in: trendingProducts } });
        const categoryCounts = {};
        
        for (const p of products) {
            categoryCounts[p.categorySlug] = (categoryCounts[p.categorySlug] || 0) + 1;
            if (categoryCounts[p.categorySlug] > 2) {
                return res.status(400).json({ 
                    message: `Validation failed: You can select a maximum of 2 products from category '${p.categorySlug}'.` 
                });
            }
        }

        const config = await getConfig();
        config.trendingProducts = trendingProducts;
        await config.save();

        res.json(config);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update category display product
// @route   PUT /api/admin/homepage/categories
const updateCategoryDisplay = async (req, res) => {
    try {
        const { categorySlug, productId } = req.body;

        if (!categorySlug || !productId) {
            return res.status(400).json({ message: 'categorySlug and productId are required' });
        }

        const config = await getConfig();
        
        if (!config.categoryDisplayProducts) {
            config.categoryDisplayProducts = new Map();
        }
        
        config.categoryDisplayProducts.set(categorySlug, productId);
        await config.save();

        res.json({ message: 'Category display updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getHomepageConfig,
    updateHeroSlides,
    updateTrendingProducts,
    updateCategoryDisplay
};
