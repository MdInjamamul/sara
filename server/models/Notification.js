const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['order_status', 'system', 'promotion'],
        default: 'system'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    link: {
        type: String, // Optional URL to navigate to when clicked (e.g., /my-orders)
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
