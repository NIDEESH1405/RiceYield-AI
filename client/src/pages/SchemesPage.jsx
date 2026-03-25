import React, { useEffect, useState } from 'react';
import { getPublicSchemes } from '../utils/api';
import './SchemesPage.css';

const TYPE_ICONS = { subsidy:'💰', insurance:'🛡️', loan:'🏦', training:'📚', equipment:'🚜' };
const TYPE_COLORS = { subsidy:'green', insurance:'blue', loan:'gold', training:'purple', equipment:'orange' };

export default function SchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicSchemes().then(r => setSchemes(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = schemes.filter(s =>
    (filter === 'all' || s.schemeType === filter) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="schemes-page">
      <div className="schemes-bg-orb" />
      <div className="schemes-container">
        <div className="schemes-header fade-up">
          <div className="page-tag">🏛️ Government of India</div>
          <h1>Agricultural Schemes & Benefits</h1>
          <p>Explore all government schemes, subsidies, and support programs for farmers</p>
        </div>

        <div className="schemes-filters fade-up">
          <input className="search-input" type="text" placeholder="🔍 Search schemes..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="filter-tabs">
            {['all','subsidy','insurance','loan','training','equipment'].map(t => (
              <button key={t} className={`filter-tab ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
                {TYPE_ICONS[t] || '📋'} {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div className="dash-loading"><div className="spinner"/><span>Loading schemes...</span></div> : (
          <div className="schemes-grid fade-up">
            {filtered.length === 0 ? (
              <div className="empty-schemes">No schemes found matching your search.</div>
            ) : filtered.map(s => (
              <div className={`scheme-card card type-${TYPE_COLORS[s.schemeType]}`} key={s._id}>
                <div className="scheme-type-badge">
                  <span>{TYPE_ICONS[s.schemeType]} {s.schemeType.toUpperCase()}</span>
                </div>
                <h3>{s.name}</h3>
                <p className="scheme-ministry">🏛️ {s.ministry || 'Ministry of Agriculture'}</p>
                <p className="scheme-desc">{s.description}</p>
                {s.eligibility && <div className="scheme-detail"><strong>✅ Eligibility:</strong> {s.eligibility}</div>}
                {s.benefit && <div className="scheme-detail"><strong>🎁 Benefit:</strong> {s.benefit}</div>}
                {s.maxBenefitAmount && (
                  <div className="scheme-amount">
                    Max Benefit: <span>₹{s.maxBenefitAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {s.deadline && <div className="scheme-deadline">⏰ Deadline: {new Date(s.deadline).toLocaleDateString()}</div>}
                <div className="scheme-actions">
                  {s.applicationUrl ? (
                    <a href={s.applicationUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Apply Now →</a>
                  ) : (
                    <a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Learn More</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
