import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">🌾 RiceYield<span>AI</span></div>
          <p>Advanced AI-powered rice yield prediction for modern precision agriculture.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="/#estimator">Estimator</a>
            <a href="/#how-it-works">How It Works</a>
            <a href="/#models">AI Models</a>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 RiceYield AI. Built with MERN + Socket.IO</span>
      </div>
    </footer>
  );
}
