import axios from 'axios';

// Base Django backend URL
export const API_BASE_URL = 'http://127.0.0.1:8000/api';

const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchHotspots = async () => {
    try {
        const response = await apiService.get('/hotspots/');
        return response.data;
    } catch (error) {
        console.error("Error fetching Hotspots from API. Using fallback data.", error);
        return null;
    }
};

export const submitAccidentReport = async (reportData) => {
    try {
        const response = await apiService.post('/reports/', reportData);
        return response.data;
    } catch (error) {
        console.error("Error submitting accident report.", error);
        return null;
    }
};

export const fetchAnalyticsSummary = async () => {
    try {
        const response = await apiService.get('/analytics/summary/');
        return response.data;
    } catch (error) {
        console.error("Error fetching analytics summary.", error);
        return null;
    }
};

export default apiService;
