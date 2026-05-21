const Joi = require('joi');

/**
 * Joi schema for creating a new product.
 * Enforces all required fields and sensible constraints.
 */
const createProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(200).required()
        .messages({ 'any.required': 'Product name is required' }),

    slug: Joi.string().trim().lowercase()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .required()
        .messages({
            'string.pattern.base': 'Slug must be URL-friendly (lowercase letters, numbers, hyphens)',
            'any.required': 'Slug is required'
        }),

    description: Joi.string().trim().min(10).required()
        .messages({ 'any.required': 'Description is required' }),

    shortDescription: Joi.string().trim().min(5).max(300).required()
        .messages({ 'any.required': 'Short description is required' }),

    price: Joi.number().positive().required()
        .messages({
            'number.positive': 'Price must be greater than 0',
            'any.required': 'Price is required'
        }),

    discountPrice: Joi.number().positive().allow(null).default(null)
        .messages({ 'number.positive': 'Discount price must be greater than 0' }),

    categorySlug: Joi.string().trim().required()
        .messages({ 'any.required': 'Category is required' }),

    image: Joi.string().trim().allow('', null).default(null),

    isNew: Joi.boolean().default(false),

    stock: Joi.number().integer().min(0).default(0)
        .messages({ 'number.min': 'Stock cannot be negative' }),

    benefits: Joi.array().items(Joi.string().trim()).default([]),

    howToUse: Joi.string().trim().allow('', null).default(''),

    ingredients: Joi.array().items(Joi.string().trim()).default([])
});

/**
 * Joi schema for updating a product.
 * All fields are optional; only provided fields will be updated.
 */
const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(200),

    slug: Joi.string().trim().lowercase()
        .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .messages({
            'string.pattern.base': 'Slug must be URL-friendly (lowercase letters, numbers, hyphens)'
        }),

    description: Joi.string().trim().min(10),

    shortDescription: Joi.string().trim().min(5).max(300),

    price: Joi.number().positive()
        .messages({ 'number.positive': 'Price must be greater than 0' }),

    discountPrice: Joi.number().positive().allow(null)
        .messages({ 'number.positive': 'Discount price must be greater than 0' }),

    categorySlug: Joi.string().trim(),

    image: Joi.string().trim().allow('', null),

    isNew: Joi.boolean(),

    stock: Joi.number().integer().min(0)
        .messages({ 'number.min': 'Stock cannot be negative' }),

    benefits: Joi.array().items(Joi.string().trim()),

    howToUse: Joi.string().trim().allow('', null),

    ingredients: Joi.array().items(Joi.string().trim())
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

module.exports = {
    createProductSchema,
    updateProductSchema
};
