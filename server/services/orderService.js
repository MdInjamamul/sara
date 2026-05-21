const orderRepository = require('../repositories/orderRepository');
const User = require('../models/User');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const { sendEmail } = require('./emailService');
const { generateInvoiceHTML } = require('../templates/invoiceTemplate');

/**
 * Order Service — All business logic lives here.
 * Calls the Repository for data access.
 * Throws AppError when business rules are violated.
 */

/**
 * One-way status progression map.
 * Each status maps to the list of statuses it can transition TO.
 * Cancelled is handled separately (admin can cancel from any active status).
 */
const STATUS_FLOW = {
    'Pending': ['Confirmed'],
    'Confirmed': ['Processing'],
    'Processing': ['Shipped'],
    'Shipped': ['Delivered'],
    'Delivered': [],
    'Cancelled': []
};

/**
 * Order Service — All business logic lives here.
 * Calls the Repository for data access.
 * Throws AppError when business rules are violated.
 */

/**
 * Create a new order from the user's cart.
 * Business rules:
 *  - User must have items in cart
 *  - Every item must still be in stock with sufficient quantity
 *  - Prices are read from DB, not trusted from client
 *  - Stock is decremented on each product
 *  - User's cart is cleared after order creation
 */
const createOrder = async (userId, dto) => {
    // 1. Get user with populated cart
    const user = await User.findById(userId).populate('cart.product');
    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (!user.cart || user.cart.length === 0) {
        throw new AppError('Your cart is empty. Add items before placing an order.', 400);
    }

    // 2. Validate stock and build order items from actual DB prices
    const orderItems = [];
    let itemsPrice = 0;

    for (const cartItem of user.cart) {
        const product = cartItem.product;

        if (!product) {
            throw new AppError('One or more products in your cart no longer exist.', 400);
        }

        if (product.stock < cartItem.quantity) {
            throw new AppError(
                `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${cartItem.quantity}`,
                400
            );
        }

        const price = product.discountPrice || product.price;

        orderItems.push({
            product: product._id,
            name: product.name,
            image: product.images && product.images.length > 0 ? product.images[0] : '',
            price: price,
            quantity: cartItem.quantity
        });

        itemsPrice += price * cartItem.quantity;
    }

    // 3. Calculate totals
    const shippingPrice = 0; // Free shipping
    const totalPrice = itemsPrice + shippingPrice;

    // 4. Create order document
    const orderData = {
        user: userId,
        orderItems,
        shippingAddress: dto.shippingAddress,
        paymentMethod: 'Cash on Delivery',
        itemsPrice,
        shippingPrice,
        totalPrice,
        orderNote: dto.orderNote || ''
    };

    const order = await orderRepository.create(orderData);

    // 5. Decrement stock and update totalSold on each product
    for (const cartItem of user.cart) {
        const product = await Product.findById(cartItem.product._id || cartItem.product);
        if (product) {
            product.stock -= cartItem.quantity;
            product.inStock = product.stock > 0;
            product.totalSold = (product.totalSold || 0) + cartItem.quantity;
            await product.save();
        }
    }

    // 6. Clear user's cart
    user.cart = [];
    await user.save();

    // 7. Return populated order
    return orderRepository.findById(order._id);
};

/**
 * Get all orders for the logged-in user, sorted newest first.
 */
const getMyOrders = async (userId) => {
    return orderRepository.findByUser(userId);
};

/**
 * Get a single order by ID.
 * Business rule: Non-admin users can only view their own orders.
 */
const getOrderById = async (orderId, userId, userRole) => {
    const order = await orderRepository.findById(orderId);

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    // Non-admin users can only see their own orders
    if (userRole !== 'admin' && order.user._id.toString() !== userId.toString()) {
        throw new AppError('Not authorized to view this order', 403);
    }

    return order;
};

/**
 * Get all orders (admin only) with optional status filter and pagination.
 */
const getAllOrders = async (queryParams) => {
    const filter = {};

    if (queryParams.status && queryParams.status !== 'all') {
        filter.orderStatus = queryParams.status;
    }

    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        orderRepository.findAll(filter, { skip, limit }),
        orderRepository.countDocuments(filter)
    ]);

    return {
        orders,
        page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total
    };
};

/**
 * Update order status (admin only).
 * Business rules:
 *  - Status can only move FORWARD (one-way progression)
 *  - Admin can cancel from any active status with a reason
 *  - Invoice email is sent when status changes to 'Confirmed'
 *  - Stock is restored when cancelled
 */
const updateOrderStatus = async (orderId, newStatus, cancelReason = '') => {
    const order = await orderRepository.findById(orderId);

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    const currentStatus = order.orderStatus;

    // Cannot change status of already delivered or cancelled orders
    if (currentStatus === 'Delivered') {
        throw new AppError('Cannot change status of a delivered order', 400);
    }
    if (currentStatus === 'Cancelled') {
        throw new AppError('Cannot change status of a cancelled order', 400);
    }

    // Handle cancellation separately (admin can cancel from any active status)
    if (newStatus === 'Cancelled') {
        if (!cancelReason || cancelReason.trim().length === 0) {
            throw new AppError('A reason is required when cancelling an order', 400);
        }

        order.orderStatus = 'Cancelled';
        order.cancelledAt = new Date();
        order.cancelReason = cancelReason.trim();

        // Restore stock
        for (const item of order.orderItems) {
            const product = await Product.findById(item.product._id || item.product);
            if (product) {
                product.stock += item.quantity;
                product.inStock = true;
                product.totalSold = Math.max(0, (product.totalSold || 0) - item.quantity);
                await product.save();
            }
        }

        await orderRepository.update(order);
        return orderRepository.findById(orderId);
    }

    // Validate one-way forward progression
    const allowedTransitions = STATUS_FLOW[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
        throw new AppError(
            `Cannot change status from "${currentStatus}" to "${newStatus}". Allowed: ${allowedTransitions.join(', ') || 'none'}`,
            400
        );
    }

    order.orderStatus = newStatus;

    if (newStatus === 'Delivered') {
        order.deliveredAt = new Date();
    }

    await orderRepository.update(order);

    // Send invoice email when status changes to 'Confirmed'
    if (newStatus === 'Confirmed') {
        try {
            const populatedOrder = await orderRepository.findById(orderId);
            const userEmail = populatedOrder.user?.email;
            if (userEmail) {
                const html = generateInvoiceHTML(populatedOrder);
                await sendEmail({
                    to: userEmail,
                    subject: `SARA Herbal - Order #${orderId.toString().substring(orderId.toString().length - 8).toUpperCase()} Confirmed`,
                    html
                });
            }
        } catch (emailError) {
            // Log but don't block the response
            console.error('Failed to send invoice email:', emailError.message);
        }
    }

    return orderRepository.findById(orderId);
};

/**
 * Cancel an order (user action).
 * Business rule: Only orders with 'Pending' status can be cancelled by users.
 * Restores stock on each product.
 */
const cancelOrder = async (orderId, userId) => {
    const order = await orderRepository.findById(orderId);

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    if (order.user._id.toString() !== userId.toString()) {
        throw new AppError('Not authorized to cancel this order', 403);
    }

    if (order.orderStatus !== 'Pending') {
        throw new AppError(`Cannot cancel an order that is "${order.orderStatus}". Only pending orders can be cancelled.`, 400);
    }

    order.orderStatus = 'Cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = 'Cancelled by customer';

    // Restore stock
    for (const item of order.orderItems) {
        const product = await Product.findById(item.product._id || item.product);
        if (product) {
            product.stock += item.quantity;
            product.inStock = true;
            product.totalSold = Math.max(0, (product.totalSold || 0) - item.quantity);
            await product.save();
        }
    }

    await orderRepository.update(order);
    return orderRepository.findById(orderId);
};

/**
 * Update order details (shipping address, note) by user.
 * Business rule: Only 'Pending' orders can be edited.
 */
const updateOrderDetails = async (orderId, userId, dto) => {
    const order = await orderRepository.findById(orderId);

    if (!order) {
        throw new AppError('Order not found', 404);
    }

    if (order.user._id.toString() !== userId.toString()) {
        throw new AppError('Not authorized to edit this order', 403);
    }

    if (order.orderStatus !== 'Pending') {
        throw new AppError(`Cannot edit an order that is "${order.orderStatus}". Only pending orders can be edited.`, 400);
    }

    order.shippingAddress = dto.shippingAddress;
    order.orderNote = dto.orderNote !== undefined ? dto.orderNote : order.orderNote;

    await orderRepository.update(order);
    return orderRepository.findById(orderId);
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
    updateOrderDetails
};
