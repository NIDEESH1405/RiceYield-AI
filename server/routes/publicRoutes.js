const express = require('express');
const router = express.Router();
const GovernmentScheme = require('../models/GovernmentScheme');
const WeatherAlert = require('../models/WeatherAlert');
const MarketPrice = require('../models/MarketPrice');
const Estimation = require('../models/Estimation');

router.get('/schemes', async (req, res) => { try { const s = await GovernmentScheme.find({isActive:true}); res.json({success:true,data:s}); } catch(e){ res.status(500).json({success:false}); } });
router.get('/alerts', async (req, res) => { try { const a = await WeatherAlert.find({isActive:true}).sort({createdAt:-1}).limit(10); res.json({success:true,data:a}); } catch(e){ res.status(500).json({success:false}); } });
router.get('/market-prices', async (req, res) => { try { const p = await MarketPrice.find().sort({priceDate:-1}).limit(20); res.json({success:true,data:p}); } catch(e){ res.status(500).json({success:false}); } });

// Crop Calendar static data endpoint
router.get('/crop-calendar', (req, res) => {
  const { season = 'kharif' } = req.query;
  const calendars = {
    kharif: { label:'Kharif (Jun–Nov)', months:'June–November', duration:'~150 days', waterReq:'800–1200 mm', yieldPotential:'4–6 t/ha', stages: ['Land Prep (Jun W1-2)','Nursery (Jun W3-4)','Transplanting (Jul W1-2)','Tillering (Jul W3-4)','Active Tillering/PI (Aug)','Booting/Heading (Sep W1-2)','Flowering (Sep W3-4)','Grain Fill (Oct)','Harvest (Nov)'] },
    rabi: { label:'Rabi (Nov–Apr)', months:'November–April', duration:'~130 days', waterReq:'600–900 mm', yieldPotential:'5–7 t/ha', stages: ['Land Prep (Nov W1-2)','Nursery (Nov W3-4)','Transplanting (Dec W1-2)','Vegetative (Dec-Jan)','Reproductive (Feb)','Grain Fill (Mar)','Harvest (Apr)'] },
    boro: { label:'Boro (Dec–May)', months:'December–May', duration:'~160 days', waterReq:'1200–1800 mm', yieldPotential:'5–8 t/ha', stages: ['Nursery (Dec W1-2)','Transplanting (Jan W1-2)','Vegetative (Jan–Mar)','Reproductive (Apr W1-2)','Maturity & Harvest (Apr–May)'] },
  };
  const data = calendars[season] || calendars.kharif;
  res.json({ success: true, data, season });
});

// Public estimation stats (anonymized, for home page display)
router.get('/stats', async (req, res) => {
  try {
    const [total, avgYield, topStates] = await Promise.all([
      Estimation.countDocuments(),
      Estimation.aggregate([{ $group: { _id: null, avg: { $avg: '$yieldPerHectare' }, totalProd: { $sum: '$totalProduction' } } }]),
      Estimation.aggregate([{ $group: { _id: '$state', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 5 }]),
    ]);
    res.json({ success: true, data: { totalEstimations: total, avgYield: avgYield[0]?.avg?.toFixed(2) || 0, totalProduction: avgYield[0]?.totalProd?.toFixed(0) || 0, topStates } });
  } catch (e) { res.status(500).json({ success: false }); }
});

module.exports = router;
