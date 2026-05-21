const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    discountPrice: {
        type: Number,
        default: null
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    categorySlug: {
        type: String,
        required: true
    },
    images: [{
        type: String
    }],
    inStock: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNew: {
        type: Boolean,
        default: false
    },
    isBestseller: {
        type: Boolean,
        default: false
    },
    benefits: [{
        type: String
    }],
    howToUse: {
        type: String
    },
    ingredients: [{
        type: String
    }],
    stock: {
        type: Number,
        default: 0
    },
    totalSold: {
        type: Number,
        default: 0
    },
    isOffer: {
        type: Boolean,
        default: false
    },
    offerLabel: {
        type: String,
        default: ''
    },
    manualBestseller: {
        type: Boolean,
        default: null // null means auto-compute
    },
    manualNew: {
        type: Boolean,
        default: null // null means auto-compute
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Pre-save hook to auto-compute isNew and isBestseller if not manually set
productSchema.pre('save', function(next) {
    // Auto-compute isBestseller based on totalSold (threshold: 50)
    if (this.manualBestseller === null) {
        this.isBestseller = this.totalSold >= 50;
    } else {
        this.isBestseller = this.manualBestseller;
    }

    // Auto-compute isNew based on createdAt (threshold: 30 days)
    if (this.manualNew === null) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        this.isNew = (this.createdAt || new Date()) > thirtyDaysAgo;
    } else {
        this.isNew = this.manualNew;
    }

    next();
});

module.exports = mongoose.model('Product', productSchema);
