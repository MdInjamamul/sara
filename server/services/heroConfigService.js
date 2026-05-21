const heroConfigRepository = require('../repositories/heroConfigRepository');
const AppError = require('../utils/AppError');

class HeroConfigService {
    async getConfig() {
        let config = await heroConfigRepository.getConfig();
        
        if (!config) {
            // Return empty layout if nothing is saved yet
            return { slides: [] };
        }
        
        return config;
    }

    async updateConfig(configData) {
        if (!configData.slides || !Array.isArray(configData.slides)) {
            throw new AppError('Invalid configuration format', 400);
        }
        
        // Ensure each slide has exactly 3 products OR 0 products (empty slot)
        for (const slide of configData.slides) {
            if (slide.products && slide.products.length > 0 && slide.products.length !== 3) {
                throw new AppError(`Slide "${slide.title}" must have exactly 3 products or be completely empty`, 400);
            }
        }

        return await heroConfigRepository.saveConfig(configData);
    }
}

module.exports = new HeroConfigService();
