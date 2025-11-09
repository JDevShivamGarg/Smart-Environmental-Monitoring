import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';

const apiService = {
  get: async (endpoint) => {
    try {
      const response = await axios.get(`${API_URL}/${endpoint}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  },
};

export default apiService;
