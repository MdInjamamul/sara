const trendingConfigService = require('../services/trendingConfigService');
const asyncHandler = require('../middleware/asyncHandler');

const getTrendingConfig = asyncHandler(async (req, res) => {
    const config = await trendingConfigService.getConfig();
    res.json(config.products); // Returning just the products array to be compatible with old trending API output
});

const updateTrendingConfig = asyncHandler(async (req, res) => {
    const updatedConfig = await trendingConfigService.updateConfig(req.body.products);
    res.json(updatedConfig);
});

module.exports = {
    getTrendingConfig,
    updateTrendingConfig
};
