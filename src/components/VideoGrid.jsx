import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchFromAPI } from '../utils/fetchFromAPI';
import VideoCard from './VideoCard';

const VideoGrid = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useParams();

  useEffect(() => {
    setLoading(true);
    const query = searchTerm ? searchTerm : 'new';
    
    // Use the string format that was working for your mock data logic
    fetchFromAPI(`search?q=${query}&type=video`)
      .then((data) => {
        setVideos(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search Error:", err);
        setLoading(false);
      });
  }, [searchTerm]);

  if (loading) return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="bg-[#0f0f0f] min-h-screen p-4">
      {/* Shows the search title only if a search was performed */}
      {searchTerm && (
        <h2 className="text-white text-xl font-bold mb-4">
          Results for: <span className="text-red-600">{searchTerm}</span>
        </h2>
      )}

      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((item, idx) => (
            <VideoCard 
              key={item.id?.videoId || item.id || idx} 
              video={item} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
          <p className="text-lg">No videos found for "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default VideoGrid;