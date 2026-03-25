import React, { useEffect, useState } from 'react';
import { getPublicMarketPrices } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './MarketPage.css';

const VARIETY_NAMES = { ir64:'IR64', swarna:'Swarna', basmati:'Basmati', dhan:'MTU-7029', br11:'BR11', samba:'Samba Mahsuri' };

export default function MarketPage() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const MSP_2024 = 2183;

  useEffect(() => {
    getPublicMarketPrices().then(r => setPrices(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const mockTrend = Array.from({length:7},(_,i) => ({ day:`Day ${i+1}`, price: 2100 + Math.random()*300 }));

  return (
    <div className="market-page">
      <div className="market-container">
        <div className="market-header fade-up">
          <div className="page-tag">📈 Live Market Data</div>
          <h1>Rice Market Prices</h1>
          <p>Minimum Support Price (MSP) and live market rates across India</p>
        </div>

        <div className="msp-banner fade-up">
          <div className="msp-inner">
            <div className="msp-icon">🏛️</div>
            <div>
              <div className="msp-title">Government MSP 2024-25</div>
              <div className="msp-value">₹{MSP_2024.toLocaleString('en-IN')} <span>/quintal</span></div>
              <div className="msp-note">Common Grade Rice — Announced by Cabinet Committee on Economic Affairs</div>
            </div>
          </div>
        </div>

        {loading ? <div className="dash-loading"><div className="spinner"/><span>Loading prices...</span></div> : (
          <>
            <div className="prices-grid fade-up">
              {prices.map((p, i) => {
                const diff = p.marketPrice - (p.mspPrice || MSP_2024);
                const pct = ((diff / (p.mspPrice || MSP_2024)) * 100).toFixed(1);
                return (
                  <div className="price-card card" key={i}>
                    <div className="price-variety">{VARIETY_NAMES[p.variety] || p.variety}</div>
                    <div className="price-state">{p.state} {p.district && `• ${p.district}`}</div>
                    <div className="price-main">₹{p.marketPrice.toLocaleString('en-IN')}<span>/qtl</span></div>
                    <div className={`price-msp-diff ${diff >= 0 ? 'positive' : 'negative'}`}>
                      {diff >= 0 ? '▲' : '▼'} {Math.abs(diff)} vs MSP ({diff >= 0 ? '+' : ''}{pct}%)
                    </div>
                    <div className="price-msp">MSP: ₹{(p.mspPrice || MSP_2024).toLocaleString('en-IN')}/qtl</div>
                    <div className="price-date">📅 {new Date(p.priceDate || p.createdAt).toLocaleDateString()}</div>
                  </div>
                );
              })}
            </div>

            <div className="trend-section card fade-up">
              <h3>📊 Price Trend (Last 7 Days - Sample)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(74,222,128,0.1)" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} domain={[1800,2600]} />
                  <Tooltip contentStyle={{ background:'#0a2e1a', border:'1px solid rgba(74,222,128,0.2)', borderRadius:'10px', color:'#f0fdf4' }} formatter={(v) => [`₹${Math.round(v)}/qtl`,'Price']} />
                  <Line type="monotone" dataKey="price" stroke="#4ade80" strokeWidth={2.5} dot={{ fill:'#4ade80', r:4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        <div className="market-info card fade-up">
          <h3>ℹ️ About Market Prices</h3>
          <div className="info-grid">
            {[
              { icon:'🏛️', title:'MSP', desc:'Minimum Support Price is the government guaranteed price. Farmers are entitled to at least this price for their produce.' },
              { icon:'🏪', title:'Mandi Price', desc:'Actual price at Agricultural Produce Market Committee (APMC) mandis. May vary based on quality and demand.' },
              { icon:'📱', title:'eNAM Portal', desc:'National Agriculture Market (eNAM) provides online trading platform to link mandis across India.' },
              { icon:'📞', title:'Helpline', desc:'Kisan Call Center: 1800-180-1551 (Toll Free). Available in all regional languages.' },
            ].map(info => (
              <div className="info-item" key={info.title}>
                <div className="info-icon">{info.icon}</div>
                <div><strong>{info.title}</strong><p>{info.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
