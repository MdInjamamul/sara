const asyncHandler = require('../middleware/asyncHandler');
const categoryService = require('../services/categoryService');
const { categoryDto, categoryListDto } = require('../dtos/output/categoryDto');

/**
 * Category Controller — Thin orchestration layer.
 */

// @desc    Get all categories
// @route   GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.json(categoryListDto(categories));
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
const getCategoryBySlug = asyncHandler(async (req, res) => {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    res.json(categoryDto(category));
});

module.exports = {
    getCategories,
    getCategoryBySlug
};
