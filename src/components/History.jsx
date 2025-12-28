import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { MdDeleteOutline, MdHistory } from 'react-icons/md';

const History = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data().history || [];
          // Reverse so most recent is at the top
          setHistoryList([...data].reverse()); 
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const removeFromHistory = async (videoItem) => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        history: arrayRemove(videoItem)
      });
      // Filter out using the specific timestamp to ensure the correct one is removed
      setHistoryList((prev) => prev.filter((item) => item.watchedAt !== videoItem.watchedAt));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const clearAllHistory = async () => {
    if (!auth.currentUser) return;
    if (window.confirm("Are you sure you want to clear your entire watch history?")) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { history: [] });
        setHistoryList([]);
      } catch (error) {
        console.error("Error clearing history:", error);
      }
    }
  };

  if (loading) return <div className="p-8 text-white bg-[#0f0f0f] min-h-screen">Loading History...</div>;

  return (
    <div className="p-4 md:p-8 bg-[#0f0f0f] min-h-screen text-white">
      <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MdHistory /> Watch History
        </h2>
        {historyList.length > 0 && (
          <button 
            onClick={clearAllHistory}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2 px-4 py-2 hover:bg-[#272727] rounded-full"
          >
            <MdDeleteOutline size={20} />
            Clear all watch history
          </button>
        )}
      </div>

      {historyList.length === 0 ? (
        <div className="flex flex-col items-center mt-20 text-gray-400">
          <MdHistory size={80} className="mb-4 opacity-20" />
          <p>This list has no videos.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          {historyList.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex items-center justify-between group hover:bg-[#272727] p-2 rounded-xl transition-all">
              <Link to={`/video/${item.id}`} className="flex gap-4 flex-1">
                <div className="relative w-40 md:w-52 flex-shrink-0">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    className="aspect-video object-cover rounded-lg shadow-lg"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-sm md:text-base line-clamp-2 mb-1">{item.title}</h3>
                  <p className="text-gray-400 text-xs">
                    {/* Fixed date rendering from string to Locale String */}
                    Watched on: {item.watchedAt ? new Date(item.watchedAt).toLocaleDateString() : 'Unknown date'}
                  </p>
                </div>
              </Link>
              
              <button 
                onClick={() => removeFromHistory(item)}
                className="p-2 md:opacity-0 group-hover:opacity-100 hover:bg-[#3f3f3f] rounded-full transition-all ml-2"
                title="Remove from history"
              >
                <MdDeleteOutline size={24} className="text-gray-400 hover:text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;