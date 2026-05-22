const express = require('express');
const router = express.Router();
const {
    submitContact,
    getAllMessages,
    updateMessageStatus,
    deleteMessage
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public
router.post('/', submitContact);

// Admin only
router.get('/', protect, admin, getAllMessages);
router.put('/:id/status', protect, admin, updateMessageStatus);
router.delete('/:id', protect, admin, deleteMessage);

module.exports = router;
