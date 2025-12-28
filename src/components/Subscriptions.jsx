import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { fetchFromAPI } from '../utils/fetchFromAPI';
import { onAuthStateChanged } from 'firebase/auth';
import VideoCard from './VideoCard';
import { MdUnsubscribe, MdRefresh, MdSubscriptions, MdWarning } from 'react-icons/md';

const Subscriptions = () => {
  const [videos, setVideos] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quotaError, setQuotaError] = useState(false);
  const [user, setUser] = useState(null);

  const fetchContent = useCallback(async (uid) => {
    if (!uid) return;
    setLoading(true);
    setQuotaError(false);

    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const channelIds = docSnap.data().subscriptions || [];
        
        if (channelIds.length === 0) {
          setVideos([]);
          setChannels([]);
          setLoading(false);
          return;
        }

        // 1. Fetch Channels for the top bar (Cost: 1 unit)
        const channelData = await fetchFromAPI('channels', { 
          id: channelIds.join(','),
          part: 'snippet' 
        });
        setChannels(channelData?.items || []);

        // 2. Optimized Video Fetch: Using 'activities' instead of 'search'
        // Cost: 1 unit per channel (instead of 100)
        const activityPromises = channelIds.map(id => 
          fetchFromAPI('activities', {
            channelId: id,
            part: 'snippet,contentDetails',
            maxResults: 5
          }).catch(() => ({ items: [] }))
        );

        const results = await Promise.all(activityPromises);
        
        // Filter for actual video uploads and format them for VideoCard
        const allVideos = results
          .flatMap(res => res?.items || [])
          .filter(item => item.snippet.type === 'upload')
          .map(item => ({
            id: { videoId: item.contentDetails.upload.videoId },
            snippet: item.snippet
          }));

        setVideos(allVideos.sort((a, b) => 
          new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
        ));
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      if (error.response?.status === 403 || error.message.includes('403')) {
        setQuotaError(true);
        loadTrendingFallback();
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const loadTrendingFallback = async () => {
    try {
      const data = await fetchFromAPI('videos', {
        part: 'snippet,statistics',
        chart: 'mostPopular',
        maxResults: 20,
        regionCode: 'US'
      });
      setVideos(data.items || []);
    } catch (err) {
      console.error("Fallback failed", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) fetchContent(currentUser.uid);
      else setLoading(false);
    });
    return () => unsubscribe();
  }, [fetchContent]);

  const handleUnsubscribe = async (e, channelId) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (window.confirm("Unsubscribe from this channel?")) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { subscriptions: arrayRemove(channelId) });
        setChannels(prev => prev.filter(c => c.id !== channelId));
        setVideos(prev => prev.filter(v => v.snippet.channelId !== channelId));
      } catch (error) {
        console.error("Unsubscribe error:", error);
      }
    }
  };

  const handleRefresh = () => {
    if (user) {
      setIsRefreshing(true);
      fetchContent(user.uid);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#0f0f0f] text-white">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600 mb-4"></div>
      <p className="text-gray-400">Loading your feed...</p>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#0f0f0f] min-h-screen text-white">
      {/* Manage Subscriptions Bar */}
      {channels.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4">Manage Subscriptions</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar border-b border-gray-800">
            {channels.map((channel) => (
              <div key={channel.id} className="relative group flex flex-col items-center min-w-[80px]">
                <Link to={`/channel/${channel.id}`} className="flex flex-col items-center">
                  <img 
                    src={channel.snippet?.thumbnails?.default?.url} 
                    className="w-14 h-14 rounded-full mb-2 border border-gray-700 object-cover group-hover:border-gray-400 transition-all"
                    alt={channel.snippet?.title}
                  />
                  <p className="text-[10px] text-center line-clamp-1 w-16 text-gray-400 group-hover:text-white">
                    {channel.snippet?.title}
                  </p>
                </Link>
                <button 
                  onClick={(e) => handleUnsubscribe(e, channel.id)}
                  className="absolute top-0 right-1 bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg"
                >
                  <MdUnsubscribe size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {quotaError && (
        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg flex items-center gap-3 text-yellow-200">
          <MdWarning size={24} />
          <p className="text-sm">API Limit reached. Showing trending videos instead of your subscriptions.</p>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{quotaError ? "Trending Videos" : "Latest Videos"}</h2>
        <button onClick={handleRefresh} className="flex items-center gap-2 text-sm bg-[#272727] px-4 py-2 rounded-full hover:bg-[#3f3f3f]">
          <MdRefresh className={isRefreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
        {videos.map((video) => (
          <VideoCard key={video.id?.videoId || video.id || Math.random()} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;