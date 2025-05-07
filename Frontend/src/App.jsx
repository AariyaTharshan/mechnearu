import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './components/user/UserDashboard';
import MechanicDashboard from './components/mechanic/MechanicDashboard';
import CreateRequest from './components/user/CreateRequest';
import TrackRequest from './components/user/TrackRequest';
import ServiceHistory from './components/user/ServiceHistory';
import NearbyServices from './components/mechanic/NearbyServices';
import CurrentService from './components/mechanic/CurrentService';
import MechanicServiceHistory from './components/mechanic/ServiceHistory';
import TrackLiveLocation from './components/user/TrackLiveLocation';

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === 'mechanic') {
      return <Navigate to="/mechanic/nearby-services" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* User Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard>
                <CreateRequest />
              </UserDashboard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-requests"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard>
                <TrackRequest />
              </UserDashboard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/service-history"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard>
                <ServiceHistory />
              </UserDashboard>
            </ProtectedRoute>
          }
        />

        {/* Mechanic Dashboard Routes */}
        <Route
          path="/mechanic/nearby-services"
          element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicDashboard>
                <NearbyServices />
              </MechanicDashboard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mechanic/current-service"
          element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicDashboard>
                <CurrentService />
              </MechanicDashboard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mechanic/service-history"
          element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicDashboard>
                <MechanicServiceHistory />
              </MechanicDashboard>
            </ProtectedRoute>
          }
        />

        {/* Track Live Location Route */}
        <Route path="/track/:id" element={<TrackLiveLocation />} />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;