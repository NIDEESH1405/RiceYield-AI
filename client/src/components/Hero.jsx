import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Hero.css';

function useCountUp(target, duration = 2000, suffix = '') {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count + suffix;
}

function AnimatedStat({ value, label, rawNum, suffix }) {
  const animated = useCountUp(rawNum, 2200, suffix);
  return (
    <div className="hero-stat">
      <div className="hero-stat-val">{rawNum ? animated : value}</div>
      <div className="hero-stat-label">{label}</div>
    </div>
  );
}

export default function Hero() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section className="hero-section">
      <div className="hero-bg">
        <div className="hero-orb orb-a" />
        <div className="hero-orb orb-b" />
        <div className="hero-orb orb-c" />
        <div className="hero-grid" />
        <div className="hero-particles">
          {[...Array(12)].map((_, i) => <div key={i} className={`particle p-${i}`} />)}
        </div>
      </div>
      <div className={`hero-content ${visible ? 'visible' : ''}`}>
        <div className="gov-ribbon fade-up">
          <span className="ribbon-flag">🌾</span>
          AI-Powered Precision Agriculture Platform &nbsp;·&nbsp; India
          <span className="ribbon-live">● LIVE</span>
        </div>
        <div className="hero-tag fade-up">🚀 AI-Powered Precision Agriculture Platform v4.0</div>
        <h1 className="hero-title fade-up">
          Predict Rice Yield<br />
          <span className="hero-accent">Empower Farmers</span><br />
          Secure Food Future
        </h1>
        <p className="hero-desc fade-up">
          Official AI platform using Hybrid LSTM + ORYZA2000 models for <strong>94.2% accurate</strong> rice yield predictions.
          Integrated with PM-KISAN, PMFBY, and national food security programs.
        </p>
        <div className="hero-actions fade-up">
          <a href="#estimator" className="btn btn-primary btn-lg hero-cta">
            <span className="cta-icon">⚡</span> Run Free Estimation
          </a>
          {user ? (
            <Link to="/dashboard" className="btn btn-outline btn-lg">My Dashboard →</Link>
          ) : (
            <Link to="/register" className="btn btn-outline btn-lg">Register as Farmer →</Link>
          )}
        </div>

        <div className="hero-stats fade-up">
          <AnimatedStat rawNum={94} suffix="%" label="AI Accuracy" />
          <AnimatedStat value="2.3Cr+" rawNum={0} label="Farmers Registered" />
          <AnimatedStat rawNum={28} suffix="" label="States Covered" />
          <AnimatedStat value="₹6000" rawNum={0} label="PM-KISAN Benefit" />
        </div>

        <div className="hero-trust fade-up">
          <span className="trust-label">Integrated with</span>
          {['PM-KISAN','PMFBY','eNAM','DD Kisan','ICAR','APMC'].map(g => (
            <div className="gov-logo-chip" key={g}>{g}</div>
          ))}
        </div>

        <div className="hero-scroll-hint fade-up">
          <span>Scroll to explore</span>
          <div className="scroll-line" />
        </div>
      </div>
    </section>
  );
}
