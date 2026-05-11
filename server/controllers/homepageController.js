const HomepageConfig = require('../models/HomepageConfig');
const Category = require('../models/Category');

// @desc    Get all public homepage data (hero, trending, categories)
// @route   GET /api/homepage
const getHomepageData = async (req, res) => {
    try {
        const config = await HomepageConfig.findOne({ isSingleton: true })
            .populate({
                path: 'heroSlides.products',
                select: 'name slug price discountPrice images shortDescription isNew isBestseller'
            })
            .populate({
                path: 'trendingProducts',
                select: 'name slug price discountPrice images categorySlug isNew isBestseller'
            });

        // Also fetch all categories to build the category section
        const categories = await Category.find({}).sort({ name: 1 });

        if (!config) {
            return res.json({
                heroSlides: [],
                trendingProducts: [],
                categories: categories
            });
        }

        // Build the categories array with images from the config
        const categoryData = categories.map(cat => {
            let imageUrl = null;
            if (config.categoryDisplayProducts && config.categoryDisplayProducts.has(cat.slug)) {
                // To get the actual image, we need to populate this map, or we can just send the category list
                // and let the client fetch it, but it's better to send the image URL directly.
                // For a highly optimized public API, we should have stored the image URL in the config
                // or populated it. Since we just have the ID in the Map, let's resolve it.
                // Wait, it's better to resolve this efficiently.
            }
            return {
                _id: cat._id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description,
                productCount: cat.productCount,
                // We'll attach the display product ID, client can use a specific route to get image if needed
                // OR better, we fetch them here.
            };
        });

        // Efficiently fetch all display products for categories
        if (config.categoryDisplayProducts && config.categoryDisplayProducts.size > 0) {
            const Product = require('../models/Product');
            const displayProductIds = Array.from(config.categoryDisplayProducts.values());
            const displayProducts = await Product.find({ _id: { $in: displayProductIds } }).select('images categorySlug');
            
            const imageMap = {};
            displayProducts.forEach(p => {
                imageMap[p.categorySlug] = p.images && p.images.length > 0 ? p.images[0] : null;
            });

            categoryData.forEach(cat => {
                cat.image = imageMap[cat.slug] || '/assets/images/placeholder.png';
            });
        }

        res.json({
            heroSlides: config.heroSlides.filter(s => s.isActive),
            trendingProducts: config.trendingProducts,
            categories: categoryData
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getHomepageData
};
