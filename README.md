# 🌾 RiceYield AI Gov — v4.0

## What's New in v4.0

### 🎨 UI Improvements
- **Hero Section**: Animated counter stats, floating particles, shimmer CTA, live ribbon badge, scroll hint
- **Estimator**: Multi-step wizard (Field Info → Agronomics → Results), added N/P/K split inputs, pest pressure, weather condition, market price, district/state fields
- **Estimator Results**: Bar chart + radar chart, carbon footprint, water usage, insurance/subsidy metrics, recommendations panel, print button

### ✨ New Features
- **Crop Calendar** (`/calendar`): Interactive Kharif/Rabi/Boro cultivation guide with clickable timeline
- **AI Chat Assistant** (`/chat`): Knowledge-base farming chatbot — varieties, fertilizers, pests, schemes, irrigation, NDVI
- **CSV Export**: Download all estimations from Dashboard → History tab

### 🔧 Backend Changes
- `GET /api/public/crop-calendar?season=kharif|rabi|boro` — crop calendar data
- `GET /api/public/stats` — anonymized platform stats
- `GET /api/estimations/export` — CSV export (authenticated)
- Expanded market price seed data (8 entries across states)

## Quick Start
```bash
cd riceyield-gov
npm install && npm run install:server && npm run install:client && npm run dev
```

## Default Credentials
- **Admin**: admin@riceyield.gov.in / Admin@123
- **Officer**: officer@riceyield.gov.in / Officer@123

## Tech Stack
- **Frontend**: React 18, React Router v6, Recharts, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT
- **AI Model**: Hybrid LSTM + ORYZA2000 v3
