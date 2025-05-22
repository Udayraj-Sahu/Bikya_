// backend/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Adjust path if necessary
const AppError = require('../utils/appError'); // Adjust path if necessary
const catchAsync = require('../utils/catchAsync'); // Assuming you have this utility

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.jwt) { // If you plan to use cookies
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use await if jwt.verify is promisified, or handle callback

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  //    (You'll need a passwordChangedAt field in your User model for this if you implement it)
  //    if (currentUser.changedPasswordAfter(decoded.iat)) {
  //        return next(new AppError('User recently changed password! Please log in again.', 401));
  //    }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

// New/Refined restrictTo middleware
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array like ['admin', 'owner']
    // req.user is available from the 'protect' middleware
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403) // 403 Forbidden
      );
    }
    next();
  };
};