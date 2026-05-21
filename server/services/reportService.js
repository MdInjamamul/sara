const Order = require('../models/Order');

/**
 * Report Service — Generates structured report data for in-UI display.
 */

/**
 * Get order report data for a given period.
 * @param {string} period - 'daily' | 'monthly' | 'yearly'
 * @returns {Object} Report with summary stats and order rows
 */
const getOrderReport = async (period = 'monthly') => {
    const now = new Date();
    let startDate, endDate, periodLabel;

    switch (period) {
        case 'daily':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
            periodLabel = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            periodLabel = `Year ${now.getFullYear()}`;
            break;
        default: // monthly
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            periodLabel = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }

    const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate }
    })
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });

    // Calculate summary stats
    const totalOrders = orders.length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
    const activeOrders = orders.filter(o => o.orderStatus !== 'Cancelled');
    const totalRevenue = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;
    const cancellationRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : 0;

    // Status breakdown
    const statusBreakdown = {};
    orders.forEach(o => {
        statusBreakdown[o.orderStatus] = (statusBreakdown[o.orderStatus] || 0) + 1;
    });

    // Format order rows
    const orderRows = orders.map(order => ({
        _id: order._id,
        orderId: order._id.toString().substring(order._id.toString().length - 8).toUpperCase(),
        date: order.createdAt,
        customerName: order.user?.name || 'Unknown',
        customerEmail: order.user?.email || '',
        itemCount: order.orderItems.reduce((acc, item) => acc + item.quantity, 0),
        subtotal: order.itemsPrice,
        shipping: order.shippingPrice,
        total: order.totalPrice,
        status: order.orderStatus,
        paymentMethod: order.paymentMethod,
        district: order.shippingAddress.city,
        province: order.shippingAddress.state
    }));

    return {
        period: periodLabel,
        periodType: period,
        startDate,
        endDate,
        summary: {
            totalOrders,
            totalRevenue,
            avgOrderValue,
            deliveredOrders,
            cancelledOrders,
            cancellationRate,
            statusBreakdown
        },
        orders: orderRows
    };
};

module.exports = { getOrderReport };
