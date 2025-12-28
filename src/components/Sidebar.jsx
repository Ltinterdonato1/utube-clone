import { Link, useLocation } from 'react-router-dom';
import { MdHome, MdOutlineSubscriptions, MdOutlineVideoLibrary, MdHistory } from 'react-icons/md';

const SidebarItem = ({ icon, title, to }) => {
  const location = useLocation();
  // Check if the current path matches the item's destination
  const active = location.pathname === to;

  return (
    <Link to={to}>
      <div className={`flex items-center gap-5 px-3 py-3 rounded-lg cursor-pointer hover:bg-[#272727] transition-colors ${active ? 'bg-[#272727]' : ''}`}>
        <span className={`text-xl ${active ? 'text-white' : 'text-gray-300'}`}>{icon}</span>
        <span className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-300'}`}>{title}</span>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  return (
    <aside className="w-60 bg-[#0f0f0f] text-white p-2 flex flex-col gap-1 hidden md:flex h-[calc(100vh-56px)] sticky top-14">
      <SidebarItem icon={<MdHome />} title="Home" to="/" />
      <SidebarItem icon={<MdOutlineSubscriptions />} title="Subscriptions" to="/subscriptions" />
      
      <hr className="border-gray-700 my-2" />
      
      <SidebarItem icon={<MdOutlineVideoLibrary />} title="Library" to="/library" />
      <SidebarItem icon={<MdHistory />} title="History" to="/history" />
    </aside>
  );
};

export default Sidebar;