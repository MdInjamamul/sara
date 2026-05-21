const TrendingConfig = require('../models/TrendingConfig');

class TrendingConfigRepository {
    async getConfig() {
        return await TrendingConfig.findOne().populate({
            path: 'products',
            select: 'name slug images discountPrice price inStock categorySlug isNew isBestseller'
        });
    }

    async saveConfig(productIds) {
        let config = await TrendingConfig.findOne();
        if (config) {
            config.products = productIds;
            await config.save();
        } else {
            config = new TrendingConfig({ products: productIds });
            await config.save();
        }
        return this.getConfig(); // Return populated
    }
}

module.exports = new TrendingConfigRepository();
