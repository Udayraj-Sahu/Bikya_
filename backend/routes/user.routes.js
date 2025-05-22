// backend/routes/user.routes.js
const express = require('express');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware'); // If you created this
const { body } = require('express-validator'); // For validations

const router = express.Router();

// All routes below this are protected
router.use(authMiddleware.protect);

router.get(
    '/profile', // Or '/me'
    userController.getUserProfile
);

router.patch( // Using PATCH for partial updates
    '/profile', // Or '/updateMe'
    [ // Add your input validations for fields that can be updated
        body('fullName').optional().notEmpty().withMessage('Full name cannot be empty').trim(),
        body('phone').optional().isMobilePhone('any', { strictMode: false }).withMessage('Invalid phone number'),
        // Add validation for location if you allow its update
        body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Coordinates must be [longitude, latitude]'),
        body('location.coordinates.*').optional().isNumeric().withMessage('Coordinates must be numbers'),
    ],
    validationMiddleware.handleValidationErrors, // Your validation error handler
    userController.updateUserProfile
);


// If you need routes for admin/owner to manage users (e.g., from role.controller.js or here)
// router.get('/', authMiddleware.restrictTo('admin', 'owner'), userController.getAllUsers);
// router.get('/:id', authMiddleware.restrictTo('admin', 'owner'), userController.getUser); // Needs param validation for ID

module.exports = router;