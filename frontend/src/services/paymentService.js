import api from '../config/api';

export const createPayment = async (accountNumber, paymentAmount) => {
  try {
    const response = await api.post('/payments', {
      account_number: accountNumber,
      payment_amount: paymentAmount,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to process payment' };
  }
};

export const getPaymentHistory = async (accountNumber) => {
  try {
    const response = await api.get(`/payments/${accountNumber}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch payment history' };
  }
};

