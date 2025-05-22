// backend/controllers/payment.controller.js
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/booking.model');
const User = require('../models/user.model'); // If you need to update user wallet, etc.
const Bike = require('../models/bike.model');   // To update bike availability
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsyns');

// Initialize Razorpay (if not already globally available, but it's good to have it here too)
// Ensure these are in your .env file
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
    return next(new AppError('Payment verification details are incomplete.', 400));
  }

  // Step 1: Verify the signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    // Consider updating booking status to 'payment_failed' here
    await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'failed', status: 'payment_failed' });
    return next(new AppError('Payment verification failed: Invalid signature.', 400));
  }

  // Step 2: Signature is valid. Update booking status in your database.
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    // This should ideally not happen if bookingId is correct
    return next(new AppError('Booking not found for payment verification.', 404));
  }

  // Check if orderId matches
  if (booking.orderId !== razorpay_order_id) {
      await Booking.findByIdAndUpdate(bookingId, { paymentStatus: 'failed', status: 'payment_failed' });
      return next(new AppError('Order ID mismatch during payment verification.', 400));
  }

  // Update booking details
  booking.paymentId = razorpay_payment_id;
  booking.paymentStatus = 'success';
  booking.status = 'confirmed'; // Or 'active' if booking starts immediately
  await booking.save();

  // Make the bike unavailable (if not already done during order creation)
  // Your booking.controller.createBooking already sets availability to false.
  // This is a good place to ensure it, or if the initial booking creation only created a 'pending_payment' booking.
  // await Bike.findByIdAndUpdate(booking.bikeId, { availability: false });

  // TODO: Send booking confirmation email/notification to user

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully. Booking confirmed.',
    data: {
      bookingId: booking._id,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: booking.status,
    },
  });
});
