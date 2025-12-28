import axios from 'axios';
import mockData from '../mocks/mockData.json';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const FETCH_MODE = 'auto'; 

export const fetchFromAPI = async (url, customParams = {}) => {
  if (FETCH_MODE === 'mock') {
    return getMockResponse(url, customParams);
  }

  try {
    const { data } = await axios.get(`${BASE_URL}/${url}`, {
      params: {
        key: import.meta.env.VITE_YOUTUBE_API_KEY,
        part: 'snippet',
        ...customParams,
      }
    });
    return data;
  } catch (error) {
    if (error.response?.status === 403 || !import.meta.env.VITE_YOUTUBE_API_KEY) {
      console.warn("⚠️ API Issue: Switching to local mock data.");
      return getMockResponse(url, customParams);
    }
    throw error;
  }
};

const getMockResponse = (url, params = {}) => {
  const cleanUrl = url.split('?')[0];

  // 1. Handle Video Details
  if (cleanUrl.includes('videos')) {
    const videoId = params?.id;
    if (videoId) {
      const video = mockData.search.items.find(item => 
        (item.id?.videoId || item.id) === videoId
      );
      return { items: video ? [video] : [] };
    }
    return mockData.search;
  }

  // 2. Handle Channel Details (Updated to handle multiple IDs for Subscriptions)
  if (cleanUrl.includes('channels')) {
    const channelIdParam = params?.id || '';
    // Split by comma in case Subscriptions.jsx sends "m1,m2,m3"
    const channelIds = channelIdParam.split(',');
    
    const filteredChannels = mockData.channels.items.filter(c => 
      channelIds.includes(c.id)
    );

    return { items: filteredChannels.length > 0 ? filteredChannels : [] };
  }

  // 3. Handle Activities (Added to support the Subscriptions Feed)
  if (cleanUrl.includes('activities')) {
    const channelId = params?.channelId;
    // Find all videos in mockData belonging to this channel
    const channelVideos = mockData.search.items.filter(item => 
      item.snippet.channelId === channelId
    );

    // Map them to look like YouTube "Activity" objects
    return {
      items: channelVideos.map(video => ({
        snippet: { 
          ...video.snippet, 
          type: 'upload' // Subscriptions.jsx filters for 'upload'
        },
        contentDetails: { 
          upload: { videoId: video.id?.videoId || video.id } 
        }
      }))
    };
  }

  // 4. Handle Search & Related Videos
  if (cleanUrl.includes('search')) {
    if (params.relatedToVideoId) {
      const related = mockData.search.items.filter(item => 
        (item.id?.videoId || item.id) !== params.relatedToVideoId
      );
      return { items: related };
    }

    const query = params?.q?.toLowerCase() || '';
    if (query) {
      const filtered = mockData.search.items.filter(item => 
        item.snippet.title.toLowerCase().includes(query) || 
        item.snippet.channelTitle.toLowerCase().includes(query)
      );
      return { ...mockData.search, items: filtered };
    }
    
    return mockData.search;
  }

  // 5. Default fallbacks
  if (cleanUrl.includes('subscriptions')) return mockData.subscriptions;

  return { items: [] };
};