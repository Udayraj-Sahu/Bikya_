const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bikeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bike',
      required: true,
    },
    duration: {
      type: Number, // Duration in hours
      required: [true, 'Booking duration is required'],
      min: 1,
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentId: {
      type: String,
      default: null,
    },
    orderId: {
      type: String,
      default: null,
    },
    pickupLocation: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Pickup location coordinates are required'],
      },
      address: {
        type: String,
        required: [true, 'Pickup address is required'],
      },
    },
    dropoffLocation: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Dropoff location coordinates are required'],
      },
      address: {
        type: String,
        required: [true, 'Dropoff address is required'],
      },
    },
    cancelReason: {
      type: String,
      default: null,
    },
    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      comment: {
        type: String,
        default: null,
      },
      createdAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for commonly queried fields
bookingSchema.index({ userId: 1 });
bookingSchema.index({ bikeId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ startTime: 1 });
bookingSchema.index({ endTime: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;