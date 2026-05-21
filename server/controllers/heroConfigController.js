const heroConfigService = require('../services/heroConfigService');
const asyncHandler = require('../middleware/asyncHandler');

const getHeroConfig = asyncHandler(async (req, res) => {
    const config = await heroConfigService.getConfig();
    res.json(config);
});

const updateHeroConfig = asyncHandler(async (req, res) => {
    const updatedConfig = await heroConfigService.updateConfig(req.body);
    res.json(updatedConfig);
});

module.exports = {
    getHeroConfig,
    updateHeroConfig
};
