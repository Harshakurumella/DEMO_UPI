const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    default: 1
  },
  currency: {
    type: String,
    default: "INR"
  },
  upiId: String,
  upiLink: String,
  utrNumber: String,
  status: {
    type: String,
    enum: ["pending", "submitted", "verified", "rejected"],
    default: "pending"
  },
  adminNote: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: Date
});

module.exports = mongoose.model('Payment', paymentSchema);
