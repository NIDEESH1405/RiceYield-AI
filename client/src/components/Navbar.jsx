import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const ROLE_LABELS = { farmer:'Farmer', officer:'District Officer', scientist:'Agronomist', district_admin:'District Admin', state_admin:'State Admin', super_admin:'Super Admin' };
const ROLE_COLORS = { farmer:'#4ade80', officer:'#60a5fa', scientist:'#c084fc', district_admin:'#f59e0b', state_admin:'#fb923c', super_admin:'#ef4444' };

export default function Navbar() {
  const { user, logout, isGovUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => setMenuOpen(false), [location]);

  const unreadNotifs = user?.notifications?.filter(n => !n.read).length || 0;
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🌾</span>
          <span>RiceYield<span className="logo-accent">AI</span></span>

        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/schemes" className={isActive('/schemes') ? 'active' : ''}>Schemes</Link>
          <Link to="/market" className={isActive('/market') ? 'active' : ''}>Market Prices</Link>
          <Link to="/alerts" className={isActive('/alerts') ? 'active' : ''}>Alerts</Link>
          <Link to="/calendar" className={isActive('/calendar') ? 'active' : ''}>Crop Calendar</Link>
          <Link to="/chat" className={`nav-chat-link ${isActive('/chat') ? 'active' : ''}`}>🤖 AI Chat</Link>
          {user && <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Dashboard</Link>}
          {isGovUser && <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>Admin Panel</Link>}
          {isGovUser && <Link to="/reports" className={isActive('/reports') ? 'active' : ''}>Reports</Link>}
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="nav-user">
              {unreadNotifs > 0 && (
                <button className="notif-btn" onClick={() => setNotifOpen(o => !o)}>
                  🔔 <span className="notif-count">{unreadNotifs}</span>
                  {notifOpen && (
                    <div className="notif-dropdown">
                      {user.notifications?.slice(0,5).map((n,i) => (
                        <div key={i} className={`notif-item ${!n.read ? 'unread' : ''}`}>{n.message}</div>
                      ))}
                    </div>
                  )}
                </button>
              )}
              <div className="user-avatar" style={{background:`linear-gradient(135deg, ${ROLE_COLORS[user.role]||'#4ade80'}, #16a34a)`}}>{user.name?.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <span className="user-name">{user.name?.split(' ')[0]}</span>
                <span className="role-label" style={{color: ROLE_COLORS[user.role]}}>{ROLE_LABELS[user.role]}</span>
              </div>
              <Link to="/profile" className="btn btn-outline btn-sm">Profile</Link>
              <button className="btn btn-outline btn-sm" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
