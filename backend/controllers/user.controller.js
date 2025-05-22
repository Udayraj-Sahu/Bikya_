const User = require('../models/user.model');
const Document = require('../models/document.model');
const Booking = require('../models/booking.model');
const AppError = require('../utils/appError');
const cloudinary = require('../config/cloudinary');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('documents')
      .populate({
        path: 'bookings',
        populate: {
          path: 'bikeId',
          select: 'model images',
        },
      });

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, phone, location } = req.body;

    // Create object with allowed fields
    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (phone) updateFields.phone = phone;
    if (location && location.coordinates) {
      updateFields.location = {
        type: 'Point',
        coordinates: location.coordinates,
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings
// @route   GET /api/users/bookings
// @access  Private
exports.getUserBookings = async (req, res, next) => {
  try {
    const { status } = req.query;

    // Create filter object
    const filter = { userId: req.user.id };
    if (status && ['pending', 'active', 'completed', 'cancelled'].includes(status)) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate({
        path: 'bikeId',
        select: 'model images pricePerHour pricePerDay',
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

// @desc    Get user's documents
// @route   GET /api/users/documents
// @access  Private
exports.getUserDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: {
        documents,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload user document
// @route   POST /api/users/documents
// @access  Private
exports.uploadUserDocument = async (req, res, next) => {
  try {
    // Check if user is exempt from document upload (admin or owner)
    if (req.user.role === 'admin' || req.user.role === 'owner') {
      return next(
        new AppError(
          `${req.user.role === 'admin' ? 'Admins' : 'Owners'} are exempt from document verification.`,
          400
        )
      );
    }

    const { type, side } = req.body;
    const file = req.file;

    if (!file) {
      return next(new AppError('Please upload a document.', 400));
    }

    if (!type || !['idCard', 'drivingLicense', 'passport'].includes(type)) {
      return next(new AppError('Please provide a valid document type.', 400));
    }

    if (!side || !['front', 'back', 'both'].includes(side)) {
      return next(new AppError('Please provide a valid document side.', 400));
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'bikya/documents',
    });

    // Create new document
    const document = await Document.create({
      userId: req.user.id,
      uri: result.secure_url,
      type,
      side,
      status: 'pending',
    });

    // Add document to user's documents array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { documents: document._id },
    });

    res.status(201).json({
      success: true,
      data: {
        document,
      },
    });
  } catch (error) {
    next(error);
  }
};