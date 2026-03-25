import React, { useEffect, useState, useCallback } from 'react';
import { getAdminStats, getAdminUsers, toggleUserActive, updateUserRole, verifyKyc, getAdminAlerts, createAlert, deleteAlert, getAdminSchemes, createScheme, getMarketPrices, updateMarketPrice } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { io } from 'socket.io-client';
import './AdminPage.css';

const COLORS = ['#16a34a','#4ade80','#f59e0b','#60a5fa','#c084fc','#fb7185'];
const ROLE_OPTIONS = ['farmer','officer','scientist','district_admin','state_admin','super_admin'];
const ROLE_COLORS = { farmer:'#4ade80', officer:'#60a5fa', scientist:'#c084fc', district_admin:'#f59e0b', state_admin:'#fb923c', super_admin:'#ef4444' };

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [prices, setPrices] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showSchemeForm, setShowSchemeForm] = useState(false);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [alertForm, setAlertForm] = useState({ title:'', description:'', severity:'warning', alertType:'flood', affectedStates:'', affectedDistricts:'', validUntil:'' });
  const [schemeForm, setSchemeForm] = useState({ name:'', description:'', ministry:'', schemeType:'subsidy', eligibility:'', benefit:'', maxBenefitAmount:'' });
  const [priceForm, setPriceForm] = useState({ variety:'ir64', state:'', mspPrice:2183, marketPrice:'' });
  const [formMsg, setFormMsg] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [sRes, uRes, aRes, schRes, pRes] = await Promise.all([getAdminStats(), getAdminUsers(), getAdminAlerts(), getAdminSchemes(), getMarketPrices()]);
      setStats(sRes.data.data); setUsers(uRes.data.data); setAlerts(aRes.data.data); setSchemes(schRes.data.data); setPrices(pRes.data.data);
    } catch(e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const socket = io('http://localhost:5000');
    socket.on('new_estimation', data => { setLiveEvents(p => [data, ...p].slice(0,15)); fetchAll(); });
    socket.on('new_alert', () => fetchAll());
    socket.on('market_price_update', () => fetchAll());
    return () => socket.disconnect();
  }, [fetchAll]);

  const filteredUsers = users.filter(u =>
    (!userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()) || u.farmerId?.toLowerCase().includes(userSearch.toLowerCase())) &&
    (!userRoleFilter || u.role === userRoleFilter) &&
    (!kycFilter || u.kycStatus === kycFilter)
  );

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    try {
      await createAlert({ ...alertForm, affectedStates: alertForm.affectedStates.split(',').map(s=>s.trim()), affectedDistricts: alertForm.affectedDistricts.split(',').map(s=>s.trim()) });
      setFormMsg('Alert created!'); setShowAlertForm(false); fetchAll();
    } catch(err) { setFormMsg('Error: ' + err.message); }
  };
  const handleCreateScheme = async (e) => {
    e.preventDefault();
    try { await createScheme(schemeForm); setFormMsg('Scheme created!'); setShowSchemeForm(false); fetchAll(); }
    catch(err) { setFormMsg('Error: ' + err.message); }
  };
  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    try { await updateMarketPrice(priceForm); setFormMsg('Price updated!'); setShowPriceForm(false); fetchAll(); }
    catch(err) { setFormMsg('Error: ' + err.message); }
  };

  const monthlyData = stats?.monthlyTrend?.map(m => ({ name:`${m._id.month}/${m._id.year}`, estimations: m.count, avgYield: parseFloat(m.avgYield?.toFixed(2)||0) })) || [];
  const varietyData = stats?.byVariety?.map(v => ({ name: v._id?.toUpperCase(), count: v.count, avgYield: parseFloat(v.avgYield?.toFixed(2)||0), area: parseFloat(v.totalArea?.toFixed(1)||0) })) || [];
  const districtData = stats?.byDistrict?.map(d => ({ name: d._id||'Unknown', count: d.count, production: parseFloat(d.totalProduction?.toFixed(1)||0) })) || [];

  if (loading) return <div className="dash-loading"><div className="spinner"/><span>Loading admin dashboard...</span></div>;

  const TABS = [
    { id:'overview', label:'📊 Overview' },
    { id:'live', label:'🔴 Live Feed' },
    { id:'users', label:'👥 Users' },
    { id:'estimations', label:'🌾 Estimations' },
    { id:'alerts', label:'⚠️ Alerts' },
    { id:'schemes', label:'🏛️ Schemes' },
    { id:'market', label:'📈 Market' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-bg-orb" />
      <div className="admin-container">

        {/* Header */}
        <div className="admin-header fade-up">
          <div>
            <h1>🌾 RiceYield<span>AI</span> <span className="admin-badge-title">Admin</span></h1>
            <p>Government of India — Department of Agriculture & Farmers Welfare</p>
          </div>
          <div className="header-right">
            <div className="live-indicator"><span className="live-dot-pulse"/>LIVE</div>
            <div className="gov-seal">🇮🇳 Official Portal</div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="admin-kpis fade-up">
          {[
            { label:'Total Farmers', value: stats?.totalFarmers||0, icon:'👨‍🌾', sub:'Registered', color:'green' },
            { label:'Total Users', value: stats?.totalUsers||0, icon:'👥', sub:'All roles', color:'blue' },
            { label:'Estimations Today', value: stats?.todayEst||0, icon:'⚡', sub:'Since midnight', color:'gold' },
            { label:'This Month', value: stats?.monthEst||0, icon:'📅', sub:'Estimations', color:'purple' },
            { label:'Avg Yield', value: stats?.avgYield?.avg ? `${stats.avgYield.avg.toFixed(2)} t/ha` : '—', icon:'🏆', sub:'National average', color:'lime' },
            { label:'Total Production', value: stats?.avgYield?.totalProduction ? `${(stats.avgYield.totalProduction/1000).toFixed(1)}K t` : '—', icon:'🌾', sub:'All time', color:'orange' },
            { label:'Pending KYC', value: stats?.pendingKyc||0, icon:'🔐', sub:'Awaiting review', color:'red' },
            { label:'Active Alerts', value: stats?.activeAlerts||0, icon:'🚨', sub:'Weather & pest', color:'pink' },
          ].map(k => (
            <div className={`kpi-card card kpi-${k.color}`} key={k.label}>
              <div className="kpi-icon">{k.icon}</div>
              <div className="kpi-val">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs fade-up">
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="tab-content fade-up">
            <div className="charts-row">
              <div className="chart-card card">
                <h3>📈 Monthly Estimation Trend</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={monthlyData}>
                    <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/><stop offset="95%" stopColor="#16a34a" stopOpacity={0}/></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={11} />
                    <Tooltip contentStyle={{ background:'#0a2e1a', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'10px', color:'#f0fdf4' }} />
                    <Area type="monotone" dataKey="estimations" stroke="#16a34a" fill="url(#cg)" strokeWidth={2} name="Estimations" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card card">
                <h3>🌾 Variety Distribution</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={varietyData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                      {varietyData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background:'#0a2e1a', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'10px', color:'#f0fdf4' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="charts-row">
              <div className="chart-card card">
                <h3>📊 Top Districts by Estimations</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={districtData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                    <XAxis type="number" stroke="#6b7280" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} width={100} />
                    <Tooltip contentStyle={{ background:'#0a2e1a', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'10px', color:'#f0fdf4' }} />
                    <Bar dataKey="count" fill="#4ade80" radius={[0,6,6,0]} name="Estimations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card card">
                <h3>🏆 Avg Yield by Variety (t/ha)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={varietyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} />
                    <YAxis stroke="#6b7280" fontSize={11} />
                    <Tooltip contentStyle={{ background:'#0a2e1a', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'10px', color:'#f0fdf4' }} />
                    <Bar dataKey="avgYield" fill="#f59e0b" radius={[6,6,0,0]} name="Avg Yield" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Recent Estimations */}
            <div className="admin-table-card card">
              <h3>Recent Estimations</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Farmer</th><th>Farmer ID</th><th>District</th><th>State</th><th>Variety</th><th>Yield</th><th>Revenue Est.</th><th>Date</th></tr></thead>
                  <tbody>
                    {stats?.recentEst?.map(e => (
                      <tr key={e._id}>
                        <td>{e.userId?.name || <span className="guest-tag">Guest</span>}</td>
                        <td><span className="farmer-id">{e.userId?.farmerId || '—'}</span></td>
                        <td>{e.district || '—'}</td>
                        <td>{e.state || '—'}</td>
                        <td><span className="variety-tag">{e.riceVariety}</span></td>
                        <td><strong style={{color:'#4ade80'}}>{e.yieldPerHectare} t/ha</strong></td>
                        <td>₹{e.estimatedRevenue ? e.estimatedRevenue.toLocaleString('en-IN') : '—'}</td>
                        <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* LIVE FEED TAB */}
        {tab === 'live' && (
          <div className="tab-content fade-up">
            <div className="live-panel card">
              <div className="live-header">
                <h3>🔴 Real-Time Estimation Feed</h3>
                <span className="live-count">{liveEvents.length} events this session</span>
              </div>
              {liveEvents.length === 0 ? (
                <div className="live-empty">
                  <div className="live-dot-pulse big" />
                  <p>Waiting for new estimations...<br/><span>Events will appear here in real-time as farmers submit yield predictions.</span></p>
                </div>
              ) : (
                <div className="live-events-list">
                  {liveEvents.map((ev, i) => (
                    <div className="live-event-card" key={i} style={{animationDelay:`${i*0.05}s`}}>
                      <div className="le-left">
                        <span className="live-dot-sm"/>
                        <div>
                          <div className="le-variety">{ev.riceVariety?.toUpperCase()} — {ev.district||'Unknown District'}, {ev.state||'Unknown State'}</div>
                          <div className="le-meta">Yield: <strong>{ev.yieldPerHectare} t/ha</strong></div>
                        </div>
                      </div>
                      <div className="le-time">{new Date(ev.createdAt).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <div className="tab-content fade-up">
            <div className="users-filters card">
              <input className="search-input-sm" placeholder="🔍 Search name, email, farmer ID..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              <select value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <select value={kycFilter} onChange={e => setKycFilter(e.target.value)}>
                <option value="">All KYC</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <span className="result-count">{filteredUsers.length} users</span>
            </div>
            <div className="admin-table-card card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Farmer</th><th>ID</th><th>Email</th><th>Role</th><th>District</th><th>Estimations</th><th>KYC</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td><div className="user-row"><div className="user-av" style={{background:`linear-gradient(135deg,${ROLE_COLORS[u.role]||'#4ade80'},#16a34a)`}}>{u.name?.charAt(0).toUpperCase()}</div>{u.name}</div></td>
                        <td><span className="farmer-id">{u.farmerId||'—'}</span></td>
                        <td style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>{u.email}</td>
                        <td>
                          <select className="role-select" value={u.role} onChange={async(e) => { await updateUserRole(u._id, e.target.value); fetchAll(); }} style={{color:ROLE_COLORS[u.role]}}>
                            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td>{u.district||'—'}</td>
                        <td>{u.estimationCount||0}</td>
                        <td>
                          <select className="kyc-select" value={u.kycStatus} onChange={async(e) => { await verifyKyc(u._id, e.target.value); fetchAll(); }}>
                            <option value="pending">⏳ Pending</option>
                            <option value="verified">✅ Verified</option>
                            <option value="rejected">❌ Rejected</option>
                          </select>
                        </td>
                        <td><span className={`status-dot ${u.isActive?'active':'inactive'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                        <td><button className="action-btn" onClick={async()=>{await toggleUserActive(u._id);fetchAll();}}>{u.isActive?'Deactivate':'Activate'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ESTIMATIONS TAB */}
        {tab === 'estimations' && (
          <div className="tab-content fade-up">
            <div className="admin-table-card card">
              <h3>All Estimations ({stats?.recentEst?.length || 0} recent)</h3>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Farmer</th><th>Variety</th><th>District</th><th>Season</th><th>Area</th><th>NDVI</th><th>Yield</th><th>Production</th><th>Revenue</th><th>Insurance</th></tr></thead>
                  <tbody>
                    {stats?.recentEst?.map(e => (
                      <tr key={e._id}>
                        <td>{e.userId?.name||<span className="guest-tag">Guest</span>}</td>
                        <td><span className="variety-tag">{e.riceVariety}</span></td>
                        <td>{e.district||'—'}</td>
                        <td>{e.season}</td>
                        <td>{e.fieldArea} ha</td>
                        <td>{e.ndvi}</td>
                        <td><strong style={{color:'#4ade80'}}>{e.yieldPerHectare} t/ha</strong></td>
                        <td>{e.totalProduction} t</td>
                        <td>₹{e.estimatedRevenue?.toLocaleString('en-IN')||'—'}</td>
                        <td>{e.insuranceEligible ? <span className="insured">✅ Eligible</span> : <span style={{color:'var(--text-muted)'}}>—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ALERTS TAB */}
        {tab === 'alerts' && (
          <div className="tab-content fade-up">
            <div className="tab-actions">
              <h3>Weather & Pest Alerts ({alerts.length})</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAlertForm(s=>!s)}>{showAlertForm?'✕ Cancel':'+ New Alert'}</button>
            </div>
            {formMsg && <div className="success-msg">{formMsg}</div>}
            {showAlertForm && (
              <div className="form-card card">
                <form onSubmit={handleCreateAlert}>
                  <div className="form-grid-2">
                    <div className="form-group"><label>Title</label><input value={alertForm.title} onChange={e=>setAlertForm(f=>({...f,title:e.target.value}))} required/></div>
                    <div className="form-group"><label>Alert Type</label><select value={alertForm.alertType} onChange={e=>setAlertForm(f=>({...f,alertType:e.target.value}))}>{['flood','drought','cyclone','pest','disease','frost','heatwave'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                    <div className="form-group"><label>Severity</label><select value={alertForm.severity} onChange={e=>setAlertForm(f=>({...f,severity:e.target.value}))}><option value="info">Info</option><option value="warning">Warning</option><option value="danger">Danger</option></select></div>
                    <div className="form-group"><label>Valid Until</label><input type="date" value={alertForm.validUntil} onChange={e=>setAlertForm(f=>({...f,validUntil:e.target.value}))}/></div>
                    <div className="form-group"><label>Affected States (comma separated)</label><input value={alertForm.affectedStates} onChange={e=>setAlertForm(f=>({...f,affectedStates:e.target.value}))} placeholder="Tamil Nadu, Kerala"/></div>
                    <div className="form-group"><label>Affected Districts (comma separated)</label><input value={alertForm.affectedDistricts} onChange={e=>setAlertForm(f=>({...f,affectedDistricts:e.target.value}))} placeholder="Chennai, Cuddalore"/></div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}><label>Description</label><textarea value={alertForm.description} onChange={e=>setAlertForm(f=>({...f,description:e.target.value}))} rows={3} required/></div>
                  </div>
                  <button type="submit" className="btn btn-primary">🚨 Publish Alert</button>
                </form>
              </div>
            )}
            <div className="alerts-table card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Title</th><th>Type</th><th>Severity</th><th>States</th><th>Valid Until</th><th>Action</th></tr></thead>
                  <tbody>
                    {alerts.map(a => (
                      <tr key={a._id}>
                        <td><strong>{a.title}</strong></td>
                        <td><span className="variety-tag">{a.alertType}</span></td>
                        <td><span className={`sev-chip sev-${a.severity}`}>{a.severity}</span></td>
                        <td style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{a.affectedStates?.join(', ')||'—'}</td>
                        <td>{a.validUntil ? new Date(a.validUntil).toLocaleDateString() : '—'}</td>
                        <td><button className="action-btn danger" onClick={async()=>{await deleteAlert(a._id);fetchAll();}}>🗑️ Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SCHEMES TAB */}
        {tab === 'schemes' && (
          <div className="tab-content fade-up">
            <div className="tab-actions">
              <h3>Government Schemes ({schemes.length})</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowSchemeForm(s=>!s)}>{showSchemeForm?'✕ Cancel':'+ Add Scheme'}</button>
            </div>
            {showSchemeForm && (
              <div className="form-card card">
                <form onSubmit={handleCreateScheme}>
                  <div className="form-grid-2">
                    <div className="form-group"><label>Scheme Name</label><input value={schemeForm.name} onChange={e=>setSchemeForm(f=>({...f,name:e.target.value}))} required/></div>
                    <div className="form-group"><label>Ministry</label><input value={schemeForm.ministry} onChange={e=>setSchemeForm(f=>({...f,ministry:e.target.value}))}/></div>
                    <div className="form-group"><label>Type</label><select value={schemeForm.schemeType} onChange={e=>setSchemeForm(f=>({...f,schemeType:e.target.value}))}>{['subsidy','insurance','loan','training','equipment'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                    <div className="form-group"><label>Max Benefit (₹)</label><input type="number" value={schemeForm.maxBenefitAmount} onChange={e=>setSchemeForm(f=>({...f,maxBenefitAmount:e.target.value}))}/></div>
                    <div className="form-group"><label>Eligibility</label><input value={schemeForm.eligibility} onChange={e=>setSchemeForm(f=>({...f,eligibility:e.target.value}))}/></div>
                    <div className="form-group"><label>Benefit</label><input value={schemeForm.benefit} onChange={e=>setSchemeForm(f=>({...f,benefit:e.target.value}))}/></div>
                    <div className="form-group" style={{gridColumn:'1/-1'}}><label>Description</label><textarea value={schemeForm.description} onChange={e=>setSchemeForm(f=>({...f,description:e.target.value}))} rows={3} required/></div>
                  </div>
                  <button type="submit" className="btn btn-primary">🏛️ Add Scheme</button>
                </form>
              </div>
            )}
            <div className="admin-table-card card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Scheme</th><th>Ministry</th><th>Type</th><th>Max Benefit</th><th>Status</th></tr></thead>
                  <tbody>
                    {schemes.map(s => (
                      <tr key={s._id}>
                        <td><strong>{s.name}</strong></td>
                        <td style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>{s.ministry||'—'}</td>
                        <td><span className="variety-tag">{s.schemeType}</span></td>
                        <td>{s.maxBenefitAmount ? `₹${s.maxBenefitAmount.toLocaleString('en-IN')}` : '—'}</td>
                        <td><span className={`status-dot ${s.isActive?'active':'inactive'}`}>{s.isActive?'Active':'Inactive'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MARKET TAB */}
        {tab === 'market' && (
          <div className="tab-content fade-up">
            <div className="tab-actions">
              <h3>Market Prices ({prices.length})</h3>
              <button className="btn btn-primary btn-sm" onClick={() => setShowPriceForm(s=>!s)}>{showPriceForm?'✕ Cancel':'+ Update Price'}</button>
            </div>
            {showPriceForm && (
              <div className="form-card card">
                <form onSubmit={handleUpdatePrice}>
                  <div className="form-grid-2">
                    <div className="form-group"><label>Variety</label><select value={priceForm.variety} onChange={e=>setPriceForm(f=>({...f,variety:e.target.value}))}>{['ir64','swarna','basmati','dhan','br11','samba'].map(v=><option key={v} value={v}>{v}</option>)}</select></div>
                    <div className="form-group"><label>State</label><input value={priceForm.state} onChange={e=>setPriceForm(f=>({...f,state:e.target.value}))} required placeholder="e.g. Tamil Nadu"/></div>
                    <div className="form-group"><label>MSP Price (₹/qtl)</label><input type="number" value={priceForm.mspPrice} onChange={e=>setPriceForm(f=>({...f,mspPrice:parseFloat(e.target.value)}))}/></div>
                    <div className="form-group"><label>Market Price (₹/qtl)</label><input type="number" value={priceForm.marketPrice} onChange={e=>setPriceForm(f=>({...f,marketPrice:parseFloat(e.target.value)}))} required/></div>
                  </div>
                  <button type="submit" className="btn btn-primary">📈 Update Price</button>
                </form>
              </div>
            )}
            <div className="admin-table-card card">
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Variety</th><th>State</th><th>MSP (₹/qtl)</th><th>Market Price</th><th>Premium/Discount</th><th>Date</th></tr></thead>
                  <tbody>
                    {prices.map((p,i) => {
                      const diff = p.marketPrice - (p.mspPrice||2183);
                      return (
                        <tr key={i}>
                          <td><span className="variety-tag">{p.variety}</span></td>
                          <td>{p.state}</td>
                          <td>₹{(p.mspPrice||2183).toLocaleString('en-IN')}</td>
                          <td><strong style={{color:'#4ade80'}}>₹{p.marketPrice.toLocaleString('en-IN')}</strong></td>
                          <td><span className={diff>=0?'diff-pos':'diff-neg'}>{diff>=0?'▲':'▼'} ₹{Math.abs(diff)}</span></td>
                          <td>{new Date(p.priceDate||p.createdAt).toLocaleDateString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
