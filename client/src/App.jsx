import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import Layout from './components/Layout';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import JobDetails from './pages/JobDetails';
import Jobs from './pages/Jobs';

// User Dashboard Pages
import UserDashboard from './pages/user/Dashboard';
import UserProfile from './pages/user/Profile';
import UserResume from './pages/user/Resume';
import Chatbot from './pages/user/Chatbot';
import JobRecommendations from './pages/user/JobRecommendations';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const dashboardByRole = {
    admin: '/dashboard', // Simplified as jobs are removed
    recruiter: '/dashboard',
    user: '/dashboard'
  };

  if (user?.role === 'admin') {
    return children;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={dashboardByRole[user?.role] || '/login'} replace />;
  }

  return children;
};

// Public Route (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  const { user } = useAuth();

  const getDashboardRoute = () => {
    if (!user) return '/login';
    return '/dashboard';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route 
          path="login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route 
          path="forgot-password" 
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          } 
        />
      </Route>

      {/* User Dashboard Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['user', 'admin', 'recruiter']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="resume" element={<UserResume />} />
        <Route path="chatbot" element={<Chatbot />} />
        <Route path="recommendations" element={<JobRecommendations />} />
      </Route>


      {/* Default redirect */}
      <Route path="*" element={<Navigate to={getDashboardRoute()} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
