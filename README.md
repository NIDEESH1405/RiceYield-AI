# 🌾 RiceYield AI — Full MERN Stack Application

Farm-Level Rice Yield Estimation using VHR Remote Sensing + AI Crop Models

---

## 📁 Project Structure

```
riceyield-mern/
├── package.json              ← Root scripts (run both M+E+N together)
│
├── server/                   ← NODE.JS + EXPRESS (Backend)
│   ├── server.js             ← Express app entry point
│   ├── package.json
│   ├── .env                  ← 🔑 Put your MONGO_URI here
│   ├── config/
│   │   └── db.js             ← MONGODB connection
│   ├── models/               ← MONGOOSE schemas (M)
│   │   ├── Estimation.js     ← All yield estimations stored here
│   │   ├── Contact.js        ← Contact form submissions
│   │   └── PageView.js       ← Analytics / page views
│   ├── controllers/          ← Business logic
│   │   ├── estimationController.js
│   │   ├── contactController.js
│   │   └── analyticsController.js
│   └── routes/               ← API endpoints
│       ├── estimationRoutes.js
│       ├── contactRoutes.js
│       └── analyticsRoutes.js
│
└── client/                   ← REACT (Frontend)
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js            ← Router setup
        ├── index.js          ← React entry point
        ├── index.css         ← Global styles
        ├── utils/
        │   └── api.js        ← Axios API calls
        ├── components/
        │   ├── Navbar.jsx + .css
        │   ├── Hero.jsx + .css
        │   ├── HowItWorks.jsx + .css
        │   ├── Estimator.jsx + .css   ← Saves to MongoDB on submit
        │   ├── Models.jsx + .css
        │   ├── FieldMap.jsx + .css
        │   └── Footer.jsx + .css
        └── pages/
            ├── HomePage.jsx   ← Main website page
            └── AdminPage.jsx  ← View all MongoDB data (/admin)
```

---

## ⚡ Quick Start (5 Steps)

### Step 1 — Get MongoDB URI

**Option A: MongoDB Atlas (Free Cloud)**
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create free cluster → Get connection string
3. It looks like: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/riceyield`

**Option B: Local MongoDB**
1. Install MongoDB locally
2. Use: `mongodb://localhost:27017/riceyield`

---

### Step 2 — Configure Environment

Edit `server/.env`:
```env
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/riceyield?retryWrites=true&w=majority
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

### Step 3 — Install All Dependencies

```bash
# In the root riceyield-mern/ folder:
npm install
cd server && npm install
cd ../client && npm install
```

---

### Step 4 — Run Both Frontend + Backend

```bash
# From root folder — runs BOTH server and React simultaneously:
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend (Node + Express)
cd server && npm run dev

# Terminal 2 - Frontend (React)
cd client && npm start
```

---

### Step 5 — Open in Browser

| URL | What it is |
|-----|-----------|
| `http://localhost:3000` | 🌾 Main website |
| `http://localhost:3000/admin` | 📊 Admin data viewer |
| `http://localhost:5000/api/estimations` | 🔌 Raw API |
| `http://localhost:5000/api/estimations/stats` | 📈 Stats |
| `http://localhost:5000/api/health` | ✅ Health check |

---

## 🍃 Viewing Data in MongoDB Compass

1. Download [MongoDB Compass](https://www.mongodb.com/products/tools/compass)
2. Click **New Connection**
3. Paste your `MONGO_URI` connection string
4. Click **Connect**
5. Open database: **riceyield**
6. Browse collections:
   - `estimations` — Every yield estimation a user runs
   - `contacts` — Contact form submissions  
   - `pageviews` — Website visit tracking

### What you'll see in `estimations` collection:
```json
{
  "_id": "...",
  "fieldArea": 2.5,
  "riceVariety": "ir64",
  "season": "kharif",
  "ndvi": 0.72,
  "lai": 5.2,
  "irrigation": "full",
  "soilType": "loam",
  "nitrogen": 120,
  "yieldPerHectare": 5.84,
  "totalProduction": 14.6,
  "confidenceIntervalLow": 5.31,
  "confidenceIntervalHigh": 6.37,
  "radiationUseEfficiency": 79.2,
  "harvestIndex": 52.4,
  "nitrogenUseEfficiency": 68.0,
  "waterProductivityScore": 78,
  "risks": [{"label": "Optimal Canopy", "level": "low"}],
  "modelUsed": "Hybrid LSTM + ORYZA2000",
  "ipAddress": "::1",
  "createdAt": "2025-01-15T10:23:45.000Z"
}
```

---

## 🌐 Deploy to Production

### Render.com (Free)
1. Push to GitHub
2. New Web Service → Connect repo → Root dir: `server`
3. Build: `npm install` | Start: `npm start`
4. Add environment variable: `MONGO_URI=...`
5. For React: New Static Site → Root dir: `client` → Build: `npm run build` → Publish: `build`

### Full-stack on one server
```bash
cd client && npm run build  # Creates client/build/
cd ..
NODE_ENV=production npm start  # Serves React + API on port 5000
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/estimations` | Submit estimation → saves to MongoDB |
| GET | `/api/estimations` | Get all estimations (paginated) |
| GET | `/api/estimations/stats` | Aggregated stats by variety/season |
| GET | `/api/estimations/:id` | Get single estimation |
| DELETE | `/api/estimations/:id` | Delete estimation |
| POST | `/api/contacts` | Save contact form |
| GET | `/api/contacts` | Get all contacts |
| POST | `/api/analytics/pageview` | Track page view |
| GET | `/api/analytics` | Get analytics summary |
| GET | `/api/health` | Server health check |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **M** — Database | MongoDB + Mongoose |
| **E** — Backend | Express.js + Node.js |
| **R** — Frontend | React 18 + React Router |
| **N** — Runtime | Node.js v18+ |
| Styling | CSS Modules (no framework needed) |
| HTTP | Axios |
| Dev Tools | Nodemon, Concurrently |
