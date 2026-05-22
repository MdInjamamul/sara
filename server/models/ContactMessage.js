const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add your name'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        email: {
            type: String,
            required: [true, 'Please add your email'],
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        phone: {
            type: String,
            required: [true, 'Please add your phone number'],
            trim: true
        },
        subject: {
            type: String,
            required: [true, 'Please add a subject'],
            trim: true,
            maxlength: [200, 'Subject cannot exceed 200 characters']
        },
        message: {
            type: String,
            required: [true, 'Please add your message'],
            trim: true,
            maxlength: [2000, 'Message cannot exceed 2000 characters']
        },
        status: {
            type: String,
            enum: ['new', 'read', 'resolved'],
            default: 'new'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
