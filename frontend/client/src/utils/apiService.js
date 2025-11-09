import axios from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:8000';

const apiService = {
  get: async (endpoint) => {
    try {
      const response = await axios.get(`${API_URL}/api/${endpoint}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  },
};

export default apiService;
