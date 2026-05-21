const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    updateOrderDetails
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../validators/validate');
const { createOrderSchema, updateOrderStatusSchema, updateOrderDetailsSchema } = require('../validators/orderValidator');

// User routes (must come before /:id to avoid conflicts)
router.route('/my')
    .get(protect, getMyOrders);

// Create order
router.route('/')
    .post(protect, validate(createOrderSchema), createOrder)
    .get(protect, admin, getAllOrders);

// Single order
router.route('/:id')
    .get(protect, getOrderById)
    .put(protect, validate(updateOrderDetailsSchema), updateOrderDetails);

// Admin status update
router.route('/:id/status')
    .put(protect, admin, validate(updateOrderStatusSchema), updateOrderStatus);

// User cancel
router.route('/:id/cancel')
    .put(protect, cancelOrder);

module.exports = router;
