const Order = require('../models/Order');

/**
 * Order Repository — The ONLY layer that touches Mongoose.
 * Contains pure database operations with zero business logic.
 */

const create = (data) => {
    const order = new Order(data);
    return order.save();
};

const findById = (id) => {
    return Order.findById(id)
        .populate('user', 'name email phone')
        .populate('orderItems.product', 'slug images');
};

const findByUser = (userId) => {
    return Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate('orderItems.product', 'slug images');
};

const findAll = (filter = {}, options = {}) => {
    let query = Order.find(filter)
        .populate('user', 'name email phone')
        .populate('orderItems.product', 'slug images')
        .sort({ createdAt: -1 });

    if (options.skip) query = query.skip(options.skip);
    if (options.limit) query = query.limit(options.limit);

    return query;
};

const countDocuments = (filter = {}) => {
    return Order.countDocuments(filter);
};

const update = (order) => {
    return order.save();
};

module.exports = {
    create,
    findById,
    findByUser,
    findAll,
    countDocuments,
    update
};
