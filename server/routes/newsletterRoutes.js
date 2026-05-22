const express = require('express');
const router = express.Router();
const {
    subscribe,
    getAllSubscribers,
    sendNewsletter
} = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/subscribe', subscribe);
router.get('/subscribers', protect, admin, getAllSubscribers);
router.post('/send', protect, admin, sendNewsletter);

module.exports = router;
