const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'deposit', // Money added by user
        'withdrawal', // Money withdrawn by user (future feature)
        'booking_payment', // Payment made for a booking
        'booking_security_deduction', // Security deposit held/deducted
        'booking_security_refund', // Security deposit returned
        'cancellation_fee',
        'other_credit', //  e.g. promotions
        'other_debit' // e.g. fines
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    booking: { // Link to booking if transaction is related to one
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    status: { // Status of the transaction itself
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'completed',
    },
    paymentId: { // External payment gateway ID (e.g., Razorpay) for deposits
      type: String,
    },
    description: { // Optional description
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const WalletTransaction = mongoose.model(
  'WalletTransaction',
  walletTransactionSchema
);

module.exports = WalletTransaction;