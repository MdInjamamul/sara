const Joi = require('joi');

/**
 * Joi schema for creating an order.
 * Only validates shipping address and optional note.
 * Cart items/prices are read server-side from the user's cart.
 */
const createOrderSchema = Joi.object({
    shippingAddress: Joi.object({
        fullName: Joi.string().trim().min(2).max(100).required()
            .messages({ 'any.required': 'Full name is required' }),
        phone: Joi.string().pattern(/^\d{10}$/).required()
            .messages({ 
                'any.required': 'Phone number is required',
                'string.pattern.base': 'Phone number must be exactly 10 digits'
            }),
        street: Joi.string().trim().min(3).max(200).required()
            .messages({ 'any.required': 'Street address is required' }),
        city: Joi.string().trim().min(2).max(100).required()
            .messages({ 'any.required': 'City is required' }),
        state: Joi.string().trim().min(2).max(100).required()
            .messages({ 'any.required': 'State/Province is required' }),
        zipCode: Joi.string().trim().allow('').max(20).default(''),
        country: Joi.string().trim().max(60).default('Nepal')
    }).required()
        .messages({ 'any.required': 'Shipping address is required' }),

    orderNote: Joi.string().trim().allow('').max(500).default('')
});

/**
 * Joi schema for updating order status (admin).
 */
const updateOrderStatusSchema = Joi.object({
    status: Joi.string()
        .valid('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')
        .required()
        .messages({
            'any.only': 'Invalid order status',
            'any.required': 'Status is required'
        }),
    cancelReason: Joi.string().trim().allow('').max(500).default('')
});

/**
 * Joi schema for updating order details (user).
 */
const updateOrderDetailsSchema = Joi.object({
    shippingAddress: Joi.object({
        fullName: Joi.string().trim().min(2).max(100).required()
            .messages({ 'any.required': 'Full name is required' }),
        phone: Joi.string().pattern(/^\d{10}$/).required()
            .messages({ 
                'any.required': 'Phone number is required',
                'string.pattern.base': 'Phone number must be exactly 10 digits'
            }),
        street: Joi.string().trim().min(3).max(200).required()
            .messages({ 'any.required': 'Street address is required' }),
        city: Joi.string().trim().min(2).max(100).required()
            .messages({ 'any.required': 'District is required' }),
        state: Joi.string().trim().min(2).max(100).required()
            .messages({ 'any.required': 'Province is required' }),
        zipCode: Joi.string().trim().allow('').max(20).default(''),
        country: Joi.string().trim().max(60).default('Nepal')
    }).required()
        .messages({ 'any.required': 'Shipping address is required' }),

    orderNote: Joi.string().trim().allow('').max(500).default('')
});

module.exports = {
    createOrderSchema,
    updateOrderStatusSchema,
    updateOrderDetailsSchema
};
