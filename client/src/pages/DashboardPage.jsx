import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEstimations, getEstimationStats, getPublicAlerts, getPublicSchemes } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [estimations, setEstimations] = useState([]);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    Promise.all([getEstimations(), getEstimationStats(), getPublicAlerts(), getPublicSchemes()])
      .then(([eR, sR, aR, schR]) => { setEstimations(eR.data.data||[]); setStats(sR.data.data); setAlerts(aR.data.data||[]); setSchemes(schR.data.data||[]); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const chartData = estimations.slice(0,10).reverse().map((e,i) => ({ name:`#${i+1}`, yield: e.yieldPerHectare, area: e.fieldArea }));
  const varietyData = stats?.byVariety?.map(v => ({ name: v._id?.toUpperCase(), count: v.count, avgYield: parseFloat(v.avgYield?.toFixed(2)||0) })) || [];
  const radarData = estimations[0] ? [
    { subject:'Radiation', A: estimations[0].radiationUseEfficiency||0, fullMark:100 },
    { subject:'Harvest', A: estimations[0].harvestIndex||0, fullMark:100 },
    { subject:'Nitrogen', A: estimations[0].nitrogenUseEfficiency||0, fullMark:100 },
    { subject:'Water', A: estimations[0].waterProductivityScore||0, fullMark:100 },
  ] : [];
  const totalRevenue = estimations.reduce((a,e) => a+(e.estimatedRevenue||0), 0);
  const totalProduction = estimations.reduce((a,e) => a+(e.totalProduction||0), 0);
  const insuranceEligible = estimations.filter(e => e.insuranceEligible).length;

  if (loading) return <div className="dash-loading"><div className="spinner"/><span>Loading your dashboard...</span></div>;

  return (
    <div className="dashboard-page">
      <div className="dash-bg-orb" />
      <div className="dash-container">

        {/* Welcome Header */}
        <div className="dash-header fade-up">
          <div>
            <h1>Welcome back, <span>{user?.name?.split(' ')[0]}</span> 👋</h1>
            <p>Farmer ID: <strong>{user?.farmerId||'N/A'}</strong> · {user?.district||'District N/A'}, {user?.state||'State N/A'}</p>
          </div>
          <div className="dash-right">
            <div className={`kyc-status-badge kyc-${user?.kycStatus}`}>
              {user?.kycStatus === 'verified' ? '✅ KYC Verified' : user?.kycStatus === 'pending' ? '⏳ KYC Pending' : '❌ KYC Rejected'}
            </div>
          </div>
        </div>

        {/* Alerts Banner */}
        {alerts.filter(a=>a.severity==='danger'||a.severity==='warning').slice(0,1).map(a => (
          <div className={`alert-banner sev-${a.severity}`} key={a._id}>
            <span>{a.severity==='danger'?'🚨':'⚠️'}</span>
            <div><strong>{a.title}</strong> — {a.description.slice(0,120)}...</div>
          </div>
        ))}

        {/* Stats Grid */}
        <div className="stats-grid fade-up">
          {[
            { label:'Estimations', value: stats?.totalEstimations||0, icon:'📊', color:'green' },
            { label:'Avg Yield', value: stats?.avgYield?.avg ? `${stats.avgYield.avg.toFixed(2)} t/ha` : '—', icon:'🌾', color:'lime' },
            { label:'Total Production', value: `${totalProduction.toFixed(1)} t`, icon:'🏆', color:'gold' },
            { label:'Est. Revenue', value: totalRevenue ? `₹${(totalRevenue/100000).toFixed(1)}L` : '—', icon:'💰', color:'blue' },
            { label:'Land Holding', value: `${user?.totalLandHolding||0} ha`, icon:'🗺️', color:'purple' },
            { label:'Insurance Eligible', value: `${insuranceEligible} fields`, icon:'🛡️', color:'orange' },
          ].map(s => (
            <div className={`stat-card stat-${s.color}`} key={s.label}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-val">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="dash-tabs fade-up">
          {['overview','history','schemes','alerts'].map(t => (
            <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
              {t==='overview'?'📊 Overview':t==='history'?'📋 History':t==='schemes'?'🏛️ Schemes':'⚠️ Alerts'}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="tab-content">
            <div className="charts-grid fade-up">
              <div className="chart-card card">
                <h3>Yield Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={11} />
                    <Tooltip contentStyle={{ background:'#0a2e1a', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'10px', color:'#f0fdf4' }} />
                    <Line type="monotone" dataKey="yield" stroke="#4ade80" strokeWidth={2.5} dot={{ fill:'#4ade80', r:4 }} name="Yield (t/ha)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card card">
                <h3>By Variety</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={varietyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={11} />
                    <Tooltip contentStyle={{ background:'#0a2e1a', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'10px', color:'#f0fdf4' }} />
                    <Bar dataKey="avgYield" fill="#16a34a" radius={[6,6,0,0]} name="Avg Yield" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {radarData.length > 0 && (
                <div className="chart-card card">
                  <h3>Latest Efficiency Scores</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(74,222,128,0.15)" />
                      <PolarAngleAxis dataKey="subject" fontSize={11} stroke="#6b7280" />
                      <Radar name="Score" dataKey="A" stroke="#4ade80" fill="#4ade80" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="chart-card card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <a href="/#estimator" className="qa-btn"><span>⚡</span><div><strong>New Estimation</strong><p>Run AI yield prediction</p></div></a>
                  <a href="/calendar" className="qa-btn"><span>📅</span><div><strong>Crop Calendar</strong><p>Season-wise crop guide</p></div></a>
                  <a href="/chat" className="qa-btn"><span>🤖</span><div><strong>AI Assistant</strong><p>Ask farming questions</p></div></a>
                  <a href="/market" className="qa-btn"><span>📈</span><div><strong>Market Prices</strong><p>Latest MSP & rates</p></div></a>
                  <a href="/alerts" className="qa-btn"><span>⚠️</span><div><strong>Weather Alerts</strong><p>Regional advisories</p></div></a>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="tab-content fade-up">
            <div className="table-section card">
              <div className="table-header">
                <h3>Estimation History</h3>
                <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                  <span className="record-count">{estimations.length} records</span>
                  <a href="/api/estimations/export" className="btn btn-outline btn-sm" download>⬇️ Export CSV</a>
                </div>
              </div>
              {estimations.length === 0 ? (
                <div className="empty-state"><span>🌾</span><p>No estimations yet. <a href="/#estimator">Run your first estimation →</a></p></div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Variety</th><th>Season</th><th>Area</th><th>Yield</th><th>Production</th><th>Revenue</th><th>Insurance</th><th>Subsidy</th><th>Date</th></tr></thead>
                    <tbody>
                      {estimations.map(e => (
                        <tr key={e._id}>
                          <td><span className="variety-tag">{e.riceVariety}</span></td>
                          <td>{e.season}</td>
                          <td>{e.fieldArea} ha</td>
                          <td><strong style={{color:'#4ade80'}}>{e.yieldPerHectare} t/ha</strong></td>
                          <td>{e.totalProduction} t</td>
                          <td>{e.estimatedRevenue ? `₹${e.estimatedRevenue.toLocaleString('en-IN')}` : '—'}</td>
                          <td>{e.insuranceEligible ? <span style={{color:'#4ade80'}}>✅ Eligible</span> : '—'}</td>
                          <td>{e.subsidyAmount ? `₹${e.subsidyAmount.toLocaleString('en-IN')}` : '—'}</td>
                          <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'schemes' && (
          <div className="tab-content fade-up">
            <div className="schemes-mini-grid">
              {schemes.slice(0,4).map(s => (
                <div className="scheme-mini card" key={s._id}>
                  <div className="sm-type">{s.schemeType.toUpperCase()}</div>
                  <h4>{s.name}</h4>
                  <p>{s.description.slice(0,100)}...</p>
                  {s.maxBenefitAmount && <div className="sm-amount">₹{s.maxBenefitAmount.toLocaleString('en-IN')}</div>}
                  <a href="/schemes" className="btn btn-outline btn-sm" style={{marginTop:'12px'}}>Learn More →</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'alerts' && (
          <div className="tab-content fade-up">
            {alerts.length === 0 ? (
              <div className="card" style={{padding:'40px',textAlign:'center',color:'var(--text-muted)'}}>✅ No active alerts for your region.</div>
            ) : alerts.map(a => (
              <div className={`alert-card-dash card sev-${a.severity}`} key={a._id}>
                <div className="acd-top"><span className="acd-sev">{a.severity==='danger'?'🚨':'⚠️'} {a.severity.toUpperCase()}</span><span className="acd-type">{a.alertType}</span></div>
                <h4>{a.title}</h4>
                <p>{a.description}</p>
                {a.affectedDistricts?.includes(user?.district) && <div className="acd-affects-you">📍 This alert affects your district: {user?.district}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
