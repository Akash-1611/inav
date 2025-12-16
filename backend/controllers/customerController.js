const Customer = require('../models/Customer');

const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    
    // Ensure remaining_emi is included and properly formatted
    // Convert DECIMAL strings to numbers for proper JSON serialization
    const formattedCustomers = customers.map(customer => {
      const emiDue = parseFloat(customer.emi_due);
      // Get remaining_emi - if null/undefined, default to emi_due (full EMI due)
      // If 0, it means current month paid, so next month's full EMI (emi_due) is due
      const remainingEmiRaw = customer.remaining_emi != null && customer.remaining_emi !== undefined
        ? parseFloat(customer.remaining_emi)
        : emiDue;
      
      // Return the actual remaining_emi value (frontend will handle display)
      // If it's 0 or equal to emi_due, frontend shows "EMI Due"
      // If it's less than emi_due, frontend shows "Remaining EMI"
      return {
        ...customer,
        remaining_emi: remainingEmiRaw === 0 ? emiDue : remainingEmiRaw,
        emi_due: emiDue,
        tenure: parseInt(customer.tenure),
        interest_rate: parseFloat(customer.interest_rate)
      };
    });
    
    console.log('Returning customers with remaining_emi:', formattedCustomers.map(c => ({
      account: c.account_number,
      emi_due: c.emi_due,
      remaining_emi: c.remaining_emi
    })));
    
    res.status(200).json({
      success: true,
      data: formattedCustomers,
      count: formattedCustomers.length
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customers',
      error: error.message
    });
  }
};

module.exports = {
  getAllCustomers
};

