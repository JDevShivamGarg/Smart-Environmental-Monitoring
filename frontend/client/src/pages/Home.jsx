import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
      <h1 className="text-5xl font-bold mb-4">Welcome to EnviraMonitor</h1>
      <p className="text-lg text-gray-600 mb-8">Your real-time environmental data monitoring solution.</p>
      <Link to="/dashboard" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default Home;
