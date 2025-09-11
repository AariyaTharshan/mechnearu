import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' // Default role
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('https://mechnearu.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex transition-all duration-300">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-md w-full space-y-8 transform transition-all duration-300 hover:scale-[1.02]">
          <div>
            <h2 className="mt-6 text-center text-4xl font-bold text-black">
              Create Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join our community of automotive enthusiasts
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-gray-50 border-l-4 border-black p-4 rounded-md transform transition-all duration-300" role="alert">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">{error}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="username" className="block text-sm font-medium text-gray-900">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="role" className="block text-sm font-medium text-gray-900">
                  I am a
                </label>
                <div className="mt-1 grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="radio"
                      id="user"
                      name="role"
                      value="user"
                      checked={formData.role === 'user'}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="user"
                      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer peer-checked:border-black peer-checked:bg-black peer-checked:text-white transition-all duration-300"
                    >
                      <span className="text-sm font-medium">User</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="radio"
                      id="mechanic"
                      name="role"
                      value="mechanic"
                      checked={formData.role === 'mechanic'}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <label
                      htmlFor="mechanic"
                      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer peer-checked:border-black peer-checked:bg-black peer-checked:text-white transition-all duration-300"
                    >
                      <span className="text-sm font-medium">Mechanic</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="transform transition-all duration-300 hover:scale-[1.02]">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300 transform hover:scale-[1.02]"
              >
                Create Account
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-black hover:text-gray-700 transition-colors duration-300">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image/Pattern */}
      <div className="hidden lg:block lg:w-1/2 bg-black">
        <div className="h-full flex items-center justify-center p-12">
          <div className="text-white text-center transform transition-all duration-300 hover:scale-105">
            <h1 className="text-4xl font-bold mb-4">MechNearU</h1>
            <p className="text-xl opacity-90">Your trusted partner for automotive services</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup; 