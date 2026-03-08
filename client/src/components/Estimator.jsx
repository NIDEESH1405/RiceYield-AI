import React, { useState } from 'react';
import { submitEstimation } from '../utils/api';
import './Estimator.css';

const VARIETIES = [
  { value:'ir64', label:'IR64 (High-Yield Irrigated)' },
  { value:'swarna', label:'Swarna (Flood-Tolerant)' },
  { value:'basmati', label:'Pusa Basmati 1121' },
  { value:'dhan', label:'MTU-7029 (Telangana)' },
  { value:'br11', label:'BR11 (Bangladesh HYV)' },
  { value:'samba', label:'Samba Mahsuri' },
];
const SEASONS = [
  { value:'kharif', label:'Kharif (Wet Season, Jun–Nov)' },
  { value:'rabi', label:'Rabi (Dry Season, Nov–Apr)' },
  { value:'boro', label:'Boro (Winter Irrigated)' },
];
const IRRIGATIONS = [
  { value:'full', label:'Fully Irrigated' },
  { value:'rainfed', label:'Rainfed' },
  { value:'partial', label:'Partial Irrigation' },
  { value:'awi', label:'Alternate Wet & Dry (AWD)' },
];
const SOILS = [
  { value:'clay', label:'Clay (Vertisol)' },
  { value:'loam', label:'Clay Loam' },
  { value:'silt', label:'Silt Loam' },
  { value:'sandy', label:'Sandy Loam' },
];

export default function Estimator() {
  const [form, setForm] = useState({
    fieldArea: 2.5, riceVariety: 'ir64', season: 'kharif',
    ndvi: 0.72, lai: 5.2, irrigation: 'full',
    soilType: 'loam', nitrogen: 120, plantingYear: 2024,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true); setError(''); setSaved(false);
    try {
      const res = await submitEstimation(form);
      setResult(res.data.data);
      setSaved(true);
    } catch (err) {
      setError('Server error. Is the backend running? Check console.');
      console.error(err);
    }
    setLoading(false);
  };

  const riskColor = (level) =>
    level === 'low' ? 'risk-low' : level === 'high' ? 'risk-high' : 'risk-med';

  return (
    <section id="estimator" className="estimator-section">
      <div className="section-tag">Interactive Tool</div>
      <h2 className="section-title">Rice Yield Estimator</h2>
      <p className="section-desc">
        Input your field parameters and get an AI-powered yield prediction saved directly to MongoDB.
      </p>
      <div className="estimator-layout reveal">

        {/* INPUT FORM */}
        <div className="form-panel">
          <h3>🌾 Field Parameters</h3>
          <div className="range-row">
            <div className="form-group">
              <label>Field Area (ha)</label>
              <input type="number" value={form.fieldArea} min="0.1" max="500" step="0.1"
                onChange={e => set('fieldArea', parseFloat(e.target.value))} />
            </div>
            <div className="form-group">
              <label>Planting Year</label>
              <select value={form.plantingYear} onChange={e => set('plantingYear', parseInt(e.target.value))}>
                <option value={2025}>2025</option>
                <option value={2024}>2024</option>
                <option value={2023}>2023</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Rice Variety</label>
            <select value={form.riceVariety} onChange={e => set('riceVariety', e.target.value)}>
              {VARIETIES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Growing Season</label>
            <select value={form.season} onChange={e => set('season', e.target.value)}>
              {SEASONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Peak NDVI: <span className="range-val">{form.ndvi.toFixed(2)}</span></label>
            <input type="range" min="0.2" max="0.95" step="0.01" value={form.ndvi}
              onChange={e => set('ndvi', parseFloat(e.target.value))} />
          </div>
          <div className="form-group">
            <label>LAI at Heading (m²/m²): <span className="range-val">{form.lai.toFixed(1)}</span></label>
            <input type="range" min="1" max="9" step="0.1" value={form.lai}
              onChange={e => set('lai', parseFloat(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Irrigation Type</label>
            <select value={form.irrigation} onChange={e => set('irrigation', e.target.value)}>
              {IRRIGATIONS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
            </select>
          </div>
          <div className="range-row">
            <div className="form-group">
              <label>Soil Type</label>
              <select value={form.soilType} onChange={e => set('soilType', e.target.value)}>
                {SOILS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>N Fertilizer (kg/ha)</label>
              <input type="number" value={form.nitrogen} min="0" max="300"
                onChange={e => set('nitrogen', parseFloat(e.target.value))} />
            </div>
          </div>
          {error && <div className="error-msg">⚠️ {error}</div>}
          <button className="estimate-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" /> : '⚡ Run AI Yield Estimation & Save to DB'}
          </button>
          {saved && <div className="saved-msg">✅ Saved to MongoDB successfully!</div>}
        </div>

        {/* RESULTS PANEL */}
        <div className="results-panel">
          <h3>📊 Estimation Results {saved && <span className="live-dot">LIVE</span>}</h3>
          {!result ? (
            <div className="result-placeholder">
              <div className="ph-icon">🌾</div>
              <p>Fill in field parameters and click<br /><strong>Run AI Yield Estimation</strong><br />to generate your prediction.</p>
            </div>
          ) : (
            <div className="yield-result">
              <div className="yield-main">
                <div className="yield-number">{result.yieldPerHectare}</div>
                <div className="yield-unit">tonnes per hectare (t/ha)</div>
                <div className="yield-total">Total Production: {result.totalProduction} tonnes</div>
              </div>
              <div className="yield-breakdown">
                {[
                  ['Radiation Use Efficiency', result.radiationUseEfficiency, 'var(--green-lime)'],
                  ['Harvest Index', result.harvestIndex, 'var(--green-bright)'],
                  ['Nitrogen Use Efficiency', result.nitrogenUseEfficiency, 'var(--gold)'],
                  ['Water Productivity Score', result.waterProductivityScore, '#60a5fa'],
                ].map(([label, val, color]) => (
                  <div className="breakdown-item" key={label}>
                    <div className="breakdown-label">
                      <span>{label}</span><span>{val}%</span>
                    </div>
                    <div className="breakdown-bar">
                      <div className="breakdown-fill" style={{ width: `${val}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="confidence-badge">
                🎯 CI: {result.confidenceIntervalLow}–{result.confidenceIntervalHigh} t/ha &nbsp;|&nbsp; {result.modelUsed}
              </div>
              <div className="risk-chips">
                {result.risks?.map((r, i) => (
                  <span key={i} className={`risk-chip ${riskColor(r.level)}`}>{r.label}</span>
                ))}
              </div>
              <div className="mongo-id">MongoDB _id: <code>{result._id}</code></div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
