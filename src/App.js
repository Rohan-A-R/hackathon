import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SpeakerDashboard from './pages/SpeakerDashboard';
import EventManagerDashboard from './pages/EventManagerDashboard';
import Profile from './pages/Profile';
import Agenda from './pages/Agenda';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userData?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Dashboard Route Component - redirects based on role
const DashboardRoute = () => {
  const { userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (userData?.role === 'speaker') {
    return <SpeakerDashboard />;
  } else if (userData?.role === 'event_manager') {
    return <EventManagerDashboard />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

// Layout Component
const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      {isAuthenticated && <Footer />}
    </div>
  );
};

// App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRoute />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/agenda" 
                element={
                  <ProtectedRoute>
                    <Agenda />
                  </ProtectedRoute>
                } 
              />

              {/* Speaker Only Routes */}
              <Route 
                path="/sessions" 
                element={
                  <ProtectedRoute requiredRole="speaker">
                    <SpeakerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Event Manager Only Routes */}
              <Route 
                path="/manage-sessions" 
                element={
                  <ProtectedRoute requiredRole="event_manager">
                    <EventManagerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/manage-agenda" 
                element={
                  <ProtectedRoute requiredRole="event_manager">
                    <EventManagerDashboard />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/communications" 
                element={
                  <ProtectedRoute requiredRole="event_manager">
                    <EventManagerDashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;