const express = require('express');
const router = express.Router();
const { loginAdmin, getPayments, verifyPayment, rejectPayment, deletePayment } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);

router.use(protect);

router.route('/payments').get(getPayments);
router.patch('/payments/:id/verify', verifyPayment);
router.patch('/payments/:id/reject', rejectPayment);
router.delete('/payments/:id', deletePayment);

module.exports = router;
