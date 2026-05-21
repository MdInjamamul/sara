const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

/**
 * Analytics Service — MongoDB aggregation pipelines for dashboard statistics.
 */

/**
 * Get high-level dashboard statistics.
 */
const getDashboardStats = async () => {
    const [orderStats, totalUsers, totalProducts] = await Promise.all([
        Order.aggregate([
            {
                $facet: {
                    totals: [
                        {
                            $group: {
                                _id: null,
                                totalOrders: { $sum: 1 },
                                totalRevenue: {
                                    $sum: {
                                        $cond: [{ $ne: ['$orderStatus', 'Cancelled'] }, '$totalPrice', 0]
                                    }
                                }
                            }
                        }
                    ],
                    pending: [
                        { $match: { orderStatus: 'Pending' } },
                        { $count: 'count' }
                    ],
                    todayOrders: [
                        {
                            $match: {
                                createdAt: {
                                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                                }
                            }
                        },
                        { $count: 'count' }
                    ]
                }
            }
        ]),
        User.countDocuments(),
        Product.countDocuments()
    ]);

    const totals = orderStats[0]?.totals[0] || { totalOrders: 0, totalRevenue: 0 };
    const pending = orderStats[0]?.pending[0]?.count || 0;
    const todayOrders = orderStats[0]?.todayOrders[0]?.count || 0;

    return {
        totalOrders: totals.totalOrders,
        totalRevenue: totals.totalRevenue,
        totalUsers,
        totalProducts,
        pendingOrders: pending,
        todayOrders
    };
};

/**
 * Get sales analytics grouped by period (daily, monthly, yearly).
 */
const getSalesAnalytics = async (period = 'monthly') => {
    let groupBy;
    let sortBy;
    let dateFormat;

    switch (period) {
        case 'daily':
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
            sortBy = { '_id.year': 1, '_id.month': 1, '_id.day': 1 };
            dateFormat = (item) => `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`;
            break;
        case 'yearly':
            groupBy = { year: { $year: '$createdAt' } };
            sortBy = { '_id.year': 1 };
            dateFormat = (item) => `${item._id.year}`;
            break;
        default: // monthly
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
            sortBy = { '_id.year': 1, '_id.month': 1 };
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            dateFormat = (item) => `${months[item._id.month - 1]} ${item._id.year}`;
    }

    const results = await Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        {
            $group: {
                _id: groupBy,
                revenue: { $sum: '$totalPrice' },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: sortBy }
    ]);

    return results.map(item => ({
        label: dateFormat(item),
        revenue: item.revenue,
        orderCount: item.orderCount
    }));
};

/**
 * Get top selling products by quantity.
 */
const getTopProducts = async (limit = 10) => {
    const results = await Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $unwind: '$orderItems' },
        {
            $group: {
                _id: '$orderItems.product',
                name: { $first: '$orderItems.name' },
                image: { $first: '$orderItems.image' },
                totalQuantity: { $sum: '$orderItems.quantity' },
                totalRevenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: limit }
    ]);

    return results;
};

/**
 * Get sales revenue grouped by category.
 */
const getCategorySales = async () => {
    const results = await Order.aggregate([
        { $match: { orderStatus: { $ne: 'Cancelled' } } },
        { $unwind: '$orderItems' },
        {
            $lookup: {
                from: 'products',
                localField: 'orderItems.product',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: '$productInfo' },
        {
            $lookup: {
                from: 'categories',
                localField: 'productInfo.category',
                foreignField: '_id',
                as: 'categoryInfo'
            }
        },
        { $unwind: '$categoryInfo' },
        {
            $group: {
                _id: '$categoryInfo._id',
                name: { $first: '$categoryInfo.name' },
                revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
                orderCount: { $sum: 1 }
            }
        },
        { $sort: { revenue: -1 } }
    ]);

    return results;
};

/**
 * Get order count grouped by status.
 */
const getOrderStatusDistribution = async () => {
    const results = await Order.aggregate([
        {
            $group: {
                _id: '$orderStatus',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    return results.map(item => ({
        status: item._id,
        count: item.count
    }));
};

module.exports = {
    getDashboardStats,
    getSalesAnalytics,
    getTopProducts,
    getCategorySales,
    getOrderStatusDistribution
};
