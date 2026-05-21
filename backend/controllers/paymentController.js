const Payment = require('../models/Payment');

const initiatePayment = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, amount = 1 } = req.body;

    const orderId = "ORD-" + Date.now();
    const upiId = process.env.UPI_ID;
    const upiName = process.env.UPI_NAME;
    
    const formattedAmount = Number(amount).toFixed(2);
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR&tn=${orderId}&tr=${orderId}`;

    const payment = await Payment.create({
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      amount,
      upiId,
      upiLink
    });

    res.status(201).json({
      orderId: payment.orderId,
      upiLink: payment.upiLink,
      amount: payment.amount,
      upiId: payment.upiId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const submitUtr = async (req, res) => {
  try {
    const { orderId, utrNumber } = req.body;

    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status === 'verified') {
      return res.status(400).json({ message: 'Payment already verified' });
    }

    payment.utrNumber = utrNumber;
    payment.status = 'submitted';
    
    const updatedPayment = await payment.save();

    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      orderId: payment.orderId,
      amount: payment.amount,
      utrNumber: payment.utrNumber,
      status: payment.status
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendCollectRequest = async (req, res) => {
  try {
    const { orderId, customerUpiId } = req.body;

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: "Order not found" });
    }

    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
    if (!upiRegex.test(customerUpiId)) {
      return res.status(400).json({ message: "Invalid UPI ID format" });
    }

    payment.customerUpiId = customerUpiId;
    payment.collectRequestSent = true;
    payment.collectRequestSentAt = new Date();
    payment.paymentMethod = "collect";
    await payment.save();

    res.json({
      success: true,
      message: `Payment request sent to ${customerUpiId}. Please check your UPI app and approve the ₹${payment.amount} payment.`,
      orderId,
      customerUpiId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { initiatePayment, submitUtr, getPaymentStatus, sendCollectRequest };
