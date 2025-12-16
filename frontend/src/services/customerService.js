import api from '../config/api';

export const getCustomers = async () => {
  try {
    const response = await api.get('/customers');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch customers' };
  }
};

