import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center);
  return null;
};

const CreateRequest = () => {
  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    location: {
      address: '',
      lat: null,
      lng: null
    }
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India center
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = [latitude, longitude];
          setCurrentLocation(newLocation);
          setMapCenter(newLocation);
          setMarkerPosition({ lat: latitude, lng: longitude });
          reverseGeocode(latitude, longitude);
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Error getting your location. Please make sure location services are enabled.');
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMapClick = (latlng) => {
    setMarkerPosition(latlng);
    reverseGeocode(latlng.lat, latlng.lng);
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        location: {
          address: data.display_name || '',
          lat,
          lng
        }
      }));
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      setFormData((prev) => ({
        ...prev,
        location: {
          address: '',
          lat,
          lng
        }
      }));
    }
  };

  const useCurrentLocation = () => {
    getCurrentLocation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      formData.location.lat === null ||
      formData.location.lng === null ||
      formData.location.lat === undefined ||
      formData.location.lng === undefined
    ) {
      alert('Please select a location');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create request');
      }

      // Reset form
      setFormData({
        serviceType: '',
        description: '',
        location: {
          address: '',
          lat: null,
          lng: null
        }
      });
      setMarkerPosition(null);

      alert('Service request created successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">Create Service Request</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
            >
              <option value="">Select a service type</option>
              <option value="general">General Maintenance</option>
              <option value="repair">Repair</option>
              <option value="emergency">Emergency Service</option>
              <option value="inspection">Vehicle Inspection</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
              placeholder="Describe your service needs..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <div className="mt-2 space-y-4">
              <button
                type="button"
                onClick={useCurrentLocation}
                disabled={isLoading}
                className={`w-full px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-900 transition-colors duration-300 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Getting Location...' : 'Use Current Location'}
              </button>
              <button
                type="button"
                onClick={() => setIsMapVisible(!isMapVisible)}
                className="w-full px-4 py-2 text-sm font-medium text-black border border-black rounded-lg hover:bg-gray-100 transition-colors duration-300"
              >
                {isMapVisible ? 'Hide Map' : 'Pick Location from Map'}
              </button>
              {formData.location.address && (
                <p className="text-sm text-gray-600">
                  Selected Location: {formData.location.address}
                  <br />
                  (Lat: {formData.location.lat}, Lng: {formData.location.lng})
                </p>
              )}
            </div>
          </div>

          {isMapVisible && (
            <div className="mt-4 h-[400px] rounded-lg overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                  position={markerPosition}
                  setPosition={handleMapClick}
                />
                <ChangeView center={mapCenter} />
              </MapContainer>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all duration-300"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest; 