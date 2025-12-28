import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from '@mui/icons-material';
import { fetchFromAPI } from '../utils/fetchFromAPI';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const snippet = video?.snippet;

  const videoId = video?.id?.videoId || video?.id || video?.contentDetails?.upload?.videoId;
  const [channelIcon, setChannelIcon] = useState(null);

  // HELPER: Converts date strings to "Time Ago" format
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + (interval === 1 ? " year ago" : " years ago");
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + (interval === 1 ? " month ago" : " months ago");
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + (interval === 1 ? " minute ago" : " minutes ago");
    
    return "Just now";
  };

  useEffect(() => {
    const fetchChannelDetails = async () => {
      if (!snippet?.channelId) return;
      try {
        const data = await fetchFromAPI('channels', {
          id: snippet.channelId,
          part: 'snippet'
        });
        const targetChannel = data?.items?.find(item => item.id === snippet.channelId);
        setChannelIcon(targetChannel?.snippet?.thumbnails?.default?.url || data?.items?.[0]?.snippet?.thumbnails?.default?.url);
      } catch (error) {
        console.error("Error fetching channel icon:", error);
      }
    };
    fetchChannelDetails();
  }, [snippet?.channelId]);

  if (!snippet) return null;

  const handleVideoClick = () => {
    window.scrollTo(0, 0);
    if (videoId) navigate(`/video/${videoId}`);
  };

  return (
    <div className="flex flex-col gap-2 w-full mb-5 group">
      <div 
        onClick={handleVideoClick}
        className="relative aspect-video overflow-hidden rounded-xl bg-[#272727] cursor-pointer"
      >
        <img 
          src={snippet?.thumbnails?.high?.url || snippet?.thumbnails?.medium?.url} 
          alt={snippet?.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      <div className="flex gap-3 px-1 mt-2">
        <Link to={`/channel/${snippet?.channelId}`} className="flex-shrink-0">
          {channelIcon ? (
            <img src={channelIcon} alt="" className="h-9 w-9 rounded-full object-cover border border-[#303030]" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-[#272727] animate-pulse" />
          )}
        </Link>

        <div className="flex flex-col overflow-hidden text-left">
          <h3 
            onClick={handleVideoClick}
            className="text-sm font-semibold text-white line-clamp-2 leading-tight cursor-pointer"
          >
            {snippet?.title}
          </h3>
          
          <Link to={`/channel/${snippet?.channelId}`}>
            <div className="text-xs text-gray-400 mt-1 flex items-center hover:text-white">
              <span className="truncate max-w-[150px]">{snippet?.channelTitle}</span>
              <CheckCircle sx={{ fontSize: '12px', color: 'gray', ml: '4px' }} />
            </div>
          </Link>
          
          {/* UPDATED: Displays dynamic time ago instead of static string */}
          <p className="text-[11px] text-gray-500 mt-0.5">
            {getTimeAgo(snippet?.publishedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;