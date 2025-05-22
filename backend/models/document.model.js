const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uri: {
      type: String,
      required: [true, 'Document URI is required'],
    },
    type: {
      type: String,
      enum: ['idCard', 'drivingLicense', 'passport'],
      required: [true, 'Document type is required'],
    },
    side: {
      type: String,
      enum: ['front', 'back', 'both'],
      required: [true, 'Document side is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
documentSchema.index({ userId: 1 });
documentSchema.index({ status: 1 });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;