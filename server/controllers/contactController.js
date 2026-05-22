const asyncHandler = require('../middleware/asyncHandler');
const ContactMessage = require('../models/ContactMessage');

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
const submitContact = asyncHandler(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
        res.status(400);
        throw new Error('Please fill in all required fields including phone number');
    }

    const contactMessage = await ContactMessage.create({
        name,
        email,
        phone: phone || '',
        subject,
        message
    });

    res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully! We will get back to you shortly.',
        data: contactMessage
    });
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
const getAllMessages = asyncHandler(async (req, res) => {
    const { status, search } = req.query;

    const filter = {};

    if (status && status !== 'all') {
        filter.status = status;
    }

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } }
        ];
    }

    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });

    const stats = {
        total: await ContactMessage.countDocuments(),
        new: await ContactMessage.countDocuments({ status: 'new' }),
        read: await ContactMessage.countDocuments({ status: 'read' }),
        resolved: await ContactMessage.countDocuments({ status: 'resolved' })
    };

    res.status(200).json({
        success: true,
        count: messages.length,
        stats,
        data: messages
    });
});

// @desc    Update message status
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
const updateMessageStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!['new', 'read', 'resolved'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status value');
    }

    const message = await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    res.status(200).json({
        success: true,
        message: 'Status updated successfully',
        data: message
    });
});

// @desc    Delete a contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteMessage = asyncHandler(async (req, res) => {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
    });
});

module.exports = {
    submitContact,
    getAllMessages,
    updateMessageStatus,
    deleteMessage
};
