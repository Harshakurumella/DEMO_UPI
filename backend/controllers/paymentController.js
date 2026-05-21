const Payment = require('../models/Payment');

const initiatePayment = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, amount = 1 } = req.body;

    const orderId = "ORD-" + Date.now();
    const upiId = process.env.UPI_ID;
    const upiName = process.env.UPI_NAME;
    
    const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount}&cu=INR&tn=${orderId}`;

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

module.exports = { initiatePayment, submitUtr, getPaymentStatus };
