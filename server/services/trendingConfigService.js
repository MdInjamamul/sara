const trendingConfigRepository = require('../repositories/trendingConfigRepository');
const productRepository = require('../repositories/productRepository');
const AppError = require('../utils/AppError');

class TrendingConfigService {
    async getConfig() {
        let config = await trendingConfigRepository.getConfig();
        
        if (!config) {
            return { products: [] };
        }
        
        return config;
    }

    async updateConfig(productIds) {
        if (!productIds || !Array.isArray(productIds)) {
            throw new AppError('Invalid configuration format', 400);
        }
        
        if (productIds.length !== 9) {
            throw new AppError('Exactly 9 products must be selected for trending', 400);
        }

        // Validate the category rule: 7 categories with 1 product, 1 category with 2 products
        const products = await Promise.all(productIds.map(id => productRepository.findById(id)));
        
        // Ensure all products exist
        if (products.some(p => !p)) {
            throw new AppError('One or more selected products do not exist', 400);
        }

        const categoryCounts = {};
        products.forEach(p => {
            const cat = p.categorySlug;
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        const counts = Object.values(categoryCounts);
        const hasOneCategoryWithTwo = counts.filter(c => c === 2).length === 1;
        const hasSevenCategoriesWithOne = counts.filter(c => c === 1).length === 7;

        if (!hasOneCategoryWithTwo || !hasSevenCategoriesWithOne) {
            throw new AppError('Invalid category distribution. Must have exactly 1 product from 7 categories, and 2 products from 1 category.', 400);
        }

        return await trendingConfigRepository.saveConfig(productIds);
    }
}

module.exports = new TrendingConfigService();
