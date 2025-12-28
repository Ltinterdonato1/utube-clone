import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchFromAPI } from '../utils/fetchFromAPI';
import { db, auth } from '../firebase';
import { doc, setDoc, arrayUnion, arrayRemove, updateDoc, getDoc } from 'firebase/firestore';
import { CheckCircle } from '@mui/icons-material';
import VideoCard from './VideoCard';

const VideoDetail = () => {
  const [videoDetail, setVideoDetail] = useState(null);
  const [channelIcon, setChannelIcon] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [inLibrary, setInLibrary] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { id } = useParams();

  const getPlayableId = (currentId) => {
    const mockMap = {
      'm1': 'v4H2fTgHGuc', 'm4': '676H0Y8uPuw', 'm5': 'M8uF63T8Ouw', 
      'm7': 'JkUsd6n04z0', 'm9': '-f2ql_aGIbs', 'm11': 'y8OnoxKotPQ', 
      'm13': '8X2kIfS6fb8', 'm14': 'J6S9_L0E7k0', 'm16': 'W6NZfCO5SIk', 
      'm19': 'n2FljKioV_w', 'm22': 'wm5gMKuwSYk', 'm24': 'k32voqQhHiE', 
      'm26': 'hw3Bx5vxKl0', 'm28': 'Mh_vL-P_6bY', 'm29': '0-S5a0eXPoc', 
      'm31': '5C_HPTJg5ek', 'm34': '7mS9u19XFqE', 'm35': 'p8uIn8mP_2A', 
      'm37': 'fH796fjv_l0', 'm39': 'LlvBzyy-558', 'm41': 'PziY97OPh7I', 
      'm43': '1S2Vv8uXp-E', 'm44': '3HNyXCPDQ7Q', 'm46': 'F98T-2B8Sfs', 
      'm49': 'Yp5S3rV6v6U', 'm50': 'Yp5S3rV6v6U',
      'm2': 'Zq0cZnA2Dhc', 'm10': 'jfKfPfyJRdk', 'm17': '7O8K5zJvSio', 
      'm25': '4NRXx6U8ABQ', 'm32': 'IluRBvnYMoY', 'm40': '5qap5aO4i9A', 
      'm47': 'bpOSxM0rNPM', 
      'm3': 'msgCsroaRV8', 'm8': 'GApY_S-5_3s', 'm12': 'K_03kFqWfqs', 
      'm18': 'p8uIn8mP_2A', 'm23': '26C9OEGMMQw', 'm27': 'QDBf0K-T_bQ', 
      'm33': 'eaW0tYpxn0k', 'm38': '8X2kIfS6fb8', 'm42': 'uX8p_NfP-zY', 
      'm48': 'Z3_6Uo6v7Xw', 
      'm6': 'DLNb-s9wsi8', 'm15': 'qHpK_kAQlvI', 'm21': 'S_vWwT9Lp-k', 
      'm30': '6S0L4L27854', 'm36': '1p_M9Nf8R_w', 'm45': '9MvU6-S-y-8', 
      'm51': 'T_O807j18o0', 'm52': 'I_v_vA9Y-wY', 'm53': '0-S5a0eXPoc'
    };
    return mockMap[currentId] || (currentId?.startsWith('m') ? 'dQw4w9WgXcQ' : currentId);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchFullDetails = async () => {
      try {
        // Use the search endpoint if it's a mock ID, as 'videos?id=' might fail for custom strings
        const data = await fetchFromAPI(`videos?id=${id}`);
        let video = data?.items?.find(item => (item.id?.videoId || item.id) === id);

        // Fallback for mock data handling if the first call returns empty
        if (!video) {
          const searchFallback = await fetchFromAPI(`search?q=${id}`);
          video = searchFallback?.items?.find(item => (item.id?.videoId || item.id) === id);
        }

        if (video && isMounted) {
          setVideoDetail(video);
          const channelId = video.snippet.channelId;
          
          const [channelData, relatedData] = await Promise.all([
            channelId ? fetchFromAPI('channels', { id: channelId }) : null,
            fetchFromAPI(`search?relatedToVideoId=${id}`)
          ]);

          if (channelData && isMounted) {
            const channel = channelData?.items?.find(c => c.id === channelId);
            setChannelIcon(channel?.snippet?.thumbnails?.default?.url);
          }
          
          if (isMounted) {
            setRelatedVideos(relatedData.items?.filter(item => (item.id?.videoId || item.id) !== id) || []);
          }

          if (auth.currentUser && isMounted) {
            checkUserStatus(channelId);
            updateWatchHistory(video);
          }
        } else if (isMounted) {
          setVideoDetail({ error: true });
        }
      } catch (err) {
        if (isMounted) setVideoDetail({ error: true });
      }
    };

    fetchFullDetails();
    window.scrollTo(0, 0);
    return () => { isMounted = false; };
  }, [id]);

  const updateWatchHistory = async (video) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    let currentHistory = userSnap.exists() ? userSnap.data().history || [] : [];
    const filteredHistory = currentHistory.filter(item => item.id !== id);
    
    await setDoc(userRef, {
      history: [
        {
          id,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.high.url,
          watchedAt: new Date().toISOString()
        },
        ...filteredHistory
      ].slice(0, 50) 
    }, { merge: true });
  };

  const checkUserStatus = async (channelId) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      setIsSubscribed(userData.subscriptions?.includes(channelId) || false);
      setInLibrary(userData.library?.some(item => item.id === id) || false);
    }
  };

  const handleSubscribe = async () => {
    if (!auth.currentUser || updatingStatus) return;
    setUpdatingStatus(true);
    const userRef = doc(db, 'users', auth.currentUser.uid);
    try {
      if (isSubscribed) {
        await updateDoc(userRef, { subscriptions: arrayRemove(videoDetail.snippet.channelId) });
      } else {
        await updateDoc(userRef, { subscriptions: arrayUnion(videoDetail.snippet.channelId) });
      }
      setIsSubscribed(!isSubscribed);
    } catch (err) { console.error(err); }
    setUpdatingStatus(false);
  };

  const toggleLibrary = async () => {
    if (!auth.currentUser || updatingStatus) return;
    setUpdatingStatus(true);
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const videoData = { 
      id, 
      title: videoDetail.snippet.title, 
      thumbnail: videoDetail.snippet.thumbnails.high.url 
    };

    try {
      if (inLibrary) {
        const docSnap = await getDoc(userRef);
        const itemToRemove = docSnap.data()?.library?.find(item => item.id === id);
        if (itemToRemove) await updateDoc(userRef, { library: arrayRemove(itemToRemove) });
      } else {
        await updateDoc(userRef, { library: arrayUnion(videoData) });
      }
      setInLibrary(!inLibrary);
    } catch (err) { console.error(err); }
    setUpdatingStatus(false);
  };

  if (!videoDetail) {
    return (
      <div className="bg-[#0f0f0f] min-h-screen flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-500 mr-4"></div>
        <p className="text-xl font-bold">Loading Video...</p>
      </div>
    );
  }

  if (videoDetail.error) {
    return (
      <div className="p-20 text-white text-center bg-[#0f0f0f] min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold mb-4">Video Not Found</h2>
        <button onClick={() => window.history.back()} className="mt-8 px-6 py-2 bg-red-600 rounded-full hover:bg-red-700 transition">Go Back</button>
      </div>
    );
  }

  const { snippet: { title, channelTitle, description } } = videoDetail;

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white">
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-8 max-w-[1700px] mx-auto">
        <div className="flex-1">
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-2xl">
            <iframe
              width="100%" 
              height="100%"
              src={`https://www.youtube-nocookie.com/embed/${getPlayableId(id)}?autoplay=1&origin=${window.location.origin}`}
              title={title} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            />
          </div>

          <div className="mt-6">
            <h1 className="text-2xl font-bold line-clamp-2">{title}</h1>
            <div className="flex justify-between items-center mt-4 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <img src={channelIcon || ""} className="h-10 w-10 rounded-full bg-gray-800 object-cover border border-[#3f3f3f]" alt="" />
                <div>
                  <p className="font-bold flex items-center gap-1">{channelTitle}<CheckCircle sx={{ fontSize: '14px', color: '#aaa' }} /></p>
                  <span className="text-xs text-gray-400">Official Channel</span>
                </div>
                <button 
                  onClick={handleSubscribe} 
                  disabled={updatingStatus}
                  className={`ml-4 px-6 py-2 rounded-full font-medium text-sm transition ${isSubscribed ? 'bg-[#3f3f3f] text-white hover:bg-[#4f4f4f]' : 'bg-white text-black hover:bg-gray-200'} ${updatingStatus ? 'opacity-50' : ''}`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>
              <button 
                onClick={toggleLibrary} 
                disabled={updatingStatus}
                className={`px-5 py-2 rounded-full text-sm font-medium transition flex items-center gap-2 ${inLibrary ? 'bg-[#3f3f3f] text-blue-400' : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'} ${updatingStatus ? 'opacity-50' : ''}`}
              >
                {inLibrary ? '✓ In Library' : '+ Save to Library'}
              </button>
            </div>
            <div className="mt-6 p-4 bg-[#272727] rounded-xl">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-200 line-clamp-4 hover:line-clamp-none cursor-pointer">
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="lg:w-[400px]">
          <h2 className="font-bold mb-4 text-xl px-1">Up Next</h2>
          <div className="flex flex-col gap-4">
            {relatedVideos.map((video, idx) => (
              <VideoCard key={idx} video={video} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;