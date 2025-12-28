import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import VideoGrid from './components/VideoGrid'; // Usually your Home/Feed
import VideoDetail from './components/VideoDetail';
import SearchFeed from './components/SearchFeed'; // Import your new component
import History from './components/History';
import Library from './components/Library';
import Subscriptions from './components/Subscriptions'; 

function App() {
  return (
    <BrowserRouter>
      <div className="bg-[#0f0f0f] min-h-screen text-white">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 overflow-y-auto h-[calc(100vh-56px)]">
            <Routes>
              {/* Home Page */}
              <Route path="/" element={<VideoGrid />} />
              
              {/* Search Results Page */}
              <Route path="/search/:searchTerm" element={<SearchFeed />} />
              
              {/* Video Player Page */}
              <Route path="/video/:id" element={<VideoDetail />} />
              
              {/* Other Pages */}
              <Route path="/history" element={<History />} />
              <Route path="/library" element={<Library />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;