import React, { useState } from 'react';
import './CropCalendarPage.css';

const CALENDARS = {
  kharif: {
    label: 'Kharif (Jun–Nov)',
    color: '#4ade80',
    stages: [
      { month: 'June', week: '1–2', stage: 'Land Preparation', icon: '🚜', tasks: ['Plough field 2–3 times','Puddling for lowland rice','Apply basal fertilizer (FYM)','Prepare nursery beds'], tips: 'Ensure proper levelling for uniform water distribution.' },
      { month: 'June', week: '3–4', stage: 'Nursery & Sowing', icon: '🌱', tasks: ['Seed treatment with fungicide','Sow pre-germinated seeds','Maintain 2–3 cm water in nursery','Apply N @ 20 kg/ha in nursery'], tips: 'Use 25 kg seed per hectare. Maintain proper spacing.' },
      { month: 'July', week: '1–2', stage: 'Transplanting', icon: '🌿', tasks: ['Transplant 21-day old seedlings','Spacing: 20×15 cm','Apply basal dose NPK','Maintain 2–5 cm water level'], tips: 'Transplant 2–3 seedlings per hill at 2–3 cm depth.' },
      { month: 'July', week: '3–4', stage: 'Tillering', icon: '🌾', tasks: ['Weed management (first hand weeding)','Apply N @ 40 kg/ha (1st top dress)','Monitor for stem borer','Water management: AWD method'], tips: 'Critical stage for tiller formation. Keep adequate moisture.' },
      { month: 'August', week: '1–4', stage: 'Active Tillering / PI', icon: '🌿', tasks: ['2nd weeding if needed','Apply K @ 30 kg/ha','Scout for blast disease','Apply N @ 30 kg/ha (2nd top dress)'], tips: 'Panicle initiation is critical — maintain water table.' },
      { month: 'September', week: '1–2', stage: 'Booting / Heading', icon: '🌸', tasks: ['Apply fungicide if blast risk','Maintain flood irrigation','Apply micronutrients if needed','Monitor for neck blast'], tips: 'Do NOT apply N at this stage — may cause lodging.' },
      { month: 'September', week: '3–4', stage: 'Flowering', icon: '🌼', tasks: ['Ensure water availability','Avoid pesticide spraying','Protect from birds','Monitor grain filling'], tips: 'Flooding during flowering is harmful. Maintain shallow water.' },
      { month: 'October', week: '1–4', stage: 'Grain Filling / Maturity', icon: '🌾', tasks: ['Drain field 2 weeks before harvest','Monitor for false smut','Check moisture content','Arrange harvesting equipment'], tips: 'Harvest at 80% golden straw when grain moisture is 20–25%.' },
      { month: 'November', week: '1–2', stage: 'Harvest & Post-harvest', icon: '🏆', tasks: ['Mechanical or manual harvest','Thresh within 24 hrs','Dry to 14% moisture','Proper storage in bags'], tips: 'Avoid field losses. Bag and store in cool dry place.' },
    ]
  },
  rabi: {
    label: 'Rabi (Nov–Apr)',
    color: '#f59e0b',
    stages: [
      { month: 'November', week: '1–2', stage: 'Land Preparation', icon: '🚜', tasks: ['Deep ploughing','Incorporate stubble','Apply lime if pH < 5.5','Prepare beds'], tips: 'Rabi rice needs well-drained fields. Avoid waterlogging.' },
      { month: 'November', week: '3–4', stage: 'Sowing / Nursery', icon: '🌱', tasks: ['Seed treatment','Sow nursery','Apply basal FYM','Irrigate nursery'], tips: 'Use short-duration (100–115 day) varieties for Rabi.' },
      { month: 'December', week: '1–2', stage: 'Transplanting', icon: '🌿', tasks: ['Transplant 25-day seedlings','Spacing 20×20 cm','Apply basal NPK','First irrigation'], tips: 'Cooler weather slows growth — use slightly older seedlings.' },
      { month: 'December–January', week: '3–8', stage: 'Vegetative Growth', icon: '🌿', tasks: ['Regular irrigation','N top-dressing @ 30 kg/ha','Weed management','Watch for cold stress'], tips: 'Protect crop from cold waves using light irrigation at night.' },
      { month: 'February', week: '1–4', stage: 'Reproductive Stage', icon: '🌸', tasks: ['Ensure water availability','Apply K top-dressing','Spray micronutrients','Monitor for pest/disease'], tips: 'Rabi flowering at lower temps — ensure proper irrigation.' },
      { month: 'March', week: '1–4', stage: 'Grain Filling', icon: '🌾', tasks: ['Reduce irrigation','Monitor for stem borer','Apply foliar spray if needed','Arrange thresher'], tips: 'Warm days accelerate grain filling. Watch for quality loss.' },
      { month: 'April', week: '1–2', stage: 'Harvest', icon: '🏆', tasks: ['Harvest at right moisture','Dry grain to 14%','Store properly','Document yield'], tips: 'Harvest before summer heat peaks to avoid quality loss.' },
    ]
  },
  boro: {
    label: 'Boro (Dec–May)',
    color: '#60a5fa',
    stages: [
      { month: 'December', week: '1–2', stage: 'Nursery', icon: '🌱', tasks: ['Prepare poly-tunnels for nursery','Sow seeds under cover','Provide supplemental warmth','Monitor for damping off'], tips: 'Boro requires intensive irrigation. Plan water source carefully.' },
      { month: 'January', week: '1–2', stage: 'Transplanting', icon: '🌿', tasks: ['Transplant 30-day seedlings','Use higher density planting','Apply full basal dose','Ensure irrigation infrastructure'], tips: 'Cold weather at transplanting — use 30+ day older seedlings.' },
      { month: 'January–March', week: 'All', stage: 'Vegetative Growth', icon: '🌿', tasks: ['Intensive irrigation (every 2–3 days)','Split N application x3','Weed control','Micronutrient management'], tips: 'Boro has highest water demand. AWD not recommended in winter.' },
      { month: 'April', week: '1–2', stage: 'Reproductive', icon: '🌸', tasks: ['Maintain irrigation','Apply K @ 40 kg/ha','Fungicide application','Monitor blast risk'], tips: 'April heat can cause spikelet sterility — maintain cool water.' },
      { month: 'April–May', week: '3–8', stage: 'Maturity & Harvest', icon: '🏆', tasks: ['Drain field gradually','Harvest mechanically if possible','Quick threshing due to heat','Immediate drying'], tips: 'Harvest quickly before monsoon. Boro has best milling quality.' },
    ]
  }
};

const MONTH_COLORS = {
  'June':'#22c55e','July':'#4ade80','August':'#86efac','September':'#fbbf24',
  'October':'#f59e0b','November':'#ef4444','December':'#60a5fa','January':'#93c5fd',
  'February':'#a78bfa','March':'#34d399','April':'#fb923c','May':'#f97316',
  'December–January':'#818cf8'
};

export default function CropCalendarPage() {
  const [season, setSeason] = useState('kharif');
  const [activeStage, setActiveStage] = useState(null);
  const cal = CALENDARS[season];

  return (
    <div className="calendar-page">
      <div className="calendar-container">
        <div className="calendar-header fade-up">
          <div className="page-tag">🗓️ Crop Calendar</div>
          <h1>Rice Cultivation Calendar</h1>
          <p>Season-wise crop management guide for Indian rice farmers</p>
        </div>

        <div className="season-tabs fade-up">
          {Object.entries(CALENDARS).map(([key, c]) => (
            <button key={key} className={`season-tab ${season === key ? 'active' : ''}`}
              style={season === key ? { borderColor: c.color, color: c.color } : {}}
              onClick={() => { setSeason(key); setActiveStage(null); }}>
              {key === 'kharif' ? '☔' : key === 'rabi' ? '☀️' : '❄️'} {c.label}
            </button>
          ))}
        </div>

        {/* Timeline */}
        <div className="timeline-wrap fade-up">
          <div className="timeline-line" style={{ background: `linear-gradient(to right, ${cal.color}, transparent)` }} />
          <div className="timeline-stages">
            {cal.stages.map((s, i) => (
              <div key={i} className={`timeline-stage ${activeStage === i ? 'active' : ''}`}
                onClick={() => setActiveStage(activeStage === i ? null : i)}>
                <div className="ts-icon">{s.icon}</div>
                <div className="ts-month" style={{ color: MONTH_COLORS[s.month] || cal.color }}>{s.month}</div>
                <div className="ts-week">Wk {s.week}</div>
                <div className="ts-label">{s.stage}</div>
                <div className="ts-dot" style={{ background: activeStage === i ? cal.color : 'var(--slate-light)' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {activeStage !== null && (
          <div className="stage-detail card fade-up" style={{ borderColor: cal.color + '40' }}>
            <div className="sd-header">
              <span className="sd-icon">{cal.stages[activeStage].icon}</span>
              <div>
                <h3>{cal.stages[activeStage].stage}</h3>
                <span className="sd-period" style={{ color: cal.color }}>
                  {cal.stages[activeStage].month} · Week {cal.stages[activeStage].week}
                </span>
              </div>
              <button className="sd-close" onClick={() => setActiveStage(null)}>✕</button>
            </div>
            <div className="sd-body">
              <div className="sd-tasks">
                <div className="sd-section-title">📋 Key Tasks</div>
                {cal.stages[activeStage].tasks.map((t, i) => (
                  <div key={i} className="sd-task"><span className="task-dot" style={{ background: cal.color }} />{t}</div>
                ))}
              </div>
              <div className="sd-tip">
                <div className="sd-section-title">💡 Expert Tip</div>
                <p>{cal.stages[activeStage].tips}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Grid */}
        <div className="stages-grid fade-up">
          {cal.stages.map((s, i) => (
            <div key={i} className={`stage-card card ${activeStage === i ? 'active' : ''}`}
              onClick={() => setActiveStage(activeStage === i ? null : i)}
              style={activeStage === i ? { borderColor: cal.color } : {}}>
              <div className="sc-top">
                <span className="sc-icon">{s.icon}</span>
                <span className="sc-month" style={{ color: MONTH_COLORS[s.month] || cal.color }}>{s.month}</span>
              </div>
              <div className="sc-stage">{s.stage}</div>
              <div className="sc-count">{s.tasks.length} tasks</div>
            </div>
          ))}
        </div>

        {/* Quick Reference */}
        <div className="quick-ref card fade-up">
          <h3>📊 {cal.label} — At a Glance</h3>
          <div className="qr-grid">
            {[
              { icon:'📅', label:'Duration', val: season==='kharif'?'~150 days':season==='rabi'?'~130 days':'~160 days' },
              { icon:'💧', label:'Water Req.', val: season==='kharif'?'800–1200 mm':season==='rabi'?'600–900 mm':'1200–1800 mm' },
              { icon:'🌡️', label:'Avg Temp', val: season==='kharif'?'25–35°C':season==='rabi'?'15–25°C':'10–30°C' },
              { icon:'🌾', label:'Yield Potential', val: season==='kharif'?'4–6 t/ha':season==='rabi'?'5–7 t/ha':'5–8 t/ha' },
              { icon:'🧪', label:'N Requirement', val:'100–120 kg/ha' },
              { icon:'🏷️', label:'MSP 2024-25', val:'₹2,183/quintal' },
            ].map(q => (
              <div key={q.label} className="qr-item">
                <span className="qr-icon">{q.icon}</span>
                <div><div className="qr-val">{q.val}</div><div className="qr-label">{q.label}</div></div>
              </div>
            ))}
          </div>
        </div>

        <div className="calendar-footer card fade-up">
          <p>📞 For district-specific advisories, contact your local Krishi Vigyan Kendra (KVK) or call <strong>Kisan Call Center: 1800-180-1551</strong> (Toll Free)</p>
        </div>
      </div>
    </div>
  );
}
