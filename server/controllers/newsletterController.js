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

const sendNewsletter = asyncHandler(async (req, res) => {
    const { subject, htmlContent } = req.body;

    if (!subject || !htmlContent) {
        res.status(400);
        throw new Error('Please provide subject and HTML content');
    }

    const subscribers = await Newsletter.find({ status: 'subscribed' });

    if (subscribers.length === 0) {
        return res.status(200).json({
            success: true,
            message: 'No active subscribers to send the newsletter to.'
        });
    }

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const emails = subscribers.map(sub => sub.email);

    const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'SARA Herbal'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        bcc: emails, // Use BCC so subscribers don't see each other's emails
        subject: subject,
        html: htmlContent
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
        success: true,
        message: `Newsletter sent successfully to ${subscribers.length} subscribers!`
    });
});

module.exports = {
    subscribe,
    getAllSubscribers,
    sendNewsletter
};
