import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet with React
if (L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom mechanic icon
const mechanicIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png', // Example: wrench icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Custom user icon
const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', // Example: user icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function FitBounds({ user, mechanic }) {
  const map = useMap();
  useEffect(() => {
    if (user && mechanic) {
      const bounds = L.latLngBounds([
        [user.lat, user.lng],
        [mechanic.lat, mechanic.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (user) {
      map.setView([user.lat, user.lng], 15);
    } else if (mechanic) {
      map.setView([mechanic.lat, mechanic.lng], 15);
    }
  }, [user, mechanic, map]);
  return null;
}

const TrackLiveLocation = () => {
  const { id } = useParams();
  const [locations, setLocations] = useState({ user: null, mechanic: null });
  const [role, setRole] = useState('user');
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const intervalRef = useRef();

  useEffect(() => {
    // Get role from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role) setRole(user.role);
  }, []);

  // Poll for locations
  useEffect(() => {
    fetchLocations();
    intervalRef.current = setInterval(fetchLocations, 3000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line
  }, [id]);

  // Send own location if allowed
  useEffect(() => {
    if (!navigator.geolocation) return;
    let geoWatch;
    if (role === 'user' || role === 'mechanic') {
      geoWatch = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          fetch(`https://mechnearu.onrender.com/api/requests/${id}/location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ lat: latitude, lng: longitude, role })
          });
        },
        (err) => {},
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }
    return () => geoWatch && navigator.geolocation.clearWatch(geoWatch);
    // eslint-disable-next-line
  }, [id, role]);

  const fetchLocations = async () => {
    try {
      const res = await fetch(`https://mechnearu.onrender.com/api/requests/${id}/locations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      setLocations(data);
      // Center map between user and mechanic if both exist
      if (data.user && data.mechanic) {
        setMapCenter([
          (data.user.lat + data.mechanic.lat) / 2,
          (data.user.lng + data.mechanic.lng) / 2
        ]);
      } else if (data.user) {
        setMapCenter([data.user.lat, data.user.lng]);
      } else if (data.mechanic) {
        setMapCenter([data.mechanic.lat, data.mechanic.lng]);
      }
    } catch {}
  };

  // Polyline points
  const polylinePositions =
    locations.user && locations.mechanic
      ? [
          [locations.user.lat, locations.user.lng],
          [locations.mechanic.lat, locations.mechanic.lng],
        ]
      : [];

  return (
    <div className="w-screen h-screen p-0 m-0">
      <h2 className="text-2xl font-bold mb-6 p-6">Live Tracking</h2>
      <div className="w-full h-[calc(100vh-80px)]">
        <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.user && (
            <Marker position={[locations.user.lat, locations.user.lng]} icon={userIcon}>
              <Popup>
                User<br />
                {locations.user.address && <span>{locations.user.address}<br /></span>}
                Lat: {locations.user.lat}, Lng: {locations.user.lng}
              </Popup>
            </Marker>
          )}
          {locations.mechanic && (
            <Marker position={[locations.mechanic.lat, locations.mechanic.lng]} icon={mechanicIcon}>
              <Popup>
                Mechanic<br />
                {locations.mechanic.address && <span>{locations.mechanic.address}<br /></span>}
                Lat: {locations.mechanic.lat}, Lng: {locations.mechanic.lng}
              </Popup>
            </Marker>
          )}
          {polylinePositions.length === 2 && (
            <Polyline positions={polylinePositions} color="blue" />
          )}
          <FitBounds user={locations.user} mechanic={locations.mechanic} />
        </MapContainer>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 rounded-lg px-4 py-2 text-gray-600 text-sm shadow">
        This map updates every 3 seconds. Your location is shared only while this page is open.
      </div>
    </div>
  );
};

export default TrackLiveLocation; 