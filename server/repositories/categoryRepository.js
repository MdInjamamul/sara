const Category = require('../models/Category');

/**
 * Category Repository — Pure data-access layer.
 */

const findAll = () => {
    return Category.find({});
};

const findBySlug = (slug) => {
    return Category.findOne({ slug });
};

const findById = (id) => {
    return Category.findById(id);
};

module.exports = {
    findAll,
    findBySlug,
    findById
};
