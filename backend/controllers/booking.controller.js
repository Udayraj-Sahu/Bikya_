// backend/controllers/booking.controller.js
const Booking = require("../models/booking.model");
const Bike = require("../models/bike.model");
const User = require("../models/user.model");
const AppError = require("../utils/appError"); // Ensure this file exists in ../utils/
const Razorpay = require("razorpay");

// Check for Razorpay keys first, at the module level
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error(
        "FATAL ERROR: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing from .env file. Application will not function correctly for payments."
    );
    // Optionally, throw an error to prevent the app from starting if keys are critical for startup
    // For now, we'll let it proceed but log the error.
    // throw new Error('Razorpay API keys are not configured. Please check your .env file.');
}

// Initialize Razorpay client once at the module level
// This instance will be used by the controller functions.
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
            duration, // Assuming duration is passed in hours from frontend
            startTime, // Assuming ISO string for start time
            pickupLocation, // Optional
            dropoffLocation  // Optional
        } = req.body;

        // --- Input Validation ---
        if (!bikeId || duration === undefined || !startTime) {
            return next(new AppError("Bike ID, duration, and start time are required.", 400));
        }
        const numericDuration = parseInt(duration);
        if (isNaN(numericDuration) || numericDuration <= 0) {
            return next(new AppError("Duration must be a positive number of hours.", 400));
        }

        const start = new Date(startTime);
        if (isNaN(start.getTime())) {
            return next(new AppError("Invalid start time format. Please use ISO format.", 400));
        }
        // Optional: Add a buffer, e.g., booking must be at least 1 hour in the future
        if (start < new Date(Date.now() + 30 * 60 * 1000)) { // e.g., 30 mins buffer
            return next(new AppError("Booking start time must be at least 30 minutes in the future.", 400));
        }

        // --- Bike Availability and Pricing ---
        const bike = await Bike.findById(bikeId);
        if (!bike) {
            return next(new AppError("Bike not found.", 404));
        }
        if (!bike.availability) {
            return next(new AppError("Bike is not available for booking at this moment.", 400));
        }
        if (typeof bike.pricePerHour !== 'number' || typeof bike.pricePerDay !== 'number') {
            console.error(`Bike ${bikeId} has invalid pricing: perHour=${bike.pricePerHour}, perDay=${bike.pricePerDay}`);
            return next(new AppError("Bike pricing information is invalid or missing.", 500));
        }

        // --- Calculate End Time and Total Amount ---
        const end = new Date(start);
        end.setHours(start.getHours() + numericDuration);

        let totalAmount;
        // Example pricing logic: hourly for up to a certain threshold, then daily
        // This logic should align with what frontend shows and be the source of truth
        if (numericDuration <= 8 && (numericDuration * bike.pricePerHour < bike.pricePerDay) ) { // e.g., if less than 8 hours and cheaper than a day
            totalAmount = bike.pricePerHour * numericDuration;
        } else {
            const days = Math.ceil(numericDuration / 24); // Calculate full or partial days
            totalAmount = bike.pricePerDay * days;
        }

        if (isNaN(totalAmount) || totalAmount <= 0) {
            return next(new AppError("Calculated total amount is invalid. Check bike prices and duration.", 400));
        }
        
        // --- Create Razorpay Order ---
        const orderOptions = {
            amount: Math.round(totalAmount * 100), // Amount in smallest currency unit (paise), must be an integer
            currency: "INR",
            receipt: `receipt_booking_${req.user.id}_${Date.now()}`, // More unique receipt
            notes: {
                internalBookingBikeId: bikeId.toString(), // Use different note keys if needed
                internalBookingUserId: req.user.id.toString(),
                rentalDurationHours: numericDuration,
            },
        };
        
        const order = await razorpay.orders.create(orderOptions);

        if (!order || !order.id) {
            console.error("Razorpay order creation failed. Response:", order);
            return next(new AppError("Failed to create Razorpay payment order. Please try again.", 500));
        }

        // --- Create Booking in Database ---
        const booking = await Booking.create({
            userId: req.user.id,
            bikeId,
            duration: numericDuration,
            startTime: start,
            endTime: end,
            totalAmount,
            status: "pending_payment", // Initial status before payment
            orderId: order.id,       // Store Razorpay order ID
            pickupLocation,          // Optional
            dropoffLocation,         // Optional
        });

        // --- Update Bike Availability ---
        // It's generally better to mark bike as unavailable only AFTER successful payment.
        // For now, following your original logic, but consider moving this to payment verification.
        await Bike.findByIdAndUpdate(bikeId, { availability: false });

        // --- Respond to Frontend ---
        res.status(201).json({
            success: true,
            message: "Booking initiated. Please complete payment.",
            data: {
                booking,   // Your internal booking object
                order,     // The Razorpay order object (contains order.id for frontend)
            },
        });
    } catch (error) {
        console.error("ERROR IN CREATE BOOKING CONTROLLER:", error); 
        next(error); // Pass to global error handler
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private (Admin: all, User: own)
exports.getBookings = async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = {};
        // Updated status list to match Booking model
        const validStatuses = ["pending_payment", "confirmed", "active", "completed", "cancelled", "rejected", "payment_failed"];
        if (status && validStatuses.includes(status)) {
            filter.status = status;
        }

        if (req.user.role !== "admin" && req.user.role !== "owner") {
            filter.userId = req.user.id;
        }

        const bookings = await Booking.find(filter)
            .populate({ path: "bikeId", select: "model images category pricePerHour pricePerDay" })
            .populate({ path: "userId", select: "fullName email phone" })
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
            .populate({ path: "bikeId", select: "model images category pricePerHour pricePerDay location availability" })
            .populate({ path: "userId", select: "fullName email phone" });

        if (!booking) {
            return next(new AppError("Booking not found.", 404));
        }

        // Ensure booking.userId is populated and has _id before calling toString()
        if (
            !booking.userId || 
            booking.userId._id.toString() !== req.user.id &&
            req.user.role !== "admin" &&
            req.user.role !== "owner"
        ) {
            return next(
                new AppError("You are not authorized to view this booking.", 403)
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

// @desc    Update booking status (Admin/Owner)
// @route   PUT /api/bookings/:id  (or PATCH /api/bookings/:id/status)
// @access  Private (Admin/Owner only)
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        // More comprehensive list of statuses from your Booking model
        const validStatuses = ["pending_payment", "confirmed", "active", "completed", "cancelled", "rejected", "payment_failed"];

        if (!status || !validStatuses.includes(status)) {
            return next(new AppError(`Please provide a valid status (e.g., ${validStatuses.join(', ')}).`, 400));
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return next(new AppError("Booking not found.", 404));
        }

        const oldStatus = booking.status;
        booking.status = status;
        
        // Logic for bike availability
        if (status === "completed" || status === "cancelled" || status === "payment_failed" || status === "rejected") {
            // Only make bike available if it was previously in a state where it was considered 'taken'
            if (booking.bikeId && (oldStatus === 'confirmed' || oldStatus === 'active')) {
                 await Bike.findByIdAndUpdate(booking.bikeId, { availability: true });
            }
        } else if (status === 'confirmed' || status === 'active') {
            // If moving to confirmed/active, ensure bike is unavailable
             if (booking.bikeId) {
                await Bike.findByIdAndUpdate(booking.bikeId, { availability: false });
            }
        }
        
        if (status === "cancelled" && req.body.cancelReason) {
            // Ensure 'cancelReason' field exists in your Booking schema if you use this
            // booking.cancelReason = req.body.cancelReason; 
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

        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return next(
                new AppError("Please provide a valid rating (a number between 1-5).", 400)
            );
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return next(new AppError("Booking not found.", 404));
        }

        if (!booking.userId || booking.userId.toString() !== req.user.id) { 
            return next(
                new AppError("You are not authorized to review this booking.", 403)
            );
        }

        if (booking.status !== "completed") {
            return next(
                new AppError("You can only review completed bookings.", 400)
            );
        }
        
        // Ensure 'review' field is defined in your Booking schema
        // e.g., review: { rating: Number, comment: String, createdAt: Date }
        booking.review = {
            rating,
            comment: comment || "", // Default to empty string if comment is not provided
            createdAt: new Date(),
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
