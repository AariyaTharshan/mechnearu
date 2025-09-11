import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../common/Chat';

const CurrentService = () => {
  const [currentService, setCurrentService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentService();
  }, []);

  const fetchCurrentService = async () => {
    try {
      const response = await fetch('https://mechnearu.onrender.com/api/requests/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch current service');
      }

      const data = await response.json();
      setCurrentService(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      const response = await fetch(`https://mechnearu.onrender.com/api/requests/${currentService._id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update service status');
      }

      // Refresh the current service
      fetchCurrentService();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error: {error}
      </div>
    );
  }

  if (!currentService) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">Current Service</h2>
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No active service at the moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Current Service</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">{currentService.serviceType}</h3>
            <p className="text-gray-600 mt-1">{currentService.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">{currentService.location && currentService.location.address} <br /> (Lat: {currentService.location && currentService.location.lat}, Lng: {currentService.location && currentService.location.lng})</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium capitalize">{currentService.status}</p>
            </div>
          </div>

          {(currentService.status === 'accepted' || currentService.status === 'in_progress') && (
            <div className="flex gap-2 mt-4">
              <button
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-300"
                onClick={() => navigate(`/track/${currentService._id}`)}
              >
                Track
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 transition-colors duration-300"
                onClick={() => setChatOpen(true)}
              >
                Chat
              </button>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="font-medium mb-2">Update Status</h4>
            <div className="flex gap-2">
              {currentService.status === 'accepted' && (
                <button
                  onClick={() => handleUpdateStatus('in_progress')}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-300"
                >
                  Start Service
                </button>
              )}
              {currentService.status === 'in_progress' && (
                <button
                  onClick={() => handleUpdateStatus('completed')}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-300"
                >
                  Complete Service
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {chatOpen && (
        <Chat requestId={currentService._id} onClose={() => setChatOpen(false)} />
      )}
    </div>
  );
};

export default CurrentService; 