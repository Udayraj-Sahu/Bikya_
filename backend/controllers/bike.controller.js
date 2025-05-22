// backend/controllers/bike.controller.js
const Bike = require('../models/bike.model');
const User = require('../models/user.model'); // Needed if you link bikes to users in more detail
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { uploadToCloudinary } = require('../config/cloudinary'); // If bike images are uploaded

// Note: For bike image uploads, you'd typically use a similar multer setup as for documents.
// Let's assume for now that image URLs are provided directly in the request body,
// or that you'll adapt the document upload logic for bike images.
// If uploading directly:
// const uploadMiddleware = require('../middleware/upload.middleware'); // e.g., upload.array('images', 5)

// GET All Bikes (Public/User facing - already likely implemented for user explore)
exports.getAllBikes = catchAsync(async (req, res, next) => {
  // Add filtering, sorting, pagination as needed for user exploration
  // Example: Geospatial query if 'near' coordinates are provided
  let query = Bike.find({ availability: true }); // Default to available bikes for users

  // Basic filtering example (can be expanded)
  if (req.query.category) {
    query = query.where('category').equals(req.query.category);
  }
  if (req.query.model) {
    query = query.where('model').regex(new RegExp(req.query.model, 'i')); // Case-insensitive search
  }

  // Geospatial search (if coordinates are provided in query)
  // Example: /api/bikes?coords=longitude,latitude&maxDistance=10000 (in meters)
  if (req.query.coords) {
    const [longitude, latitude] = req.query.coords.split(',').map(parseFloat);
    const maxDistance = parseInt(req.query.maxDistance, 10) || 10000; // Default 10km

    if (!isNaN(longitude) && !isNaN(latitude)) {
      query = query.where('location').near({
        center: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        maxDistance: maxDistance, // in meters
      });
    }
  }
  
  const bikes = await query;

  res.status(200).json({
    status: 'success',
    results: bikes.length,
    data: {
      bikes,
    },
  });
});

// GET Single Bike (Public/User facing)
exports.getBikeById = catchAsync(async (req, res, next) => {
  const bike = await Bike.findById(req.params.id);
  if (!bike) {
    return next(new AppError('No bike found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      bike,
    },
  });
});


// --- Admin/Owner Restricted Functions ---

// POST Create a new Bike (Admin/Owner)
exports.createBike = catchAsync(async (req, res, next) => {
  // Assuming req.user is populated by authMiddleware.protect
  const { model, category, pricePerHour, pricePerDay, location, addressText, images } = req.body;

  // Basic validation (more robust validation should be in a middleware)
  if (!model || !category || !pricePerHour || !pricePerDay || !location || !location.coordinates || !images || images.length === 0) {
    return next(new AppError('Please provide all required bike details including model, category, prices, location, and at least one image URL.', 400));
  }
  if(location.coordinates.length !== 2){
    return next(new AppError('Location coordinates must be an array of [longitude, latitude].', 400));
  }


  // TODO: If handling image uploads directly (not just URLs):
  // let imageUrls = [];
  // if (req.files && req.files.images) {
  //   for (const file of req.files.images) {
  //     const result = await uploadToCloudinary(file.buffer, file.originalname, `bikya_bikes/${req.user.id}`);
  //     imageUrls.push(result.secure_url);
  //   }
  // } else if (req.body.images) { // If URLs are passed directly
  //   imageUrls = req.body.images;
  // }
  // if (imageUrls.length === 0) return next(new AppError('At least one image is required.', 400));

  const newBikeData = {
    model,
    category,
    pricePerHour,
    pricePerDay,
    location: { // Ensure GeoJSON Point format
        type: 'Point',
        coordinates: [parseFloat(location.coordinates[0]), parseFloat(location.coordinates[1])] // [longitude, latitude]
    },
    addressText, // Optional human-readable address
    images, // Assuming images are an array of URLs for now
    availability: req.body.availability !== undefined ? req.body.availability : true,
    createdBy: req.user.id, // Link to the admin/owner who created it
  };

  const newBike = await Bike.create(newBikeData);

  res.status(201).json({
    status: 'success',
    data: {
      bike: newBike,
    },
  });
});

// PATCH Update a Bike (Admin/Owner)
exports.updateBike = catchAsync(async (req, res, next) => {
  const bikeId = req.params.id;
  const updates = req.body;

  // Filter out fields that should not be updated this way (e.g., createdBy)
  const allowedUpdates = ['model', 'category', 'pricePerHour', 'pricePerDay', 'location', 'addressText', 'availability', 'images'];
  const filteredUpdates = {};
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  // Handle location update specifically for GeoJSON format
  if (filteredUpdates.location && filteredUpdates.location.coordinates) {
    if(filteredUpdates.location.coordinates.length !== 2){
        return next(new AppError('Location coordinates must be an array of [longitude, latitude].', 400));
    }
    filteredUpdates.location = {
        type: 'Point',
        coordinates: [
            parseFloat(filteredUpdates.location.coordinates[0]), 
            parseFloat(filteredUpdates.location.coordinates[1])
        ]
    };
  }


  // TODO: Handle image updates (e.g., adding new images, removing old ones)
  // This can be complex: might involve deleting from Cloudinary, then uploading new ones.
  // For simplicity, if 'images' array is provided, it replaces the old one.

  const updatedBike = await Bike.findByIdAndUpdate(bikeId, filteredUpdates, {
    new: true, // Return the modified document rather than the original
    runValidators: true, // Ensure schema validations are run
  });

  if (!updatedBike) {
    return next(new AppError('No bike found with that ID to update', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      bike: updatedBike,
    },
  });
});

// DELETE a Bike (Admin/Owner)
exports.deleteBike = catchAsync(async (req, res, next) => {
  const bikeId = req.params.id;
  const bike = await Bike.findByIdAndDelete(bikeId);

  if (!bike) {
    return next(new AppError('No bike found with that ID to delete', 404));
  }

  // TODO: If images are stored in Cloudinary, you might want to delete them here as well.
  // This requires storing public_ids of images and iterating through them.
  // For example:
  // if (bike.images && bike.images.length > 0) {
  //   const publicIds = bike.images.map(url => /* extract public_id from url */);
  //   await cloudinary.api.delete_resources(publicIds);
  // }

  res.status(204).json({ // 204 No Content
    status: 'success',
    data: null,
  });
});
