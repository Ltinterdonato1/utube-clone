import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaYoutube, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { MdVideoCall, MdNotificationsNone } from 'react-icons/md';
import { auth, signInWithGoogle } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search/${searchTerm}`);
      setSearchTerm('');
      setMobileSearch(false);
    }
  };

  const handleSignOut = () => {
    auth.signOut();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center px-4 h-14 bg-[#0f0f0f] text-white sticky top-0 z-50">
      {/* Left: Logo (Hidden on mobile search) */}
      {!mobileSearch && (
        <Link to="/" className="flex items-center gap-1 min-w-fit">
          <FaYoutube className="text-red-600 text-3xl" />
          <span className="text-xl font-bold tracking-tighter hidden sm:block">YouTube</span>
        </Link>
      )}

      {/* Center: Search Bar */}
      <div className={`${mobileSearch ? 'flex' : 'hidden md:flex'} items-center flex-1 max-w-[720px] ml-2 md:ml-10 transition-all`}>
        {mobileSearch && (
          <button onClick={() => setMobileSearch(false)} className="mr-4 p-2 hover:bg-[#272727] rounded-full">
            <FaArrowLeft />
          </button>
        )}
        <form onSubmit={handleSubmit} className="flex w-full">
          <div className="flex w-full bg-[#121212] border border-gray-700 rounded-l-full px-4 py-1.5 items-center focus-within:border-blue-500 ml-2">
            <input 
              type="text" 
              placeholder="Search" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent w-full focus:outline-none text-base"
            />
          </div>
          <button type="submit" className="bg-[#222222] border border-l-0 border-gray-700 rounded-r-full px-5 py-2 hover:bg-[#333333] transition-colors">
            <FaSearch className="text-sm text-gray-400" />
          </button>
        </form>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4 ml-2">
        {!mobileSearch && (
          <button onClick={() => setMobileSearch(true)} className="md:hidden p-2 hover:bg-[#272727] rounded-full">
            <FaSearch className="text-lg" />
          </button>
        )}
        
        {user && (
          <>
            <MdVideoCall className="text-2xl cursor-pointer hidden sm:block" title="Create" />
            <MdNotificationsNone className="text-2xl cursor-pointer hidden sm:block" title="Notifications" />
          </>
        )}

        <div className="relative" ref={dropdownRef}>
          {user ? (
            <div className="flex items-center">
              <img 
                src={user.photoURL} 
                alt="User" 
                className="h-8 w-8 rounded-full cursor-pointer border border-transparent hover:border-gray-400 transition-all"
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="absolute right-0 top-12 w-64 bg-[#282828] border border-gray-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-150">
                  <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-700 mb-2">
                    <img src={user.photoURL} className="h-10 w-10 rounded-full" alt="" />
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold truncate">{user.displayName}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <Link to="/channel" className="text-blue-400 text-xs mt-1 block hover:underline">View your channel</Link>
                    </div>
                  </div>
                  <Link to="/library" className="block px-4 py-2 text-sm hover:bg-[#3f3f3f]" onClick={() => setShowDropdown(false)}>Your Library</Link>
                  <Link to="/history" className="block px-4 py-2 text-sm hover:bg-[#3f3f3f]" onClick={() => setShowDropdown(false)}>Watch History</Link>
                  <hr className="border-gray-700 my-1" />
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-sm hover:bg-[#3f3f3f] text-red-400 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="flex items-center gap-2 border border-gray-700 text-blue-400 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-400/10 hover:border-transparent transition"
            >
              <div className="border border-blue-400 rounded-full p-0.5"><FaSearch className="text-[10px]" /></div>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;