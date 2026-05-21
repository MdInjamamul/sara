const asyncHandler = require('../middleware/asyncHandler');
const userManagementService = require('../services/userManagementService');
const { userDto, userListDto, userDetailDto } = require('../dtos/output/userManagementDto');

/**
 * User Management Controller — Thin orchestration layer.
 */

// @desc    Get all users (admin)
// @route   GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
    const result = await userManagementService.getAllUsers(req.query);
    res.json({
        users: userListDto(result.users),
        page: result.page,
        totalPages: result.totalPages,
        totalUsers: result.totalUsers
    });
});

// @desc    Get single user details (admin)
// @route   GET /api/admin/users/:id
const getUserById = asyncHandler(async (req, res) => {
    const { user, orderStats } = await userManagementService.getUserById(req.params.id);
    res.json(userDetailDto(user, orderStats));
});

// @desc    Update user role (admin)
// @route   PUT /api/admin/users/:id/role
const updateUserRole = asyncHandler(async (req, res) => {
    const updatedUser = await userManagementService.updateUserRole(
        req.params.id,
        req.body.role,
        req.user._id
    );
    res.json(userDto(updatedUser));
});

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
    const result = await userManagementService.deleteUser(req.params.id, req.user._id);
    res.json(result);
});

module.exports = { getAllUsers, getUserById, updateUserRole, deleteUser };
