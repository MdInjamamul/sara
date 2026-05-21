const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user cart
// @route   GET /api/users/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('cart.product');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add item to cart
// @route   POST /api/users/cart
// @access  Private
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

        let newQuantity = Number(quantity) || 1;
        if (cartItemIndex > -1) {
            newQuantity += user.cart[cartItemIndex].quantity;
            if (newQuantity > productExists.stock) {
                newQuantity = productExists.stock;
            }
            user.cart[cartItemIndex].quantity = newQuantity;
        } else {
            if (newQuantity > productExists.stock) {
                newQuantity = productExists.stock;
            }
            user.cart.push({ product: productId, quantity: newQuantity });
        }

        await user.save();
        const updatedUser = await User.findById(req.user._id).populate('cart.product');
        res.json(updatedUser.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/users/cart/:productId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.cart = user.cart.filter(item => item.product.toString() !== req.params.productId);
        await user.save();
        
        const updatedUser = await User.findById(req.user._id).populate('cart.product');
        res.json(updatedUser.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update item quantity in cart
// @route   PUT /api/users/cart/:productId
// @access  Private
const updateCartItemQuantity = async (req, res) => {
    try {
        const { quantity } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const cartItemIndex = user.cart.findIndex(item => item.product.toString() === req.params.productId);

        if (cartItemIndex > -1) {
            if (Number(quantity) <= 0) {
                user.cart.splice(cartItemIndex, 1);
            } else {
                const productExists = await Product.findById(req.params.productId);
                let newQty = Number(quantity);
                if (productExists && newQty > productExists.stock) {
                    newQty = productExists.stock;
                }
                user.cart[cartItemIndex].quantity = newQty;
            }
            await user.save();
        }

        const updatedUser = await User.findById(req.user._id).populate('cart.product');
        res.json(updatedUser.cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle item in wishlist
// @route   POST /api/users/wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const wishlistIndex = user.wishlist.findIndex(id => id.toString() === productId);

        if (wishlistIndex > -1) {
            // Remove if exists
            user.wishlist.splice(wishlistIndex, 1);
        } else {
            // Add if not exists
            user.wishlist.push(productId);
        }

        await user.save();
        const updatedUser = await User.findById(req.user._id).populate('wishlist');
        res.json(updatedUser.wishlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    getWishlist,
    toggleWishlist
};
