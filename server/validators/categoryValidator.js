const Joi = require('joi');

/**
 * Joi schema for creating a new category.
 */
const createCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required()
        .messages({ 'any.required': 'Category name is required' }),

    slug: Joi.string().trim().lowercase()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .required()
        .messages({
            'string.pattern.base': 'Slug must be URL-friendly',
            'any.required': 'Slug is required'
        }),

    description: Joi.string().trim().min(5).required()
        .messages({ 'any.required': 'Description is required' }),

    image: Joi.string().trim().required()
        .messages({ 'any.required': 'Image is required' }),

    productCount: Joi.number().integer().min(0).default(0)
});

/**
 * Joi schema for updating a category.
 */
const updateCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    slug: Joi.string().trim().lowercase().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    description: Joi.string().trim().min(5),
    image: Joi.string().trim(),
    productCount: Joi.number().integer().min(0)
}).min(1);

module.exports = {
    createCategorySchema,
    updateCategorySchema
};
