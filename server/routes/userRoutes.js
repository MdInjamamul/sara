const express = require('express');
const router = express.Router();
const {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    getWishlist,
    toggleWishlist
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/cart')
    .get(protect, getCart)
    .post(protect, addToCart);

router.route('/cart/:productId')
    .put(protect, updateCartItemQuantity)
    .delete(protect, removeFromCart);

router.route('/wishlist')
    .get(protect, getWishlist)
    .post(protect, toggleWishlist);

module.exports = router;
