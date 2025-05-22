// backend/controllers/role.controller.js
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsyns'); // Ensure this utility exists and is correct
const AppError = require('../utils/appError');   // Ensure this utility exists and is correct

exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Owner should see all users with relevant details
  // Exclude sensitive information like password hashes even if not selected by default
  const users = await User.find().select('fullName email phone role joinDate idProofSubmitted idProofApproved');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.assignRole = catchAsync(async (req, res, next) => {
  const { userId } = req.params; // User whose role is to be changed
  const { role: newRole } = req.body; // New role to assign

  if (!['user', 'admin', 'owner'].includes(newRole)) {
    return next(new AppError('Invalid role specified. Must be user, admin, or owner.', 400));
  }

  const userToUpdate = await User.findById(userId);
  if (!userToUpdate) {
    return next(new AppError('No user found with that ID to update role.', 404));
  }

  // Prevent owner from changing their own role if they are the only owner and trying to demote
  if (req.user.id === userId && userToUpdate.role === 'owner' && newRole !== 'owner') {
    const ownerCount = await User.countDocuments({ role: 'owner' });
    if (ownerCount <= 1) {
      return next(new AppError('You are the only owner. To change your role, please assign another user as owner first.', 403));
    }
  }
  
  // If assigning 'owner' role to someone else
  if (newRole === 'owner' && userToUpdate.role !== 'owner') {
    const existingOwner = await User.findOne({ role: 'owner' });
    // If an owner exists and it's not the user being promoted (which is already handled if they were an owner)
    // and it's not the current logged-in owner trying to make someone else an owner (which is fine)
    // This logic is to prevent having two owners unless the current owner is making the change.
    // A simpler rule is: only one owner can exist. If promoting someone to owner, ensure no other owner exists.
    if (existingOwner && existingOwner._id.toString() !== userId) {
        return next(new AppError('An owner already exists. Demote the current owner before assigning a new one.', 400));
    }
  }

  userToUpdate.role = newRole;
  await userToUpdate.save({ validateBeforeSave: false }); // Save, skip full validation if only role changes

  res.status(200).json({
    status: 'success',
    message: `User ${userToUpdate.fullName}'s role updated to ${newRole}.`,
    data: {
      user: userToUpdate, // Send back the updated user
    },
  });
});
