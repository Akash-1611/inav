const express = require('express');
const router = express.Router();
const { createPayment, getPaymentHistory } = require('../controllers/paymentController');

router.post('/', createPayment);
router.get('/:account_number', getPaymentHistory);

module.exports = router;

