import React from 'react';
import './Models.css';

const MODELS = [
  { type:'Process-Based', name:'ORYZA2000', desc:'FAO/IRRI rice-specific growth model simulating phenological development, biomass partitioning, and yield formation under varying weather, soil, and management conditions.', r2:'0.89', rmse:'0.6', tags:['IRRI','Phenology','N-Stress','Water-Stress'] },
  { type:'Deep Learning', name:'LSTM-Attention', desc:'Bidirectional LSTM with multi-head attention trained on 10-year rice yield records across South & Southeast Asia. Processes 16-day multispectral time-series stacks.', r2:'0.93', rmse:'0.4', tags:['PyTorch','Bi-LSTM','Attention','TF Serving'] },
  { type:'Hybrid Ensemble', name:'PhysML Ensemble', desc:'ORYZA2000 + LSTM + XGBoost ensemble with Bayesian model averaging. DSSAT provides physical constraints while ML corrects systematic residual biases.', r2:'0.95', rmse:'0.3', tags:['EnKF DA','BMA','XGBoost','DSSAT'] },
];

export default function Models() {
  return (
    <section id="models" className="section-models">
      <div className="section-tag">Crop Models</div>
      <h2 className="section-title">Integrated Modelling Framework</h2>
      <p className="section-desc">Three-tier architecture combining process-based, statistical, and deep learning approaches.</p>
      <div className="models-grid reveal">
        {MODELS.map(m => (
          <div className="model-card" key={m.name}>
            <div className="model-type"><div className="model-type-dot" />{m.type}</div>
            <div className="model-name">{m.name}</div>
            <div className="model-desc">{m.desc}</div>
            <div className="model-metrics">
              <div className="metric"><div className="metric-val">R²={m.r2}</div><div className="metric-label">Accuracy</div></div>
              <div className="metric"><div className="metric-val">±{m.rmse}</div><div className="metric-label">RMSE t/ha</div></div>
            </div>
            <div className="model-tags">{m.tags.map(t => <span className="model-tag" key={t}>{t}</span>)}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
