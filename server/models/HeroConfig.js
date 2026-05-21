const mongoose = require('mongoose');

const productSlotSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    label: {
        type: String,
        required: true
    }
}, { _id: false });

const slideSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    accentColor: { type: String, required: true },
    products: [productSlotSchema]
}, { _id: false });

const heroConfigSchema = new mongoose.Schema({
    slides: [slideSchema]
}, { timestamps: true });

module.exports = mongoose.model('HeroConfig', heroConfigSchema);
