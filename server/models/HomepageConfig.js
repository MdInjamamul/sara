const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
    categorySlug: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    accentColor: {
        type: String,
        default: '#8B4513'
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
});

const homepageConfigSchema = new mongoose.Schema({
    // We only ever want one document for this
    isSingleton: {
        type: Boolean,
        default: true,
        unique: true
    },
    heroSlides: [heroSlideSchema],
    trendingProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    categoryDisplayProducts: {
        type: Map,
        of: mongoose.Schema.Types.ObjectId,
        // e.g. { "medicinal-herbs": ObjectId("..."), "essential-oils": ObjectId("...") }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('HomepageConfig', homepageConfigSchema);
