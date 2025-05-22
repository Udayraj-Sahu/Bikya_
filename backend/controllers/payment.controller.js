const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/booking.model');
const AppError = require('../utils/appError');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    // Check if booking belongs to user
    if (booking.userId.toString() !== req.user.id) {
      return next(
        new AppError('You are not authorized to pay for this booking.', 403)
      );
    }

    // Check if booking is pending
    if (booking.status !== 'pending') {
      return next(
        new AppError(`Cannot create payment for ${booking.status} booking.`, 400)
      );
    }

    // Check if order already exists
    if (booking.orderId) {
      // Get existing order details
      const existingOrder = await razorpay.orders.fetch(booking.orderId);
      
      return res.status(200).json({
        success: true,
        data: {
          order: existingOrder,
        },
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: booking.totalAmount * 100, // Convert to smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${bookingId}`,
      notes: {
        bookingId: bookingId,
        userId: req.user.id,
      },
    });

    // Update booking with order ID
    booking.orderId = order.id;
    await booking.save();

    res.status(201).json({
      success: true,
      data: {
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate payment signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return next(new AppError('Invalid payment signature.', 400));
    }

    // Find booking by order ID
    const booking = await Booking.findOne({ orderId: razorpay_order_id });
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    // Update booking status and payment details
    booking.status = 'active';
    booking.paymentId = razorpay_payment_id;
    await booking.save();

    res.status(200).json({
      success: true,
      data: {
        booking,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private (Admin or booking owner)
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const paymentId = req.params.paymentId;

    // Find booking by payment ID
    const booking = await Booking.findOne({ paymentId })
      .populate({
        path: 'userId',
        select: 'fullName email',
      })
      .populate({
        path: 'bikeId',
        select: 'model',
      });

    if (!booking) {
      return next(new AppError('Payment not found.', 404));
    }

    // Check authorization
    if (
      booking.userId._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'owner'
    ) {
      return next(
        new AppError('You are not authorized to view this payment.', 403)
      );
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      data: {
        booking,
        payment,
      },
    });
  } catch (error) {
    next(error);
  }
};