import React, { useEffect, useState } from 'react';
import { getEstimations, getEstimationStats, getAnalytics } from '../utils/api';
import './AdminPage.css';

export default function AdminPage() {
  const [estimations, setEstimations] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('estimations');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAll();
  }, [page]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [estRes, statsRes, analyticsRes] = await Promise.all([
        getEstimations(page),
        getEstimationStats(),
        getAnalytics(),
      ]);
      setEstimations(estRes.data.data);
      setTotalPages(estRes.data.pages);
      setStats(statsRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (e) {
      console.error('Admin fetch error:', e);
    }
    setLoading(false);
  };

  const fmt = (n) => typeof n === 'number' ? n.toFixed(2) : n;
  const fmtDate = (d) => new Date(d).toLocaleString();

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-logo">🌾 RiceYield<span>AI</span> <span className="admin-badge">Admin Panel</span></div>
        <div className="admin-subtitle">All user interactions stored in MongoDB</div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="admin-cards">
          <div className="admin-card">
            <div className="ac-label">Total Estimations</div>
            <div className="ac-value">{stats.totalEstimations}</div>
          </div>
          <div className="admin-card">
            <div className="ac-label">Avg Yield</div>
            <div className="ac-value">{fmt(stats.avgYield?.avg)} t/ha</div>
          </div>
          <div className="admin-card">
            <div className="ac-label">Max Yield</div>
            <div className="ac-value">{fmt(stats.avgYield?.max)} t/ha</div>
          </div>
          <div className="admin-card">
            <div className="ac-label">Page Views</div>
            <div className="ac-value">{analytics?.totalViews ?? '—'}</div>
          </div>
          <div className="admin-card">
            <div className="ac-label">Unique Visitors</div>
            <div className="ac-value">{analytics?.uniqueVisitors ?? '—'}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        {['estimations','by-variety','by-season','analytics'].map(t => (
          <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
            {t.replace('-',' ').replace(/\b\w/g,c=>c.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading">⏳ Loading from MongoDB...</div>
      ) : (
        <>
          {/* All Estimations Table */}
          {tab === 'estimations' && (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>MongoDB _id</th><th>Date</th><th>Variety</th><th>Season</th>
                    <th>Area (ha)</th><th>NDVI</th><th>LAI</th><th>Irrigation</th>
                    <th>N (kg/ha)</th><th>Yield (t/ha)</th><th>Total (t)</th><th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {estimations.map(e => (
                    <tr key={e._id}>
                      <td className="mono small">{e._id}</td>
                      <td className="mono small">{fmtDate(e.createdAt)}</td>
                      <td>{e.riceVariety}</td>
                      <td>{e.season}</td>
                      <td>{e.fieldArea}</td>
                      <td>{e.ndvi}</td>
                      <td>{e.lai}</td>
                      <td>{e.irrigation}</td>
                      <td>{e.nitrogen}</td>
                      <td className="yield-cell">{e.yieldPerHectare}</td>
                      <td>{e.totalProduction}</td>
                      <td className="mono small">{e.confidenceIntervalLow}–{e.confidenceIntervalHigh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
              </div>
            </div>
          )}

          {/* By Variety */}
          {tab === 'by-variety' && stats && (
            <div className="table-wrap">
              <table className="admin-table">
                <thead><tr><th>Rice Variety</th><th>Submissions</th><th>Avg Yield (t/ha)</th></tr></thead>
                <tbody>
                  {stats.byVariety?.map(v => (
                    <tr key={v._id}>
                      <td>{v._id}</td>
                      <td>{v.count}</td>
                      <td className="yield-cell">{fmt(v.avgYield)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* By Season */}
          {tab === 'by-season' && stats && (
            <div className="table-wrap">
              <table className="admin-table">
                <thead><tr><th>Season</th><th>Submissions</th><th>Avg Yield (t/ha)</th></tr></thead>
                <tbody>
                  {stats.bySeason?.map(s => (
                    <tr key={s._id}>
                      <td>{s._id}</td>
                      <td>{s.count}</td>
                      <td className="yield-cell">{fmt(s.avgYield)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Analytics */}
          {tab === 'analytics' && analytics && (
            <div className="table-wrap">
              <h3 className="sub-head">Daily Page Views (Last 7 Days)</h3>
              <table className="admin-table">
                <thead><tr><th>Date</th><th>Views</th></tr></thead>
                <tbody>
                  {analytics.last7Days?.map(d => (
                    <tr key={d._id}><td>{d._id}</td><td>{d.count}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <div className="admin-footer">
        <div className="mongo-tip">
          💡 <strong>Open MongoDB Compass</strong> → Connect using your MONGO_URI → Database: <code>riceyield</code> → Collections: <code>estimations</code>, <code>contacts</code>, <code>pageviews</code>
        </div>
      </div>
    </div>
  );
}
