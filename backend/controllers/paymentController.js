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

    // Check if loan is already paid off
    if (customer.tenure <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Loan is already fully paid off'
      });
    }

    const paymentAmount = parseFloat(payment_amount);
    const emiDue = parseFloat(customer.emi_due);
    
    // Get current remaining_emi - if null/undefined/0, it means full EMI is due
    let remainingEmi = customer.remaining_emi != null && customer.remaining_emi !== undefined && parseFloat(customer.remaining_emi) > 0
      ? parseFloat(customer.remaining_emi)
      : emiDue; // Default to full EMI if null/undefined/0
    
    console.log('Payment calculation:', {
      account_number,
      paymentAmount,
      current_remaining_emi: customer.remaining_emi,
      calculated_remaining_emi: remainingEmi,
      emi_due: emiDue
    });
    
    let newTenure = parseInt(customer.tenure);
    let monthsPaid = 0;
    let message = '';

    // Smart payment logic
    if (paymentAmount < remainingEmi) {
      // Case 1: Payment is less than remaining EMI - deduct from current month
      remainingEmi = remainingEmi - paymentAmount;
      monthsPaid = 0;
      message = `Payment of ₹${paymentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} applied. Remaining EMI for current month: ₹${remainingEmi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      console.log(`Case 1: Partial payment. New remaining_emi: ${remainingEmi}`);
    } else if (Math.abs(paymentAmount - remainingEmi) < 0.01) {
      // Case 2: Payment equals remaining EMI (with small tolerance for floating point) - complete current month, move to next
      remainingEmi = emiDue; // Next month's full EMI
      newTenure = Math.max(0, newTenure - 1);
      monthsPaid = 1;
      message = `Payment of ₹${paymentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} completed current month. ${newTenure > 0 ? `Remaining tenure: ${newTenure} months. Next EMI due: ₹${remainingEmi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Loan fully paid off!'}`;
      console.log(`Case 2: Full payment. New remaining_emi: ${remainingEmi} (next month's EMI)`);
    } else {
      // Case 3: Payment is greater than remaining EMI - apply excess to next months
      let excess = paymentAmount - remainingEmi;
      monthsPaid = 1; // Current month is paid
      newTenure = Math.max(0, newTenure - 1);

      // Apply excess to next months
      while (excess > 0 && newTenure > 0) {
        if (excess >= emiDue) {
          // Can pay off another full month
          excess = excess - emiDue;
          newTenure = Math.max(0, newTenure - 1);
          monthsPaid++;
        } else {
          // Partial payment for next month
          remainingEmi = emiDue - excess;
          excess = 0;
        }
      }

      if (newTenure === 0) {
        remainingEmi = 0;
        message = `Payment of ₹${paymentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} completed ${monthsPaid} month(s). Loan fully paid off!`;
        console.log(`Case 3a: Loan paid off. remaining_emi: ${remainingEmi}`);
      } else if (excess > 0) {
        // More payment than needed - refund scenario (or keep as credit)
        remainingEmi = emiDue; // Next month's full EMI
        message = `Payment of ₹${paymentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} completed ${monthsPaid} month(s). Excess amount: ₹${excess.toLocaleString('en-IN', { minimumFractionDigits: 2 })}. Remaining tenure: ${newTenure} months. Next EMI due: ₹${emiDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        console.log(`Case 3b: Excess payment. remaining_emi: ${remainingEmi}`);
      } else {
        message = `Payment of ₹${paymentAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} completed ${monthsPaid} month(s). Remaining tenure: ${newTenure} months. Remaining EMI for next month: ₹${remainingEmi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        console.log(`Case 3c: Partial next month. remaining_emi: ${remainingEmi}`);
      }
    }
    
    console.log('Final values before update:', { remainingEmi, newTenure });

    // Update customer's remaining_emi and tenure
    console.log('Updating customer:', { customerId: customer.id, remainingEmi, newTenure });
    const updatedCustomer = await Customer.updateRemainingEmiAndTenure(
      customer.id,
      remainingEmi,
      newTenure
    );
    console.log('Updated customer:', { 
      account_number: updatedCustomer.account_number,
      remaining_emi: updatedCustomer.remaining_emi,
      tenure: updatedCustomer.tenure
    });

    // Create payment record
    const payment = await Payment.create({
      customerId: customer.id,
      paymentAmount: paymentAmount,
      status: 'completed'
    });

    res.status(201).json({
      success: true,
      message: message,
      data: {
        payment_id: payment.id,
        account_number: account_number,
        payment_amount: payment.payment_amount,
        payment_date: payment.payment_date,
        status: payment.status,
        months_paid: monthsPaid,
        remaining_emi: remainingEmi,
        remaining_tenure: newTenure,
        next_emi_due: newTenure > 0 ? remainingEmi : 0
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

