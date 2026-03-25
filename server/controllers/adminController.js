const User = require('../models/User');
const Estimation = require('../models/Estimation');
const WeatherAlert = require('../models/WeatherAlert');
const GovernmentScheme = require('../models/GovernmentScheme');
const Report = require('../models/Report');
const MarketPrice = require('../models/MarketPrice');

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);

    const [totalUsers, totalFarmers, totalEstimations, todayEst, monthEst, avgYield,
      byVariety, byDistrict, byState, recentEst, recentUsers, pendingKyc,
      activeAlerts, activeSchemes, monthlyTrend] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      Estimation.countDocuments(),
      Estimation.countDocuments({ createdAt: { $gte: today } }),
      Estimation.countDocuments({ createdAt: { $gte: thisMonth } }),
      Estimation.aggregate([{ $group: { _id:null, avg:{$avg:'$yieldPerHectare'}, max:{$max:'$yieldPerHectare'}, totalProduction:{$sum:'$totalProduction'}, totalRevenue:{$sum:'$estimatedRevenue'} } }]),
      Estimation.aggregate([{ $group: { _id:'$riceVariety', count:{$sum:1}, avgYield:{$avg:'$yieldPerHectare'}, totalArea:{$sum:'$fieldArea'} } }, { $sort:{count:-1} }, {$limit:6}]),
      Estimation.aggregate([{ $match:{ district:{$exists:true,$ne:null} } }, { $group: { _id:'$district', count:{$sum:1}, avgYield:{$avg:'$yieldPerHectare'}, totalProduction:{$sum:'$totalProduction'} } }, { $sort:{count:-1} }, {$limit:10}]),
      Estimation.aggregate([{ $match:{ state:{$exists:true,$ne:null} } }, { $group: { _id:'$state', count:{$sum:1}, avgYield:{$avg:'$yieldPerHectare'} } }, { $sort:{avgYield:-1} }]),
      Estimation.find().sort({ createdAt:-1 }).limit(10).populate('userId','name email farmerId district state'),
      User.find().sort({ createdAt:-1 }).limit(8).select('-password'),
      User.countDocuments({ kycStatus:'pending' }),
      WeatherAlert.countDocuments({ isActive:true }),
      GovernmentScheme.countDocuments({ isActive:true }),
      Estimation.aggregate([{ $group: { _id:{ year:{$year:'$createdAt'}, month:{$month:'$createdAt'} }, count:{$sum:1}, avgYield:{$avg:'$yieldPerHectare'}, totalProduction:{$sum:'$totalProduction'} } }, { $sort:{'_id.year':1,'_id.month':1} }, {$limit:12}]),
    ]);

    res.json({ success: true, data: { totalUsers, totalFarmers, totalEstimations, todayEst, monthEst, avgYield: avgYield[0], byVariety, byDistrict, byState, recentEst, recentUsers, pendingKyc, activeAlerts, activeSchemes, monthlyTrend } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, district, state, kycStatus, search } = req.query;
    let query = {};
    if (role) query.role = role;
    if (district) query.district = district;
    if (state) query.state = state;
    if (kycStatus) query.kycStatus = kycStatus;
    if (search) query.$or = [{ name: new RegExp(search,'i') }, { email: new RegExp(search,'i') }, { farmerId: new RegExp(search,'i') }];
    const users = await User.find(query).sort({ createdAt:-1 }).select('-password');
    res.json({ success: true, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.verifyKyc = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { kycStatus: req.body.status, isVerified: req.body.status === 'verified' }, { new: true });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Weather Alerts
exports.getAlerts = async (req, res) => { try { const alerts = await WeatherAlert.find().sort({ createdAt:-1 }); res.json({ success:true, data:alerts }); } catch(err){ res.status(500).json({success:false,message:err.message}); } };
exports.createAlert = async (req, res) => { try { const alert = await WeatherAlert.create({...req.body, createdBy: req.user._id}); req.io?.emit('new_alert', alert); res.status(201).json({success:true,data:alert}); } catch(err){ res.status(500).json({success:false,message:err.message}); } };
exports.deleteAlert = async (req, res) => { try { await WeatherAlert.findByIdAndDelete(req.params.id); res.json({success:true}); } catch(err){ res.status(500).json({success:false,message:err.message}); } };

// Government Schemes
exports.getSchemes = async (req, res) => { try { const schemes = await GovernmentScheme.find({isActive:true}).sort({createdAt:-1}); res.json({success:true,data:schemes}); } catch(err){ res.status(500).json({success:false,message:err.message}); } };
exports.createScheme = async (req, res) => { try { const scheme = await GovernmentScheme.create({...req.body, createdBy:req.user._id}); res.status(201).json({success:true,data:scheme}); } catch(err){ res.status(500).json({success:false,message:err.message}); } };

// Market Prices
exports.getMarketPrices = async (req, res) => { try { const prices = await MarketPrice.find().sort({priceDate:-1}).limit(50); res.json({success:true,data:prices}); } catch(err){ res.status(500).json({success:false,message:err.message}); } };
exports.updateMarketPrice = async (req, res) => { try { const price = await MarketPrice.create({...req.body, updatedBy:req.user._id}); req.io?.emit('market_price_update', price); res.status(201).json({success:true,data:price}); } catch(err){ res.status(500).json({success:false,message:err.message}); } };

// Reports
exports.generateReport = async (req, res) => {
  try {
    const { reportType, district, state, season, year } = req.body;
    let matchQuery = {};
    if (district) matchQuery.district = district;
    if (state) matchQuery.state = state;
    if (season) matchQuery.season = season;
    if (year) { matchQuery.createdAt = { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }; }

    const [agg, farmers] = await Promise.all([
      Estimation.aggregate([{ $match: matchQuery }, { $group: { _id:null, totalFarmers:{$addToSet:'$userId'}, totalArea:{$sum:'$fieldArea'}, totalProduction:{$sum:'$totalProduction'}, avgYield:{$avg:'$yieldPerHectare'}, totalRevenue:{$sum:'$estimatedRevenue'}, byVariety:{$push:'$riceVariety'} } }]),
      Estimation.distinct('userId', matchQuery),
    ]);

    const reportData = agg[0] || {};
    const report = await Report.create({
      title: `${reportType.toUpperCase()} Report - ${district||state||'National'} ${season||''} ${year||new Date().getFullYear()}`,
      reportType, generatedBy: req.user._id, district, state, season, year: year || new Date().getFullYear(),
      totalFarmers: farmers.length, totalArea: reportData.totalArea, totalProduction: reportData.totalProduction, avgYield: reportData.avgYield, data: reportData,
    });
    res.status(201).json({ success:true, data:report });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

exports.getReports = async (req, res) => { try { const reports = await Report.find().sort({createdAt:-1}).populate('generatedBy','name'); res.json({success:true,data:reports}); } catch(err){ res.status(500).json({success:false,message:err.message}); } };
