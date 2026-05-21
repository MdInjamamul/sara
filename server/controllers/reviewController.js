const Review = require('../models/Review');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// @desc    Get all reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ product: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
});

// @desc    Create or update review
// @route   POST /api/products/:productId/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    if (!rating || rating < 1 || rating > 5) {
        throw new AppError('Please provide a valid rating between 1 and 5', 400);
    }

    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    const alreadyReviewed = await Review.findOne({
        product: productId,
        user: req.user._id
    });

    let review;

    if (alreadyReviewed) {
        // Update existing review
        alreadyReviewed.rating = Number(rating);
        alreadyReviewed.comment = comment || '';
        review = await alreadyReviewed.save();
    } else {
        // Create new review
        review = await Review.create({
            product: productId,
            rating: Number(rating),
            comment: comment || '',
            user: req.user._id,
            userName: req.user.name
        });
    }

    // Calculate new average rating
    const allReviews = await Review.find({ product: productId });
    
    product.ratings.count = allReviews.length;
    product.ratings.average = allReviews.reduce((acc, item) => item.rating + acc, 0) / allReviews.length;
    
    await product.save();

    res.status(201).json(review);
});

module.exports = {
    getProductReviews,
    createReview
};
