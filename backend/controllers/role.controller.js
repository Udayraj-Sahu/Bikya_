const User = require('../models/user.model');
const AppError = require('../utils/appError');

// @desc    Assign role to user
// @route   PUT /api/roles/:userId
// @access  Private (Owner only)
exports.assignRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    // Validate role
    if (!role || !['user', 'admin', 'owner'].includes(role)) {
      return next(
        new AppError('Please provide a valid role (user, admin, or owner).', 400)
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found.', 404));
    }

    // If assigning owner role, check if another owner already exists
    if (role === 'owner') {
      const existingOwner = await User.findOne({ 
        role: 'owner', 
        _id: { $ne: userId } 
      });
      
      if (existingOwner) {
        return next(
          new AppError('Another user is already assigned as Owner.', 400)
        );
      }
    }

    // Update user role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/roles/users
// @access  Private (Owner only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('fullName email phone role joinDate');

    res.status(200).json({
      success: true,
      count: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
};