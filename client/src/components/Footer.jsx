import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">🌾 RiceYield<span>AI</span></div>
          <p className="footer-tagline">Farm-level rice yield estimation powered by very-high resolution satellite imagery and robust AI crop models. Trusted by researchers and agronomists across South Asia.</p>
        </div>
        {[
          ['Product',['Yield Estimator','Field Maps','Monitoring','Models']],
          ['Science',['Methodology','Spectral Indices','Technology','Publications']],
          ['Resources',['API Docs','Case Studies','Validation Data','Contact']],
        ].map(([title, links]) => (
          <div className="footer-col" key={title}>
            <h4>{title}</h4>
            <ul>{links.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>© 2025 RiceYield AI · Farm-Level Yield Estimation Platform</p>
        <p>MERN Stack · MongoDB · Express · React · Node.js</p>
      </div>
    </footer>
  );
}
