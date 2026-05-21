const categoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/AppError');

/**
 * Category Service — Business logic for categories.
 */

const getAllCategories = async () => {
    return categoryRepository.findAll();
};

const getCategoryBySlug = async (slug) => {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) {
        throw new AppError('Category not found', 404);
    }
    return category;
};

module.exports = {
    getAllCategories,
    getCategoryBySlug
};
