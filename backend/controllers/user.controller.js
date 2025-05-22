// backend/controllers/user.controller.js
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync'); // Assuming you have this
const AppError = require('../utils/appError');   // Assuming you have this

// Utility to filter allowed fields for updates
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getUserProfile = catchAsync(async (req, res, next) => {
  // req.user is set by the 'protect' middleware
  const user = await User.findById(req.user.id)
    .populate('documents') // Optionally populate documents if you want to show their status directly
    .populate('bookings');  // Optionally populate bookings

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUserProfile = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.', // You might create this route later
        400
      )
    );
  }

  // 2) Filter out unwanted fields names that are not allowed to be updated
  //    Users should only be able to update basic info like name, phone, maybe location.
  //    Role, email (usually not) should not be updatable here.
  const filteredBody = filterObj(req.body, 'fullName', 'phone', 'location');
  // If you store images directly on user model (e.g. profile picture), handle file upload here.

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // Return the new document
    runValidators: true, // Run schema validators
  });

  if (!updatedUser) {
    return next(new AppError('Error updating profile. User not found.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Placeholder for getting all users (for Admin/Owner) - you might have this in role.controller.js or here
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

// You might also want a getMe function that sets req.params.id = req.user.id
// exports.getMe = (req, res, next) => {
//   req.params.id = req.user.id;
//   next();
// };
// Then you could have a generic getUser controller:
// exports.getUser = catchAsync(async (req, res, next) => { ... User.findById(req.params.id) ... });