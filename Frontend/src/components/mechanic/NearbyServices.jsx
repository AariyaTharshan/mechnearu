import { useState, useEffect } from 'react';

const NearbyServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNearbyServices();
  }, []);

  const fetchNearbyServices = async () => {
    try {
      const response = await fetch('https://mechnearu.onrender.com/api/requests/nearby', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nearby services');
      }

      const data = await response.json();
      setServices(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptService = async (serviceId) => {
    try {
      const response = await fetch(`https://mechnearu.onrender.com/api/requests/${serviceId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to accept service');
      }

      // Refresh the list after accepting
      fetchNearbyServices();
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Nearby Service Requests</h2>
      <div className="space-y-4">
        {services.length === 0 ? (
          <p className="text-center text-gray-500">No nearby service requests found</p>
        ) : (
          services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{service.serviceType}</h3>
                  <p className="text-gray-600 mt-1">{service.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Location: {service.location && service.location.address} <br /> (Lat: {service.location && service.location.lat}, Lng: {service.location && service.location.lng})</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAcceptService(service._id)}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-300"
                >
                  Accept Service
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NearbyServices; 