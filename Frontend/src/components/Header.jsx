import { Link, useNavigate } from 'react-router-dom';

const Header = ({ userRole, username }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="text-xl font-bold">
              MechNearU
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {username}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 