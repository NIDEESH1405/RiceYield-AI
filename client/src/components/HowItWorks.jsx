import React from 'react';
import './HowItWorks.css';

const STEPS = [
  { num:'01', icon:'🛰️', title:'VHR Data Acquisition', desc:'WorldView-3, Pléiades Neo & Planet SuperDove imagery at 0.3–5m resolution. Multi-temporal stacks capture entire rice growing season from transplanting to harvest.', tag:'Multispectral · SAR Fusion' },
  { num:'02', icon:'🧭', title:'Field Boundary Delineation', desc:'Automated parcel segmentation using Mask R-CNN and SAM with cadastral data integration for precise field polygons.', tag:'Instance Segmentation' },
  { num:'03', icon:'📡', title:'Biophysical Retrieval', desc:'PROSAIL radiative transfer model inversion extracts LAI, canopy chlorophyll content (CCC), and FAPAR directly from surface reflectance bands.', tag:'RTM · PROSAIL Inversion' },
  { num:'04', icon:'🧬', title:'Crop Model Assimilation', desc:'Ensemble Kalman Filter (EnKF) assimilates LAI observations into ORYZA / DSSAT rice models, updating phenological state variables in real-time.', tag:'EnKF · ORYZA · DSSAT' },
  { num:'05', icon:'🤖', title:'ML Yield Prediction', desc:'Hybrid LSTM + XGBoost ensemble trained on multi-year rice yield records. Spectral time-series, weather variables, and soil properties as input features.', tag:'LSTM · XGBoost · Ensemble' },
  { num:'06', icon:'🗺️', title:'Yield Map Generation', desc:'Per-pixel yield predictions aggregated to field polygons with uncertainty bounds. Interactive maps show within-field spatial variability and stress zones.', tag:'Conformal Prediction · CI Bands' },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-hiw">
      <div className="section-tag">Methodology</div>
      <h2 className="section-title">How Yield Estimation Works</h2>
      <p className="section-desc">A six-stage pipeline from raw satellite acquisition to farm-level yield maps with uncertainty bounds.</p>
      <div className="steps-grid reveal">
        {STEPS.map(s => (
          <div className="step-card" key={s.num}>
            <div className="step-num">{s.num}</div>
            <div className="step-icon">{s.icon}</div>
            <div className="step-title">{s.title}</div>
            <div className="step-desc">{s.desc}</div>
            <span className="step-tag">{s.tag}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
