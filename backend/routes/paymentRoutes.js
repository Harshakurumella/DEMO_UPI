const express = require('express');
const router = express.Router();
const { initiatePayment, submitUtr, getPaymentStatus } = require('../controllers/paymentController');

router.post('/initiate', initiatePayment);
router.post('/submit-utr', submitUtr);
router.get('/status/:orderId', getPaymentStatus);

module.exports = router;
