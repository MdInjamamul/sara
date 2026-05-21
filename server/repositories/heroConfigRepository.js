const HeroConfig = require('../models/HeroConfig');

class HeroConfigRepository {
    async getConfig() {
        return await HeroConfig.findOne().populate({
            path: 'slides.products.product',
            select: 'name slug images discountPrice price inStock categorySlug'
        });
    }

    async saveConfig(configData) {
        let config = await HeroConfig.findOne();
        if (config) {
            config.slides = configData.slides;
            await config.save();
        } else {
            config = new HeroConfig(configData);
            await config.save();
        }
        return this.getConfig(); // Return populated
    }
}

module.exports = new HeroConfigRepository();
