const asyncHandler = require('../middleware/asyncHandler');
const orderService = require('../services/orderService');
const createOrderDto = require('../dtos/input/createOrderDto');
const { orderDto, orderListDto } = require('../dtos/output/orderDto');

/**
 * Order Controller — The thin orchestration layer.
 * No try/catch, no DB calls, no business logic.
 * Only job: call Service → format with DTO → send response.
 */

// @desc    Create a new order from user's cart
// @route   POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
    const dto = createOrderDto(req.body);
    const order = await orderService.createOrder(req.user._id, dto);
    res.status(201).json(orderDto(order));
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getMyOrders(req.user._id);
    res.json(orderListDto(orders));
});

// @desc    Get single order by ID
// @route   GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
    res.json(orderDto(order));
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
const getAllOrders = asyncHandler(async (req, res) => {
    const result = await orderService.getAllOrders(req.query);
    res.json({
        orders: orderListDto(result.orders),
        page: result.page,
        totalPages: result.totalPages,
        totalOrders: result.totalOrders
    });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.body.cancelReason);
    res.json(orderDto(order));
});

// @desc    Cancel order (user)
// @route   PUT /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await orderService.cancelOrder(req.params.id, req.user._id);
    res.json(orderDto(order));
});

// @desc    Update order details (user)
// @route   PUT /api/orders/:id
const updateOrderDetails = asyncHandler(async (req, res) => {
    // We can reuse createOrderDto for mapping input since the payload is identical (shippingAddress, orderNote)
    const dto = createOrderDto(req.body);
    const order = await orderService.updateOrderDetails(req.params.id, req.user._id, dto);
    res.json(orderDto(order));
});

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    updateOrderDetails
};
