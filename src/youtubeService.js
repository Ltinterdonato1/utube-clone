import axios from 'axios';
import mockData from './mockData.json'; // Make sure you created this file too!

const API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// TOGGLE THIS: true = uses your local file, false = calls Google
const USE_MOCK = true; 

export const fetchSearchResults = async (query) => {
  if (USE_MOCK) {
    console.log("🚀 Running in Mock Mode - No quota used");
    return mockData.search.items; 
  }

  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 10,
        q: query,
        key: API_KEY,
        type: 'video'
      }
    });
    return response.data.items;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return [];
  }
};