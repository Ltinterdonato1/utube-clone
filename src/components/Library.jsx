import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { MdDeleteOutline, MdVideoLibrary } from 'react-icons/md';

const Library = () => {
  const [libraryList, setLibraryList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLibrary = async () => {
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setLibraryList(docSnap.data().library || []);
        }
      } catch (error) {
        console.error("Error fetching library:", error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const removeFromLibrary = async (video) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        library: arrayRemove(video)
      });
      setLibraryList((prev) => prev.filter((item) => item.id !== video.id));
    } catch (error) {
      console.error("Error removing from library:", error);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[80vh] bg-[#0f0f0f] text-white">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-red-600"></div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#0f0f0f] min-h-screen text-white">
      <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
        <MdVideoLibrary size={28} className="text-red-600" />
        <h2 className="text-2xl font-bold">Your Library</h2>
      </div>

      {libraryList.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
          <MdVideoLibrary size={80} className="mb-4 opacity-20" />
          <p className="text-lg">Your library is empty.</p>
          <Link to="/" className="mt-4 text-blue-500 hover:underline">Explore videos</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {libraryList.map((video, index) => (
            <div key={`${video.id}-${index}`} className="relative group bg-[#1a1a1a] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform">
              <Link to={`/video/${video.id}`}>
                <div className="flex flex-col gap-2">
                  <img 
                    // FIX: Use the thumbnail URL saved in Firestore
                    src={video.thumbnail || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`} 
                    alt={video.title} 
                    className="aspect-video object-cover w-full"
                    // Fallback in case the saved thumbnail fails
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/640x360?text=Video+Unavailable'; }}
                  />
                  <div className="p-3">
                    <h3 className="font-bold text-sm line-clamp-2 leading-snug">{video.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">Saved Video</p>
                  </div>
                </div>
              </Link>
              <button 
                onClick={() => removeFromLibrary(video)}
                className="absolute top-2 right-2 bg-black/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                title="Remove from Library"
              >
                <MdDeleteOutline size={20} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;