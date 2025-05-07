import { Link, useLocation, useNavigate } from 'react-router-dom';

const MechanicDashboard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/mechanic/nearby-services', label: 'Nearby Services', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' },
    { path: '/mechanic/current-service', label: 'Current Service', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { path: '/mechanic/service-history', label: 'Service History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <h1 className="text-xl font-bold text-black">MechNearU</h1>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActive(item.path)
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg
                  className={`w-5 h-5 mr-3 ${
                    isActive(item.path) ? 'text-white' : 'text-gray-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {JSON.parse(localStorage.getItem('user'))?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {JSON.parse(localStorage.getItem('user'))?.username}
                </p>
                <p className="text-xs text-gray-500">Mechanic</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="py-6 px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MechanicDashboard; 