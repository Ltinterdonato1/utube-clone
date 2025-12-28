import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchFromAPI } from '../utils/fetchFromAPI';
import VideoCard from './VideoCard';

const SearchFeed = () => {
  const [videos, setVideos] = useState([]);
  const { searchTerm } = useParams();

  useEffect(() => {
    // This calls your updated fetchFromAPI with the filtering logic
    fetchFromAPI('search', { q: searchTerm })
      .then((data) => setVideos(data.items || []));
  }, [searchTerm]);

  return (
    <div className="p-4 overflow-y-auto h-[90vh] bg-black">
      <h2 className="text-white text-2xl font-bold mb-6">
        Search Results for: <span className="text-[#F31503]">{searchTerm}</span>
      </h2>
      
      {videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((item) => (
            <VideoCard key={item.id.videoId} video={item} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No videos found for "{searchTerm}".</p>
      )}
    </div>
  );
};

export default SearchFeed;