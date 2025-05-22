const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Validation middleware
const validateSignup = [
  check('fullName', 'Full name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('phone', 'Please include a valid phone number').notEmpty(),
  check('password', 'Password must be at least 6 characters').isLength({
    min: 6,
  }),
];

const validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

// Routes
router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.get('/me', authMiddleware.protect, authController.getMe);

module.exports = router;