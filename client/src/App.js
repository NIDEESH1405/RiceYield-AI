import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import SchemesPage from './pages/SchemesPage';
import MarketPage from './pages/MarketPage';
import AlertsPage from './pages/AlertsPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import CropCalendarPage from './pages/CropCalendarPage';
import ChatPage from './pages/ChatPage';
import './index.css';

const Loader = () => <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#4ade80',fontFamily:'Syne,sans-serif',gap:'16px',fontSize:'1.1rem'}}><div className="spinner"/>Loading RiceYield AI...</div>;

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
}
function GovRoute({ children }) {
  const { user, loading, isGovUser } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isGovUser) return <Navigate to="/dashboard" replace />;
  return children;
}
function PublicRoute({ children }) {
  const { user, loading, isGovUser } = useAuth();
  if (loading) return <Loader />;
  if (user) return <Navigate to={isGovUser ? '/admin' : '/dashboard'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <div className="page-wrap">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/calendar" element={<CropCalendarPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/admin" element={<GovRoute><AdminPage /></GovRoute>} />
          <Route path="/reports" element={<GovRoute><ReportsPage /></GovRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return <AuthProvider><Router><AppRoutes /></Router></AuthProvider>;
}
