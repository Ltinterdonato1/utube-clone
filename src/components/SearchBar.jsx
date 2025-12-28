import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from '@mui/icons-material';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (searchTerm) {
      // Redirects to /search/your-term
      navigate(`/search/${searchTerm}`);
      setSearchTerm('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-[#121212] border border-[#303030] rounded-full px-4 py-1 w-full max-w-[600px] focus-within:border-blue-500"
    >
      <input
        className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 py-1"
        placeholder="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button type="submit" className="text-gray-400 pl-3">
        <Search />
      </button>
    </form>
  );
};

export default SearchBar;