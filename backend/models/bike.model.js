const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: [true, 'Bike model is required'],
      trim: true,
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour is required'],
      min: 0,
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: 0,
    },
    location: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required'],
      },
    },
    availability: {
      type: Boolean,
      default: true,
    },
    images: [
      {
        type: String,
        required: [true, 'At least one image is required'],
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['sports', 'cruiser', 'commuter', 'scooter', 'electric'],
      required: [true, 'Bike category is required'],
    },
    features: [String],
    engineCapacity: {
      type: Number,
      required: function() {
        return this.category !== 'electric';
      },
    },
    batteryRange: {
      type: Number,
      required: function() {
        return this.category === 'electric';
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
bikeSchema.index({ location: '2dsphere' });

// Create index for commonly queried fields
bikeSchema.index({ availability: 1 });
bikeSchema.index({ category: 1 });

const Bike = mongoose.model('Bike', bikeSchema);

module.exports = Bike;