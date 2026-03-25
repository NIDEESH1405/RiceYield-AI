import React, { useEffect, useState } from 'react';
import { getReports, generateReport } from '../utils/api';
import './ReportsPage.css';

const INDIAN_STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Gujarat','Haryana','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','Uttarakhand','West Bengal'];

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ reportType:'district', district:'', state:'', season:'', year: new Date().getFullYear() });

  const fetchReports = () => {
    getReports().then(r => setReports(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(() => fetchReports(), []);

  const handleGenerate = async (e) => {
    e.preventDefault(); setGenerating(true); setMsg('');
    try {
      await generateReport(form);
      setMsg('Report generated successfully!');
      setShowForm(false);
      fetchReports();
    } catch(err) { setMsg('Error: ' + (err.response?.data?.message || 'Failed')); }
    setGenerating(false);
  };

  const REPORT_ICONS = { district:'🏘️', state:'🗺️', national:'🇮🇳', seasonal:'🌾', crop:'🌱', farmer:'👨‍🌾' };

  return (
    <div className="reports-page">
      <div className="reports-container">
        <div className="reports-header fade-up">
          <div>
            <div className="page-tag">📊 Government Reports</div>
            <h1>Agricultural Reports & Analytics</h1>
            <p>Generate official district, state, and national rice production reports</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? '✕ Cancel' : '+ Generate Report'}
          </button>
        </div>

        {showForm && (
          <div className="report-form card fade-up">
            <h3>📋 Generate New Report</h3>
            <form onSubmit={handleGenerate}>
              <div className="form-grid-3">
                <div className="form-group">
                  <label>Report Type</label>
                  <select value={form.reportType} onChange={e => setForm(f=>({...f,reportType:e.target.value}))}>
                    <option value="district">District Report</option>
                    <option value="state">State Report</option>
                    <option value="national">National Report</option>
                    <option value="seasonal">Seasonal Report</option>
                    <option value="crop">Crop Variety Report</option>
                    <option value="farmer">Farmer Report</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>State</label>
                  <select value={form.state} onChange={e => setForm(f=>({...f,state:e.target.value}))}>
                    <option value="">All States</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input placeholder="Enter district name" value={form.district} onChange={e => setForm(f=>({...f,district:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label>Season</label>
                  <select value={form.season} onChange={e => setForm(f=>({...f,season:e.target.value}))}>
                    <option value="">All Seasons</option>
                    <option value="kharif">Kharif</option>
                    <option value="rabi">Rabi</option>
                    <option value="boro">Boro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <select value={form.year} onChange={e => setForm(f=>({...f,year:parseInt(e.target.value)}))}>
                    {[2025,2024,2023,2022].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              {msg && <div className={msg.startsWith('Error') ? 'error-msg' : 'success-msg'}>{msg}</div>}
              <button type="submit" className="btn btn-primary" disabled={generating}>
                {generating ? <><span className="spinner"/> Generating...</> : '📊 Generate Report'}
              </button>
            </form>
          </div>
        )}

        <div className="reports-stats fade-up">
          {[
            { label:'Total Reports', value: reports.length, icon:'📁' },
            { label:'This Month', value: reports.filter(r => new Date(r.createdAt) > new Date(Date.now()-30*24*60*60*1000)).length, icon:'📅' },
            { label:'Farmers Covered', value: reports.reduce((a,r) => a+(r.totalFarmers||0), 0), icon:'👨‍🌾' },
            { label:'Total Area (ha)', value: reports.reduce((a,r) => a+(r.totalArea||0), 0).toFixed(0), icon:'🌾' },
          ].map(s => (
            <div className="report-stat card" key={s.label}>
              <div className="rs-icon">{s.icon}</div>
              <div className="rs-val">{s.value}</div>
              <div className="rs-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="reports-table card fade-up">
          <h3>Generated Reports</h3>
          {loading ? <div className="dash-loading"><div className="spinner"/><span>Loading...</span></div> : reports.length === 0 ? (
            <div className="empty-reports">
              <span>📊</span>
              <p>No reports yet. Generate your first report using the button above.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Report</th><th>Type</th><th>Region</th><th>Farmers</th><th>Area (ha)</th><th>Avg Yield</th><th>Generated By</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div className="report-title-cell">
                          <span className="report-icon">{REPORT_ICONS[r.reportType]}</span>
                          <span>{r.title}</span>
                        </div>
                      </td>
                      <td><span className="type-tag">{r.reportType}</span></td>
                      <td>{r.district || r.state || 'National'}</td>
                      <td>{r.totalFarmers || 0}</td>
                      <td>{r.totalArea?.toFixed(2) || 0}</td>
                      <td><strong style={{color:'#4ade80'}}>{r.avgYield?.toFixed(2) || '—'} t/ha</strong></td>
                      <td>{r.generatedBy?.name || '—'}</td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
