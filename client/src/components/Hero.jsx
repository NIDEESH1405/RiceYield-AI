import React, { useEffect, useRef } from 'react';
import './Hero.css';

export default function Hero() {
  const fieldRef = useRef(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('div');
      s.className = 'rice-stalk';
      const h = 80 + Math.random() * 200;
      s.style.cssText = `left:${Math.random()*100}%;height:${h}px;opacity:${0.1+Math.random()*0.3};animation-duration:${3+Math.random()*4}s;animation-delay:${-Math.random()*4}s;width:${1+Math.random()*2}px`;
      field.appendChild(s);
    }
  }, []);

  return (
    <>
      <div className="bg-field"><div ref={fieldRef} className="floating-rice" /></div>
      <section className="hero">
        <div className="hero-badge"><span className="badge-dot" />VHR Remote Sensing · AI Crop Models · Farm Scale</div>
        <h1>Farm-Level Rice Yield<br />Estimation with <em>AI Precision</em></h1>
        <p className="hero-sub">
          Combining very-high spatial resolution satellite imagery with robust process-based crop models
          to deliver field-scale rice yield predictions.
        </p>
        <div className="hero-actions">
          <a href="#estimator" className="btn-primary" onClick={e=>{e.preventDefault();document.getElementById('estimator')?.scrollIntoView({behavior:'smooth'})}}>🌾 Estimate My Yield</a>
          <a href="#how-it-works" className="btn-secondary" onClick={e=>{e.preventDefault();document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'})}}>How It Works →</a>
        </div>
        <div className="hero-stats">
          {[['92%','Model Accuracy'],['0.3m','VHR Resolution'],['±8%','Prediction Error'],['14d','Forecast Lead Time'],['50K+','Fields Analyzed']].map(([val,label])=>(
            <div className="stat-item" key={label}>
              <span className="stat-value">{val}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
