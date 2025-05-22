const Bike = require('../models/bike.model');
const AppError = require('../utils/appError');
const { uploadWithRetry } = require('../config/cloudinary');

// @desc    Get all bikes
// @route   GET /api/bikes
// @access  Public
exports.getAllBikes = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      lat, 
      lng, 
      maxDistance,
      availability
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (availability) {
      filter.availability = availability === 'true';
    }

    // Geospatial query if coordinates are provided
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance) || 10000, // Default to 10km
        },
      };
    }

    // Count total documents
    const total = await Bike.countDocuments(filter);

    // Get bikes with pagination
    const bikes = await Bike.find(filter)
      .skip(skip)
      .limit(limitNumber)
      .populate('createdBy', 'fullName');

    res.status(200).json({
      success: true,
      count: bikes.length,
      totalPages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      data: {
        bikes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bike by ID
// @route   GET /api/bikes/:id
// @access  Public
exports.getBikeById = async (req, res, next) => {
  try {
    const bike = await Bike.findById(req.params.id).populate(
      'createdBy',
      'fullName'
    );

    if (!bike) {
      return next(new AppError('Bike not found.', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        bike,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new bike
// @route   POST /api/bikes
// @access  Private (Admin only)
exports.createBike = async (req, res, next) => {
  try {
    const {
      model,
      pricePerHour,
      pricePerDay,
      location,
      category,
      features,
      engineCapacity,
      batteryRange,
    } = req.body;

    const files = req.files;

    if (!files || files.length === 0) {
      return next(new AppError('Please upload at least one image.', 400));
    }

    // Upload images to Cloudinary with retry and optimization
    const uploadPromises = files.map((file) =>
      uploadWithRetry(file.path, {
        folder: 'bikya/bikes',
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      })
    );

    const results = await Promise.all(uploadPromises);
    const images = results.map((result) => result.secure_url);

    // Create new bike
    const bike = await Bike.create({
      model,
      pricePerHour,
      pricePerDay,
      location: {
        type: 'Point',
        coordinates: location.coordinates,
      },
      availability: true,
      images,
      createdBy: req.user.id,
      category,
      features: features || [],
      engineCapacity: engineCapacity || undefined,
      batteryRange: batteryRange || undefined,
    });

    res.status(201).json({
      success: true,
      data: {
        bike,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bike
// @route   PUT /api/bikes/:id
// @access  Private (Admin only)
exports.updateBike = async (req, res, next) => {
  try {
    const {
      model,
      pricePerHour,
      pricePerDay,
      location,
      availability,
      category,
      features,
      engineCapacity,
      batteryRange,
    } = req.body;

    // Build update object
    const updateData = {};
    if (model) updateData.model = model;
    if (pricePerHour) updateData.pricePerHour = pricePerHour;
    if (pricePerDay) updateData.pricePerDay = pricePerDay;
    if (location && location.coordinates) {
      updateData.location = {
        type: 'Point',
        coordinates: location.coordinates,
      };
    }
    if (availability !== undefined) updateData.availability = availability;
    if (category) updateData.category = category;
    if (features) updateData.features = features;
    if (engineCapacity) updateData.engineCapacity = engineCapacity;
    if (batteryRange) updateData.batteryRange = batteryRange;

    // Check if bike exists
    let bike = await Bike.findById(req.params.id);
    if (!bike) {
      return next(new AppError('Bike not found.', 404));
    }

    // Update bike
    bike = await Bike.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: {
        bike,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bike
// @route   DELETE /api/bikes/:id
// @access  Private (Admin only)
exports.deleteBike = async (req, res, next) => {
  try {
    const bike = await Bike.findById(req.params.id);

    if (!bike) {
      return next(new AppError('Bike not found.', 404));
    }

    await Bike.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};