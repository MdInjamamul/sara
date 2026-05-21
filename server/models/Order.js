const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: { type: String, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, default: '' },
        country: { type: String, default: 'Nepal' }
    },
    paymentMethod: {
        type: String,
        default: 'Cash on Delivery'
    },
    itemsPrice: {
        type: Number,
        required: true
    },
    shippingPrice: {
        type: Number,
        default: 0
    },
    totalPrice: {
        type: Number,
        required: true
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    deliveredAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    orderNote: {
        type: String,
        default: ''
    },
    cancelReason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
