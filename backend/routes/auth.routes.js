// backend/routes/auth.routes.js
const express = require('express');
const { body } = require('express-validator'); // Import validation functions
const authController = require('../controllers/auth.controller');
const validationMiddleware = require('../middleware/validation.middleware'); // Import your error handler

const router = express.Router();

router.post(
  '/signup',
  [
    // Validation chain for signup
    body('fullName').notEmpty().withMessage('Full name is required').trim(),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('phone')
      .notEmpty().withMessage('Phone number is required')
      .isMobilePhone('any', { strictMode: false }) // General mobile phone validation
      .withMessage('Please provide a valid phone number'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    // You can add a passwordConfirm field if needed and validate it matches password
    // body('passwordConfirm').custom((value, { req }) => {
    //   if (value !== req.body.password) {
    //     throw new Error('Passwords do not match');
    //   }
    //   return true;
    // })
  ],
  validationMiddleware.handleValidationErrors, // Handle any validation errors
  authController.signup
);

router.post(
  '/login',
  [
    // Validation chain for login
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password cannot be empty'),
  ],
  validationMiddleware.handleValidationErrors, // Handle any validation errors
  authController.login
);

// Add validation for other auth routes if they exist and take input

module.exports = router;