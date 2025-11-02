import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">EnviraMonitor</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-gray-300">Home</Link>
          <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
          <Link to="/statistics" className="hover:text-gray-300">Statistics</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
