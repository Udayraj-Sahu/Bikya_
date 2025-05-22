// backend/routes/role.routes.js
const express = require('express');
const roleController = require('../controllers/role.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body, param } = require('express-validator');
const validationMiddleware = require('../middleware/validation.middleware'); // Ensure you have this

const router = express.Router();

// All routes in this file are for Owners only
router.use(authMiddleware.protect, authMiddleware.restrictTo('owner'));

// GET all users for the owner to manage
router.get(
    '/users', // Changed from '/' for clarity, e.g., /api/roles/users
    roleController.getAllUsers
);

// PATCH to update a user's role
router.patch( // Using PATCH as it's a partial update of the user resource
  '/users/:userId/assign-role', // More descriptive route
  [
    param('userId').isMongoId().withMessage('Invalid user ID format.'),
    body('role').isIn(['user', 'admin', 'owner']).withMessage('Invalid role. Must be user, admin, or owner.')
  ],
  validationMiddleware.handleValidationErrors, // Ensure this middleware exists and works
  roleController.assignRole
);

module.exports = router;
