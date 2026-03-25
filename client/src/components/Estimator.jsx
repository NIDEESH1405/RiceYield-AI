import React, { useState } from 'react';
import { submitEstimation } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './Estimator.css';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';

const VARIETIES = [
  { value:'ir64', label:'IR64 (High-Yield Irrigated)' },
  { value:'swarna', label:'Swarna (Flood-Tolerant)' },
  { value:'basmati', label:'Pusa Basmati 1121' },
  { value:'dhan', label:'MTU-7029 (Telangana)' },
  { value:'br11', label:'BR11 (Bangladesh HYV)' },
  { value:'samba', label:'Samba Mahsuri' },
  { value:'mtugold', label:'MTU Gold' },
  { value:'rajendra', label:'Rajendra Bhagwati' },
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
const PEST_LEVELS = [
  { value:'none', label:'None' },
  { value:'low', label:'Low' },
  { value:'medium', label:'Medium' },
  { value:'high', label:'High' },
];
const WEATHER_CONDITIONS = [
  { value:'normal', label:'Normal' },
  { value:'dry', label:'Dry Spell' },
  { value:'wet', label:'Excess Rainfall' },
  { value:'flood', label:'Flood Risk' },
  { value:'drought', label:'Drought' },
];

export default function Estimator() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fieldArea: 2.5, riceVariety: 'ir64', season: 'kharif',
    ndvi: 0.72, lai: 5.2, irrigation: 'full',
    soilType: 'loam', nitrogen: 120, phosphorus: 40, potassium: 60,
    pestPressure: 'low', weatherCondition: 'normal',
    marketPrice: 2200, plantingYear: 2025,
    district: '', state: '',
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
      setStep(3);
    } catch (err) {
      setError('Server error. Is the backend running?');
    }
    setLoading(false);
  };

  const riskColor = (level) =>
    level === 'low' ? 'risk-low' : level === 'high' ? 'risk-high' : 'risk-med';

  const efficiencyData = result ? [
    { name: 'Radiation', value: result.radiationUseEfficiency },
    { name: 'Harvest', value: result.harvestIndex },
    { name: 'Nitrogen', value: result.nitrogenUseEfficiency },
    { name: 'Water', value: result.waterProductivityScore },
  ] : [];

  const radarData = result ? [
    { subject: 'Radiation', A: result.radiationUseEfficiency, fullMark: 100 },
    { subject: 'Harvest', A: result.harvestIndex, fullMark: 100 },
    { subject: 'Nitrogen', A: result.nitrogenUseEfficiency, fullMark: 100 },
    { subject: 'Water', A: result.waterProductivityScore, fullMark: 100 },
  ] : [];

  const handlePrint = () => window.print();

  return (
    <section id="estimator" className="estimator-section">
      <div className="section-tag">Interactive Tool</div>
      <h2 className="section-title">Rice Yield Estimator</h2>
      <p className="section-desc">
        Input your field parameters and get an AI-powered yield prediction.
        {user ? ` Results saved to your account (${user.name}).` : ' Sign in to save your results.'}
      </p>

      {/* Step Indicator */}
      <div className="estimator-steps">
        {[{n:1,label:'Field Info'},{n:2,label:'Agronomics'},{n:3,label:'Results'}].map(s => (
          <div key={s.n} className={`step-item ${step === s.n ? 'active' : step > s.n ? 'done' : ''}`} onClick={() => !loading && s.n < 3 && setStep(s.n)}>
            <div className="step-circle">{step > s.n ? '✓' : s.n}</div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className="estimator-layout">
        <div className="form-panel card">
          {step === 1 && (
            <>
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
                    <option value={2026}>2026</option><option value={2025}>2025</option><option value={2024}>2024</option>
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
                <label>Irrigation Type</label>
                <select value={form.irrigation} onChange={e => set('irrigation', e.target.value)}>
                  {IRRIGATIONS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
              </div>
              <div className="range-row">
                <div className="form-group">
                  <label>State</label>
                  <input placeholder="e.g. Tamil Nadu" value={form.state} onChange={e => set('state', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input placeholder="e.g. Thanjavur" value={form.district} onChange={e => set('district', e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary estimate-btn" onClick={() => setStep(2)}>Next: Agronomics →</button>
            </>
          )}

          {step === 2 && (
            <>
              <h3>🔬 Agronomic Parameters</h3>
              <div className="form-group">
                <label>Peak NDVI: <span className="range-val">{form.ndvi.toFixed(2)}</span>
                  <span className="range-hint"> (Vegetation index: 0.2=sparse, 0.95=dense)</span>
                </label>
                <input type="range" min="0.2" max="0.95" step="0.01" value={form.ndvi}
                  onChange={e => set('ndvi', parseFloat(e.target.value))} />
                <div className="range-labels"><span>Sparse</span><span>Dense</span></div>
              </div>
              <div className="form-group">
                <label>LAI at Heading (m²/m²): <span className="range-val">{form.lai.toFixed(1)}</span></label>
                <input type="range" min="1" max="9" step="0.1" value={form.lai}
                  onChange={e => set('lai', parseFloat(e.target.value))} />
                <div className="range-labels"><span>1 (Poor)</span><span>9 (Excellent)</span></div>
              </div>
              <div className="form-group">
                <label>Soil Type</label>
                <select value={form.soilType} onChange={e => set('soilType', e.target.value)}>
                  {SOILS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="npk-row">
                <div className="form-group">
                  <label>N (kg/ha)</label>
                  <input type="number" value={form.nitrogen} min="0" max="300"
                    onChange={e => set('nitrogen', parseFloat(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>P (kg/ha)</label>
                  <input type="number" value={form.phosphorus} min="0" max="200"
                    onChange={e => set('phosphorus', parseFloat(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>K (kg/ha)</label>
                  <input type="number" value={form.potassium} min="0" max="200"
                    onChange={e => set('potassium', parseFloat(e.target.value))} />
                </div>
              </div>
              <div className="range-row">
                <div className="form-group">
                  <label>Pest Pressure</label>
                  <select value={form.pestPressure} onChange={e => set('pestPressure', e.target.value)}>
                    {PEST_LEVELS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Weather Condition</label>
                  <select value={form.weatherCondition} onChange={e => set('weatherCondition', e.target.value)}>
                    {WEATHER_CONDITIONS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Expected Market Price (₹/quintal)</label>
                <input type="number" value={form.marketPrice} min="1500" max="10000" step="50"
                  onChange={e => set('marketPrice', parseFloat(e.target.value))} />
              </div>
              {error && <div className="error-msg">⚠️ {error}</div>}
              <div className="step-btns">
                <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary estimate-btn" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><span className="spinner" /> Calculating...</> : '⚡ Run AI Yield Estimation'}
                </button>
              </div>
              {saved && <div className="success-msg">✅ {user ? 'Saved to your account + MongoDB!' : 'Result calculated! Sign in to save.'}</div>}
            </>
          )}

          {step === 3 && result && (
            <div className="step3-nav">
              <button className="btn btn-outline btn-sm" onClick={() => { setStep(1); setResult(null); setSaved(false); }}>🔄 New Estimation</button>
              <button className="btn btn-outline btn-sm" onClick={handlePrint}>🖨️ Print / Export</button>
            </div>
          )}
        </div>

        <div className="results-panel card">
          <h3>📊 Estimation Results {saved && <span className="live-chip">LIVE</span>}</h3>
          {!result ? (
            <div className="result-placeholder">
              <div className="ph-icon">🌾</div>
              <p>Fill in the parameters and click<br /><strong>Run AI Yield Estimation</strong><br />to generate your prediction.</p>
              <div className="ph-steps">
                <div className={`ph-step ${step >= 1 ? 'done' : ''}`}>① Field Info</div>
                <div className={`ph-step ${step >= 2 ? 'done' : ''}`}>② Agronomics</div>
                <div className="ph-step">③ Results</div>
              </div>
            </div>
          ) : (
            <div className="yield-result">
              <div className="yield-main">
                <div className="yield-number">{result.yieldPerHectare}</div>
                <div className="yield-unit">tonnes per hectare (t/ha)</div>
                <div className="yield-total">Total Production: <strong>{result.totalProduction} tonnes</strong></div>
                <div className="yield-revenue">Est. Revenue: <strong style={{color:'#f59e0b'}}>₹{result.estimatedRevenue?.toLocaleString('en-IN')}</strong></div>
              </div>

              <div className="result-grid-2">
                <div className="mini-chart-box">
                  <div className="mini-chart-title">Efficiency Scores</div>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={efficiencyData} layout="vertical" margin={{left:0,right:10}}>
                      <XAxis type="number" domain={[0,100]} hide />
                      <YAxis type="category" dataKey="name" width={65} tick={{fontSize:10,fill:'#86efac'}} />
                      <Tooltip contentStyle={{background:'#0a2e1a',border:'1px solid rgba(74,222,128,0.2)',borderRadius:'8px',color:'#f0fdf4',fontSize:'11px'}} formatter={v=>[`${v}%`]} />
                      <Bar dataKey="value" fill="#4ade80" radius={[0,4,4,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mini-chart-box">
                  <div className="mini-chart-title">Performance Radar</div>
                  <ResponsiveContainer width="100%" height={130}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(74,222,128,0.15)" />
                      <PolarAngleAxis dataKey="subject" fontSize={9} stroke="#6b7280" />
                      <Radar dataKey="A" stroke="#4ade80" fill="#4ade80" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="result-metrics-row">
                {[
                  { label:'Carbon Footprint', val:`${result.carbonFootprint} t CO₂`, icon:'🌿' },
                  { label:'Water Usage', val:`${result.waterUsage} m³`, icon:'💧' },
                  { label:'Insurance', val: result.insuranceEligible ? 'Eligible ✅' : 'Not Eligible', icon:'🛡️' },
                  { label:'Subsidy', val: result.subsidyAmount ? `₹${result.subsidyAmount.toLocaleString('en-IN')}` : '—', icon:'💰' },
                ].map(m => (
                  <div className="result-metric" key={m.label}>
                    <span className="rm-icon">{m.icon}</span>
                    <span className="rm-val">{m.val}</span>
                    <span className="rm-label">{m.label}</span>
                  </div>
                ))}
              </div>

              <div className="confidence-badge">
                🎯 CI: {result.confidenceIntervalLow}–{result.confidenceIntervalHigh} t/ha &nbsp;|&nbsp; {result.modelUsed}
              </div>
              <div className="risk-chips">
                {result.risks?.map((r, i) => (
                  <span key={i} className={`risk-chip ${riskColor(r.level)}`} title={r.mitigation}>{r.label}</span>
                ))}
              </div>
              {result.recommendations?.length > 0 && (
                <div className="recommendations-box">
                  <div className="rec-title">💡 Recommendations</div>
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className={`rec-item priority-${rec.priority}`}>
                      <span className="rec-cat">{rec.category}</span>
                      <span className="rec-text">{rec.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
