// backend/routes/payment.routes.js
const express = require('express');
const paymentController = require('../controllers/payment.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const validationMiddleware = require('../middleware/validation.middleware');

const router = express.Router();

// All routes here should be protected as they relate to user actions
router.use(authMiddleware.protect);

// This endpoint is called by the frontend after Razorpay processes the payment
router.post(
  '/verify',
  [
    body('razorpay_order_id').notEmpty().withMessage('Razorpay Order ID is required.'),
    body('razorpay_payment_id').notEmpty().withMessage('Razorpay Payment ID is required.'),
    body('razorpay_signature').notEmpty().withMessage('Razorpay Signature is required.'),
    body('bookingId').isMongoId().withMessage('Valid Booking ID is required.'),
  ],
  validationMiddleware.handleValidationErrors,
  paymentController.verifyPayment
);

// You could also move the "create Razorpay order" logic here if you want to separate it from booking creation.
// For example:
// router.post('/create-order', bookingController.createRazorpayOrderForBooking); // Assuming you create such a function

module.exports = router;
