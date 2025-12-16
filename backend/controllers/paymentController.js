const Payment = require('../models/Payment');
const Customer = require('../models/Customer');

const createPayment = async (req, res) => {
  try {
    const { account_number, payment_amount } = req.body;

    // Validate input
    if (!account_number || !payment_amount) {
      return res.status(400).json({
        success: false,
        message: 'Account number and payment amount are required'
      });
    }

    if (isNaN(payment_amount) || parseFloat(payment_amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount must be a positive number'
      });
    }

    // Find customer by account number
    const customer = await Customer.findByAccountNumber(account_number);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found with the provided account number'
      });
    }

    // Create payment
    const payment = await Payment.create({
      customerId: customer.id,
      paymentAmount: parseFloat(payment_amount),
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment_id: payment.id,
        account_number: account_number,
        payment_amount: payment.payment_amount,
        payment_date: payment.payment_date,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing payment',
      error: error.message
    });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const { account_number } = req.params;

    if (!account_number) {
      return res.status(400).json({
        success: false,
        message: 'Account number is required'
      });
    }

    // Verify customer exists
    const customer = await Customer.findByAccountNumber(account_number);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found with the provided account number'
      });
    }

    // Get payment history
    const payments = await Payment.findByAccountNumber(account_number);

    res.status(200).json({
      success: true,
      data: {
        account_number: account_number,
        customer_details: {
          account_number: customer.account_number,
          issue_date: customer.issue_date,
          interest_rate: customer.interest_rate,
          tenure: customer.tenure,
          emi_due: customer.emi_due
        },
        payment_history: payments,
        total_payments: payments.length
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message
    });
  }
};

module.exports = {
  createPayment,
  getPaymentHistory
};

