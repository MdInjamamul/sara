const asyncHandler = require('../middleware/asyncHandler');
const Newsletter = require('../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribe = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide an email address');
    }

    // Check if subscriber exists
    let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (subscriber) {
        if (subscriber.status === 'unsubscribed') {
            subscriber.status = 'subscribed';
            await subscriber.save();
            return res.status(200).json({
                success: true,
                message: 'Successfully re-subscribed to the newsletter!'
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'This email is already subscribed.'
            });
        }
    }

    // Create new subscriber
    subscriber = await Newsletter.create({
        email
    });

    res.status(201).json({
        success: true,
        message: 'Successfully subscribed to the newsletter!',
        data: subscriber
    });
});

// @desc    Get all subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
const getAllSubscribers = asyncHandler(async (req, res) => {
    const subscribers = await Newsletter.find().sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: subscribers.length,
        data: subscribers
    });
});

module.exports = {
    subscribe,
    getAllSubscribers
};
