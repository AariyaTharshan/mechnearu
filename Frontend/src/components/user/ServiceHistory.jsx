import { useState, useEffect } from 'react';

const ServiceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('https://mechnearu.onrender.com/api/requests/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service history');
      }

      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching service history:', error);
    } finally {
      setLoading(false);
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
      <h2 className="text-2xl font-bold mb-6">Service History</h2>
      <div className="space-y-4">
        {history.length === 0 ? (
          <p className="text-center text-gray-500">No service history found</p>
        ) : (
          history.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{service.serviceType}</h3>
                  <p className="text-gray-600 mt-1">{service.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Date: {service.completedDate ? new Date(service.completedDate).toLocaleDateString() : ''}</p>
                    <p>Location: {service.location && service.location.address} <br /> (Lat: {service.location && service.location.lat}, Lng: {service.location && service.location.lng})</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
              {service.mechanic && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Serviced by: {service.mechanic.username}
                  </p>
                  {service.feedback && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Your Feedback:</p>
                      <p className="text-sm text-gray-600 mt-1">{service.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceHistory; 