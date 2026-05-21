const express = require('express');
const router = express.Router({ mergeParams: true });
const { getProductReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getProductReviews)
    .post(protect, createReview);

module.exports = router;
