const mongoose = require('mongoose');

const trendingConfigSchema = new mongoose.Schema({
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }]
}, { timestamps: true });

module.exports = mongoose.model('TrendingConfig', trendingConfigSchema);
