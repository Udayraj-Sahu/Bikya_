const Booking = require('../models/booking.model');
const Bike = require('../models/bike.model');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const Razorpay = require('razorpay');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private (Requires document verification)
exports.createBooking = async (req, res, next) => {
  try {
    const {
      bikeId,
      duration,
      startTime,
      pickupLocation,
      dropoffLocation,
    } = req.body;

    // Check if bike exists and is available
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return next(new AppError('Bike not found.', 404));
    }

    if (!bike.availability) {
      return next(new AppError('Bike is not available for booking.', 400));
    }

    // Calculate end time and total amount
    const start = new Date(startTime);
    const end = new Date(start);
    end.setHours(start.getHours() + duration);

    // Calculate total amount (hourly or daily rate)
    let totalAmount;
    if (duration <= 24) {
      totalAmount = bike.pricePerHour * duration;
    } else {
      const days = Math.ceil(duration / 24);
      totalAmount = bike.pricePerDay * days;
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: totalAmount * 100, // Convert to smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        bikeId: bikeId,
        userId: req.user.id,
        duration: duration,
      },
    });

    // Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      bikeId,
      duration,
      startTime: start,
      endTime: end,
      totalAmount,
      status: 'pending',
      orderId: order.id,
      pickupLocation,
      dropoffLocation,
    });

    // Add booking to user's bookings array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { bookings: booking._id },
    });

    // Update bike availability
    await Bike.findByIdAndUpdate(bikeId, { availability: false });

    res.status(201).json({
      success: true,
      data: {
        booking,
        order,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin: all, User: own)
exports.getBookings = async (req, res, next) => {
  try {
    const { status } = req.query;

    // Build filter object
    const filter = {};
    if (status && ['pending', 'active', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    // If user is not admin or owner, limit to own bookings
    if (req.user.role !== 'admin' && req.user.role !== 'owner') {
      filter.userId = req.user.id;
    }

    const bookings = await Booking.find(filter)
      .populate({
        path: 'bikeId',
        select: 'model images',
      })
      .populate({
        path: 'userId',
        select: 'fullName email phone',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: {
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'bikeId',
        select: 'model images pricePerHour pricePerDay',
      })
      .populate({
        path: 'userId',
        select: 'fullName email phone',
      });

    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    // Check if user is authorized to view this booking
    if (
      booking.userId._id.toString() !== req.user.id &&
      req.user.role !== 'admin' &&
      req.user.role !== 'owner'
    ) {
      return next(
        new AppError('You are not authorized to view this booking.', 403)
      );
    }

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

// @desc    Update booking status
// @route   PUT /api/bookings/:id
// @access  Private (Admin only)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'completed', 'cancelled'].includes(status)) {
      return next(new AppError('Please provide a valid status.', 400));
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    // Update booking status
    booking.status = status;
    
    // If booking is completed or cancelled, make bike available again
    if (status === 'completed' || status === 'cancelled') {
      await Bike.findByIdAndUpdate(booking.bikeId, { availability: true });
    }
    
    // Add cancellation reason if provided
    if (status === 'cancelled' && req.body.cancelReason) {
      booking.cancelReason = req.body.cancelReason;
    }

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

// @desc    Submit booking review
// @route   POST /api/bookings/:id/review
// @access  Private
exports.submitBookingReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Please provide a valid rating (1-5).', 400));
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new AppError('Booking not found.', 404));
    }

    // Check if user is authorized to review this booking
    if (booking.userId.toString() !== req.user.id) {
      return next(
        new AppError('You are not authorized to review this booking.', 403)
      );
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return next(
        new AppError('You can only review completed bookings.', 400)
      );
    }

    // Add review
    booking.review = {
      rating,
      comment: comment || '',
      createdAt: Date.now(),
    };

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