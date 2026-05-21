const express = require('express');
const router = express.Router();
const { initiatePayment, submitUtr, getPaymentStatus, sendCollectRequest } = require('../controllers/paymentController');

router.post('/initiate', initiatePayment);
router.post('/submit-utr', submitUtr);
router.get('/status/:orderId', getPaymentStatus);
router.post('/collect-request', sendCollectRequest);

module.exports = router;
