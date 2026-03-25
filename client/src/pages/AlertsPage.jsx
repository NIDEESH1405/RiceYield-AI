import React, { useEffect, useState } from 'react';
import { getPublicAlerts } from '../utils/api';
import './AlertsPage.css';

const SEV_CONFIG = {
  info: { icon:'ℹ️', color:'blue', label:'Advisory' },
  warning: { icon:'⚠️', color:'gold', label:'Warning' },
  danger: { icon:'🚨', color:'red', label:'DANGER' },
};
const TYPE_ICONS = { flood:'🌊', drought:'☀️', cyclone:'🌀', pest:'🐛', disease:'🦠', frost:'❄️', heatwave:'🔥' };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getPublicAlerts().then(r => setAlerts(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div className="alerts-page">
      <div className="alerts-container">
        <div className="alerts-header fade-up">
          <div className="page-tag danger-tag">🚨 Live Alerts System</div>
          <h1>Agricultural Weather & Pest Alerts</h1>
          <p>Real-time advisories from the Department of Agriculture & Farmers Welfare</p>
        </div>

        <div className="alert-filter-tabs fade-up">
          {['all','info','warning','danger'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active-' + f : ''} filter-tab`} onClick={() => setFilter(f)}>
              {f === 'all' ? '📋 All' : f === 'info' ? 'ℹ️ Advisory' : f === 'warning' ? '⚠️ Warning' : '🚨 Danger'}
            </button>
          ))}
        </div>

        {loading ? <div className="dash-loading"><div className="spinner"/><span>Loading alerts...</span></div> : (
          <div className="alerts-list fade-up">
            {filtered.length === 0 ? (
              <div className="no-alerts card">
                <span>✅</span>
                <h3>No Active Alerts</h3>
                <p>No weather or pest alerts for your region at this time.</p>
              </div>
            ) : filtered.map(a => {
              const cfg = SEV_CONFIG[a.severity] || SEV_CONFIG.info;
              return (
                <div className={`alert-card card sev-${cfg.color}`} key={a._id}>
                  <div className="alert-top">
                    <div className="alert-badge-sev">{cfg.icon} {cfg.label}</div>
                    <div className="alert-type">{TYPE_ICONS[a.alertType]} {a.alertType?.toUpperCase()}</div>
                    <div className="alert-date">{new Date(a.createdAt).toLocaleDateString()}</div>
                  </div>
                  <h3>{a.title}</h3>
                  <p>{a.description}</p>
                  <div className="alert-meta">
                    {a.affectedStates?.length > 0 && <div className="alert-region"><strong>States:</strong> {a.affectedStates.join(', ')}</div>}
                    {a.affectedDistricts?.length > 0 && <div className="alert-region"><strong>Districts:</strong> {a.affectedDistricts.join(', ')}</div>}
                    {a.validUntil && <div className="alert-valid">Valid until: {new Date(a.validUntil).toLocaleDateString()}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
