import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <div className="logo-icon">🌾</div>
        RiceYield<span>AI</span>
      </Link>
      <ul className="nav-links">
        <li><button onClick={() => scrollTo('how-it-works')}>Methodology</button></li>
        <li><button onClick={() => scrollTo('estimator')}>Estimator</button></li>
        <li><button onClick={() => scrollTo('models')}>Models</button></li>
        <li><button onClick={() => scrollTo('field-map')}>Field Map</button></li>
        <li><Link to="/admin">Admin</Link></li>
      </ul>
      <button className="nav-cta" onClick={() => scrollTo('estimator')}>Run Estimation →</button>
    </nav>
  );
}
