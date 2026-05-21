const Product = require('../models/Product');

/**
 * Product Repository — The ONLY layer that touches Mongoose.
 * Contains pure database operations with zero business logic.
 */

const findAll = (filter = {}, options = {}) => {
    let query = Product.find(filter).populate('category');
    if (options.limit) {
        query = query.limit(parseInt(options.limit));
    }
    return query;
};

const findBySlug = (slug) => {
    return Product.findOne({ slug }).populate('category');
};

const findById = (id) => {
    return Product.findById(id).populate('category');
};

const create = (data) => {
    const product = new Product(data);
    return product.save();
};

const update = (product) => {
    return product.save();
};

const remove = (product) => {
    return product.deleteOne();
};

module.exports = {
    findAll,
    findBySlug,
    findById,
    create,
    update,
    remove
};
