const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser
} = require('../controllers/userManagementController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../validators/validate');
const { updateRoleSchema } = require('../validators/userManagementValidator');

// All routes require admin access
router.use(protect, admin);

router.route('/users')
    .get(getAllUsers);

router.route('/users/:id')
    .get(getUserById)
    .delete(deleteUser);

router.route('/users/:id/role')
    .put(validate(updateRoleSchema), updateUserRole);

module.exports = router;
