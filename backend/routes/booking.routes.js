const express = require('express');
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Routes
router.post(
  '/',
  authMiddleware.verifyUserDocuments,
  bookingController.createBooking
);
router.get('/', bookingController.getBookings);
router.get('/:id', bookingController.getBookingById);
router.post('/:id/review', bookingController.submitBookingReview);

// Admin only routes
router.put(
  '/:id',
  authMiddleware.restrictTo('admin', 'owner'),
  bookingController.updateBookingStatus
);

module.exports = router;