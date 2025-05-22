const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Good for not sending it by default
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'owner'],
      default: 'user',
    },
    location: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
      },
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
      },
    ],
    joinDate: {
      type: Date,
      default: Date.now,
    },
    // New/Updated fields:
    walletBalance: {
      type: Number,
      default: 0,
    },
    idProofSubmitted: { // Tracks if a user has submitted any document
      type: Boolean,
      default: false,
    },
    idProofApproved: { // Tracks if the submitted ID is approved by an owner
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
    // Ensure virtuals are included when converting to JSON/Object if you plan to send them to frontend
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create geospatial index for location
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Ensure 'this.password' is available. If select: false is causing issues here for login,
  // you might need to explicitly select it in the query: User.findOne({email}).select('+password')
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual property to check if user's documents are verified
// This virtual is still useful for a quick check if you have populated documents.
// However, the idProofApproved field provides a more direct status.
userSchema.virtual('isDocumentVerified').get(function () {
  if (!this.documents || this.documents.length === 0) return false;
  // Check if there's at least one approved document of a required type
  return this.documents.some(doc => doc.status === 'approved');
});


const User = mongoose.model('User', userSchema);

module.exports = User;