import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Chat from '../common/Chat';

const TrackRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatRequestId, setChatRequestId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch('https://mechnearu.onrender.com/api/requests/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Track Your Requests</h2>
      <div className="space-y-4">
        {requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length === 0 ? (
          <p className="text-center text-gray-500">No requests found</p>
        ) : (
          requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{request.serviceType}</h3>
                  <p className="text-gray-600 mt-1">{request.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Location: {request.location && request.location.address} <br /> (Lat: {request.location && request.location.lat}, Lng: {request.location && request.location.lng})</p>
                  </div>
                  {(request.status === 'accepted' || request.status === 'in_progress') && (
                    <div className="flex gap-2 mt-2">
                      <button
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-300"
                        onClick={() => navigate(`/track/${request._id}`)}
                      >
                        Track
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-800 transition-colors duration-300"
                        onClick={() => setChatRequestId(request._id)}
                      >
                        Chat
                      </button>
                    </div>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status.replace('_', ' ')}
                </span>
              </div>
              {request.mechanic && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Assigned Mechanic: {request.mechanic.username}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      {chatRequestId && (
        <Chat requestId={chatRequestId} onClose={() => setChatRequestId(null)} />
      )}
    </div>
  );
};

export default TrackRequest; 