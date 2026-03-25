const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const User = require('./models/User');
const GovernmentScheme = require('./models/GovernmentScheme');
const MarketPrice = require('./models/MarketPrice');
const WeatherAlert = require('./models/WeatherAlert');

dotenv.config();
connectDB();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true } });

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => { req.io = io; next(); });

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/estimations', require('./routes/estimationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '3.0-gov', timestamp: new Date() }));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join_district', (district) => socket.join(`district_${district}`));
  socket.on('disconnect', () => console.log('Disconnected:', socket.id));
});

async function seedData() {
  try {
    // Seed super admin
    const adminExists = await User.findOne({ role: 'super_admin' });
    if (!adminExists) {
      await User.create({ name: process.env.ADMIN_NAME || 'Super Admin', email: process.env.ADMIN_EMAIL || 'admin@riceyield.ai', password: process.env.ADMIN_PASSWORD || 'Admin@123', role: 'super_admin', isVerified: true, kycStatus: 'verified' });
      console.log('✅ Super Admin seeded:', process.env.ADMIN_EMAIL);
    }
    // Seed a district officer
    const officerExists = await User.findOne({ role: 'officer' });
    if (!officerExists) {
      await User.create({ name: 'District Officer - Tamil Nadu', email: 'officer@riceyield.ai', password: 'Officer@123', role: 'officer', district: 'Chennai', state: 'Tamil Nadu', isVerified: true, kycStatus: 'verified' });
      console.log('✅ District Officer seeded');
    }
    // Seed government schemes
    const schemesCount = await GovernmentScheme.countDocuments();
    if (schemesCount === 0) {
      await GovernmentScheme.insertMany([
        { name: 'PM-KISAN', description: 'Income support of ₹6000/year to farmer families', ministry: 'Ministry of Agriculture', schemeType: 'subsidy', eligibility: 'All land-holding farmer families', benefit: '₹6,000 per year in 3 installments', maxBenefitAmount: 6000, applicableCrops: ['rice','wheat','all'], applicableStates: ['all'] },
        { name: 'PMFBY - Pradhan Mantri Fasal Bima Yojana', description: 'Crop insurance scheme providing financial support to farmers', ministry: 'Ministry of Agriculture', schemeType: 'insurance', eligibility: 'All farmers growing notified crops', benefit: 'Comprehensive crop insurance at low premium', maxBenefitAmount: 200000, applicableCrops: ['rice','wheat','cotton'], applicableStates: ['all'] },
        { name: 'Kisan Credit Card (KCC)', description: 'Short-term credit for agricultural requirements', ministry: 'Ministry of Agriculture', schemeType: 'loan', eligibility: 'All farmers, tenant farmers, SHG members', benefit: 'Credit up to ₹3 lakh at 4% interest', maxBenefitAmount: 300000, applicableCrops: ['all'], applicableStates: ['all'] },
        { name: 'National Food Security Mission - Rice', description: 'Increase rice production through area expansion and yield improvement', ministry: 'Ministry of Agriculture', schemeType: 'subsidy', eligibility: 'Rice farmers in selected districts', benefit: 'Free certified seeds, training, equipment subsidy', maxBenefitAmount: 15000, applicableCrops: ['rice'], applicableStates: ['all'] },
      ]);
      console.log('✅ Government schemes seeded');
    }
    // Seed market prices
    const pricesCount = await MarketPrice.countDocuments();
    if (pricesCount === 0) {
      await MarketPrice.insertMany([
        { variety: 'ir64', state: 'Tamil Nadu', district: 'Thanjavur', mspPrice: 2183, marketPrice: 2250 },
        { variety: 'basmati', state: 'Punjab', district: 'Amritsar', mspPrice: 2183, marketPrice: 4500 },
        { variety: 'swarna', state: 'West Bengal', district: 'Burdwan', mspPrice: 2183, marketPrice: 2100 },
        { variety: 'samba', state: 'Tamil Nadu', district: 'Tiruvarur', mspPrice: 2183, marketPrice: 3200 },
        { variety: 'dhan', state: 'Telangana', district: 'Warangal', mspPrice: 2183, marketPrice: 2400 },
        { variety: 'swarna', state: 'Andhra Pradesh', district: 'Krishna', mspPrice: 2183, marketPrice: 2300 },
        { variety: 'br11', state: 'Bihar', district: 'Patna', mspPrice: 2183, marketPrice: 2050 },
        { variety: 'mtugold', state: 'Telangana', district: 'Nalgonda', mspPrice: 2183, marketPrice: 2600 },
      ]);
      console.log('✅ Market prices seeded');
    }
    // Seed a weather alert
    const alertsCount = await WeatherAlert.countDocuments();
    if (alertsCount === 0) {
      await WeatherAlert.create({ title: 'Northeast Monsoon Advisory', description: 'Heavy rainfall expected in coastal districts. Farmers advised to harvest early-maturing crops and ensure proper drainage in fields.', severity: 'warning', alertType: 'flood', affectedStates: ['Tamil Nadu','Andhra Pradesh'], affectedDistricts: ['Chennai','Cuddalore','Villupuram'], validUntil: new Date(Date.now() + 7*24*60*60*1000) });
      console.log('✅ Weather alert seeded');
    }
  } catch (err) { console.error('Seed error:', err.message); }
}
seedData();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../client/build', 'index.html')));
}

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`🚀 RiceYield AI v4 running on http://localhost:${PORT}`));
