const express = require('express');
const router = express.Router();
const {
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
    getPostBySlug,
    getFeaturedPost,
    toggleFeatured
} = require('../controllers/blogController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes (order matters — /featured must come before /:slug)
router.get('/', getAllPosts);
router.get('/featured', getFeaturedPost);
router.get('/:slug', getPostBySlug);

// Admin only
router.post('/', protect, admin, createPost);
router.put('/:id', protect, admin, updatePost);
router.delete('/:id', protect, admin, deletePost);
router.put('/:id/featured', protect, admin, toggleFeatured);

module.exports = router;
