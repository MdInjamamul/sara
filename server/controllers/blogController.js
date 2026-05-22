const asyncHandler = require('../middleware/asyncHandler');
const BlogPost = require('../models/BlogPost');

// @desc    Create a blog post
// @route   POST /api/blog
// @access  Private/Admin
const createPost = asyncHandler(async (req, res) => {
    const { title, content, excerpt, coverImage, category, tags, status, isFeatured } = req.body;

    if (!title || !content || !category) {
        res.status(400);
        throw new Error('Title, content, and category are required');
    }

    // If setting as featured, unset any existing featured post
    if (isFeatured) {
        await BlogPost.updateMany({ isFeatured: true }, { isFeatured: false });
    }

    const post = await BlogPost.create({
        title,
        content,
        excerpt: excerpt || '',
        coverImage: coverImage || '',
        category,
        tags: tags || [],
        author: req.user._id,
        status: status || 'draft',
        isFeatured: isFeatured || false
    });

    const populatedPost = await BlogPost.findById(post._id).populate('author', 'name avatar');

    res.status(201).json({
        success: true,
        message: 'Blog post created successfully',
        data: populatedPost
    });
});

// @desc    Update a blog post
// @route   PUT /api/blog/:id
// @access  Private/Admin
const updatePost = asyncHandler(async (req, res) => {
    const { title, content, excerpt, coverImage, category, tags, status, isFeatured } = req.body;

    let post = await BlogPost.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Blog post not found');
    }

    // If setting as featured, unset any existing featured post
    if (isFeatured && !post.isFeatured) {
        await BlogPost.updateMany({ isFeatured: true }, { isFeatured: false });
    }

    if (title !== undefined) post.title = title;
    if (content !== undefined) post.content = content;
    if (excerpt !== undefined) post.excerpt = excerpt;
    if (coverImage !== undefined) post.coverImage = coverImage;
    if (category !== undefined) post.category = category;
    if (tags !== undefined) post.tags = tags;
    if (status !== undefined) post.status = status;
    if (isFeatured !== undefined) post.isFeatured = isFeatured;

    await post.save();

    const populatedPost = await BlogPost.findById(post._id).populate('author', 'name avatar');

    res.status(200).json({
        success: true,
        message: 'Blog post updated successfully',
        data: populatedPost
    });
});

// @desc    Delete a blog post
// @route   DELETE /api/blog/:id
// @access  Private/Admin
const deletePost = asyncHandler(async (req, res) => {
    const post = await BlogPost.findByIdAndDelete(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Blog post not found');
    }

    res.status(200).json({
        success: true,
        message: 'Blog post deleted successfully'
    });
});

// @desc    Get all blog posts (public - published only, admin - all)
// @route   GET /api/blog
// @access  Public
const getAllPosts = asyncHandler(async (req, res) => {
    const { category, search, page = 1, limit = 9, status: queryStatus } = req.query;

    const filter = {};

    // If admin query param is passed, show all statuses; otherwise only published
    if (queryStatus === 'all') {
        // admin view - no status filter
    } else {
        filter.status = 'published';
    }

    if (category && category !== 'all') {
        filter.category = category;
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { excerpt: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await BlogPost.countDocuments(filter);

    const posts = await BlogPost.find(filter)
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    // Get unique categories from published posts
    const categories = await BlogPost.distinct('category', { status: 'published' });

    res.status(200).json({
        success: true,
        count: posts.length,
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        categories,
        data: posts
    });
});

// @desc    Get a single blog post by slug
// @route   GET /api/blog/:slug
// @access  Public
const getPostBySlug = asyncHandler(async (req, res) => {
    const post = await BlogPost.findOne({ slug: req.params.slug })
        .populate('author', 'name avatar');

    if (!post) {
        res.status(404);
        throw new Error('Blog post not found');
    }

    // Get related posts (same category, exclude current)
    const relatedPosts = await BlogPost.find({
        category: post.category,
        _id: { $ne: post._id },
        status: 'published'
    })
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(3);

    res.status(200).json({
        success: true,
        data: post,
        relatedPosts
    });
});

// @desc    Get the featured blog post
// @route   GET /api/blog/featured
// @access  Public
const getFeaturedPost = asyncHandler(async (req, res) => {
    let post = await BlogPost.findOne({ isFeatured: true, status: 'published' })
        .populate('author', 'name avatar');

    // Fallback to latest published post if no featured post
    if (!post) {
        post = await BlogPost.findOne({ status: 'published' })
            .populate('author', 'name avatar')
            .sort({ createdAt: -1 });
    }

    res.status(200).json({
        success: true,
        data: post
    });
});

// @desc    Toggle featured status
// @route   PUT /api/blog/:id/featured
// @access  Private/Admin
const toggleFeatured = asyncHandler(async (req, res) => {
    const post = await BlogPost.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Blog post not found');
    }

    if (!post.isFeatured) {
        // Unset all other featured posts first
        await BlogPost.updateMany({ isFeatured: true }, { isFeatured: false });
    }

    post.isFeatured = !post.isFeatured;
    await post.save();

    res.status(200).json({
        success: true,
        message: post.isFeatured ? 'Post set as featured' : 'Post removed from featured',
        data: post
    });
});

module.exports = {
    createPost,
    updatePost,
    deletePost,
    getAllPosts,
    getPostBySlug,
    getFeaturedPost,
    toggleFeatured
};
