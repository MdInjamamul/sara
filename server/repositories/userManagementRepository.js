const User = require('../models/User');

/**
 * User Management Repository — Data access layer for admin user operations.
 */

const findAll = async (filter = {}, { skip = 0, limit = 20 } = {}) => {
    return User.find(filter)
        .select('-password -resetPasswordToken -resetPasswordExpire')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

const countDocuments = async (filter = {}) => {
    return User.countDocuments(filter);
};

const findById = async (id) => {
    return User.findById(id)
        .select('-password -resetPasswordToken -resetPasswordExpire');
};

const updateRole = async (userId, role) => {
    return User.findByIdAndUpdate(
        userId,
        { role },
        { new: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire');
};

const deleteUser = async (userId) => {
    return User.findByIdAndDelete(userId);
};

module.exports = { findAll, countDocuments, findById, updateRole, deleteUser };
