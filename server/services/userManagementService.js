const userManagementRepository = require('../repositories/userManagementRepository');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');

/**
 * User Management Service — Business logic for admin user operations.
 */

/**
 * Get all users with search, filter, and pagination.
 */
const getAllUsers = async (queryParams) => {
    const filter = {};

    // Search by name or email
    if (queryParams.search) {
        const searchRegex = new RegExp(queryParams.search, 'i');
        filter.$or = [
            { name: searchRegex },
            { email: searchRegex }
        ];
    }

    // Filter by role
    if (queryParams.role && queryParams.role !== 'all') {
        filter.role = queryParams.role;
    }

    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
        userManagementRepository.findAll(filter, { skip, limit }),
        userManagementRepository.countDocuments(filter)
    ]);

    return {
        users,
        page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total
    };
};

/**
 * Get a single user's details including order statistics.
 */
const getUserById = async (userId) => {
    const user = await userManagementRepository.findById(userId);

    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Get order stats for this user
    const orderStats = await Order.aggregate([
        { $match: { user: user._id } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpent: {
                    $sum: {
                        $cond: [{ $ne: ['$orderStatus', 'Cancelled'] }, '$totalPrice', 0]
                    }
                }
            }
        }
    ]);

    return {
        user,
        orderStats: orderStats[0] || { totalOrders: 0, totalSpent: 0 }
    };
};

/**
 * Update a user's role.
 * Business rule: Admin cannot demote themselves.
 */
const updateUserRole = async (userId, newRole, adminId) => {
    if (userId === adminId.toString()) {
        throw new AppError('You cannot change your own role', 400);
    }

    const user = await userManagementRepository.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    const updatedUser = await userManagementRepository.updateRole(userId, newRole);
    return updatedUser;
};

/**
 * Delete a user.
 * Business rules: Cannot delete yourself, cannot delete user with pending orders.
 */
const deleteUser = async (userId, adminId) => {
    if (userId === adminId.toString()) {
        throw new AppError('You cannot delete your own account', 400);
    }

    const user = await userManagementRepository.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }

    // Check for pending orders
    const pendingOrders = await Order.countDocuments({
        user: userId,
        orderStatus: { $in: ['Pending', 'Confirmed', 'Processing', 'Shipped'] }
    });

    if (pendingOrders > 0) {
        throw new AppError(`Cannot delete user with ${pendingOrders} active order(s). Cancel or complete them first.`, 400);
    }

    await userManagementRepository.deleteUser(userId);
    return { message: 'User deleted successfully' };
};

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
