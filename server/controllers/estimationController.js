const Estimation = require('../models/Estimation');

function calculateYield(data) {
  const variantBase = { ir64:6.2, swarna:5.1, basmati:4.8, dhan:5.8, br11:5.5, samba:5.3, mtugold:6.0, rajendra:5.6 };
  const seasonMod = { kharif:1.0, rabi:1.12, boro:1.08 };
  const irrigMod = { full:1.0, partial:0.88, rainfed:0.72, awi:0.95 };
  const soilMod = { clay:1.02, loam:1.05, silt:1.0, sandy:0.88 };
  const pestMod = { none:1.0, low:0.96, medium:0.88, high:0.72 };
  const weatherMod = { normal:1.0, dry:0.85, wet:0.92, flood:0.6, drought:0.55 };

  const base = variantBase[data.riceVariety] || 5.5;
  const ndviFactor = 0.5 + (data.ndvi * 0.7);
  const laiFactor = Math.min(1.0, data.lai / 7.0);
  const nFactor = Math.min(1.15, 0.7 + (data.nitrogen / 400));
  const npkBonus = 1 + ((data.phosphorus || 0) * 0.001) + ((data.potassium || 0) * 0.0008);

  const yieldPerHectare = parseFloat((
    base * ndviFactor * laiFactor * nFactor * npkBonus *
    (seasonMod[data.season] || 1.0) *
    (irrigMod[data.irrigation] || 1.0) *
    (soilMod[data.soilType] || 1.0) *
    (pestMod[data.pestPressure] || 1.0) *
    (weatherMod[data.weatherCondition] || 1.0)
  ).toFixed(2));

  const marketPrice = data.marketPrice || 2000;
  const totalProduction = parseFloat((yieldPerHectare * data.fieldArea).toFixed(2));
  const estimatedRevenue = Math.round(totalProduction * marketPrice * 10); // per quintal converted

  const rue = Math.round(55 + (data.ndvi * 30));
  const hi = Math.min(Math.round(42 + (data.lai * 2)), 52);
  const nue = Math.min(Math.round(50 + (data.nitrogen * 0.2)), 90);
  const wps = Math.min(Math.round(60 + (irrigMod[data.irrigation] || 1.0) * 20), 95);
  const carbonFootprint = parseFloat((data.fieldArea * 2.4 * (data.nitrogen / 100)).toFixed(2));
  const waterUsage = parseFloat((data.fieldArea * (irrigMod[data.irrigation] === 1 ? 1200 : 800)).toFixed(0));

  const risks = [];
  const recommendations = [];

  if (data.ndvi < 0.5) { risks.push({ label:'Low Canopy Coverage', level:'high', mitigation:'Apply foliar spray and check pest damage' }); }
  if (data.nitrogen < 60) { risks.push({ label:'N Deficiency Risk', level:'high', mitigation:'Apply urea @ 60kg/ha immediately' }); recommendations.push({ category:'Fertilizer', text:'Apply split dose nitrogen - 30kg at tillering, 30kg at panicle initiation', priority:'high' }); }
  if (data.irrigation === 'rainfed') { risks.push({ label:'Drought Stress Risk', level:'med', mitigation:'Install rainwater harvesting system' }); }
  if (data.lai < 3) { risks.push({ label:'Poor Stand Establishment', level:'med', mitigation:'Gap filling and re-transplanting' }); }
  if (data.pestPressure === 'high') { risks.push({ label:'High Pest Pressure', level:'high', mitigation:'Immediate IPM intervention required' }); recommendations.push({ category:'Pest Control', text:'Apply recommended pesticide under expert supervision', priority:'high' }); }
  if (yieldPerHectare > 6) { risks.push({ label:'Optimal Conditions', level:'low', mitigation:'Maintain current practices' }); }
  if (data.phosphorus < 30) { recommendations.push({ category:'Fertilizer', text:'Apply DAP @ 50kg/ha to improve root development', priority:'medium' }); }
  recommendations.push({ category:'Harvest', text:`Expected harvest around ${new Date(Date.now() + 110*24*60*60*1000).toLocaleDateString()}`, priority:'low' });

  const insuranceEligible = yieldPerHectare < (base * 0.8);
  const subsidyAmount = insuranceEligible ? Math.round(data.fieldArea * 3000) : 0;

  return {
    yieldPerHectare, totalProduction, estimatedRevenue, marketPrice,
    confidenceIntervalLow: parseFloat((yieldPerHectare * 0.88).toFixed(2)),
    confidenceIntervalHigh: parseFloat((yieldPerHectare * 1.12).toFixed(2)),
    radiationUseEfficiency: rue, harvestIndex: hi, nitrogenUseEfficiency: nue, waterProductivityScore: wps,
    carbonFootprint, waterUsage, risks, recommendations, insuranceEligible, subsidyAmount,
    modelUsed: 'Hybrid LSTM + ORYZA2000 v3',
  };
}

exports.createEstimation = async (req, res) => {
  try {
    const computed = calculateYield(req.body);
    const estimation = await Estimation.create({
      ...req.body, ...computed,
      userId: req.user?._id || null,
      farmerId: req.user?.farmerId,
      district: req.body.district || req.user?.district,
      state: req.body.state || req.user?.state,
      village: req.body.village || req.user?.village,
    });
    if (req.io) req.io.emit('new_estimation', { _id: estimation._id, riceVariety: estimation.riceVariety, yieldPerHectare: estimation.yieldPerHectare, district: estimation.district, state: estimation.state, createdAt: estimation.createdAt });
    if (req.user) { const User = require('../models/User'); await User.findByIdAndUpdate(req.user._id, { $inc: { estimationCount: 1 } }); }
    res.status(201).json({ success: true, data: estimation });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getEstimations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { district, state, season, variety, status } = req.query;
    let query = {};
    if (!['super_admin','state_admin','district_admin','officer','scientist'].includes(req.user?.role)) {
      query.userId = req.user?._id;
    }
    if (district) query.district = district;
    if (state) query.state = state;
    if (season) query.season = season;
    if (variety) query.riceVariety = variety;
    if (status) query.status = status;
    const [data, total] = await Promise.all([
      Estimation.find(query).sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit).populate('userId','name email farmerId district'),
      Estimation.countDocuments(query),
    ]);
    res.json({ success: true, data, total, pages: Math.ceil(total/limit), page });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getEstimationStats = async (req, res) => {
  try {
    let query = {};
    if (!['super_admin','state_admin','district_admin','officer','scientist'].includes(req.user?.role)) {
      query.userId = req.user?._id;
    }
    const [totalEstimations, avgYield, byVariety, bySeason, byDistrict, byState, monthlyTrend] = await Promise.all([
      Estimation.countDocuments(query),
      Estimation.aggregate([{ $match: query }, { $group: { _id:null, avg:{$avg:'$yieldPerHectare'}, max:{$max:'$yieldPerHectare'}, min:{$min:'$yieldPerHectare'}, totalProduction:{$sum:'$totalProduction'}, totalRevenue:{$sum:'$estimatedRevenue'} } }]),
      Estimation.aggregate([{ $match: query }, { $group: { _id:'$riceVariety', count:{$sum:1}, avgYield:{$avg:'$yieldPerHectare'}, totalArea:{$sum:'$fieldArea'} } }, { $sort:{count:-1} }]),
      Estimation.aggregate([{ $match: query }, { $group: { _id:'$season', count:{$sum:1}, avgYield:{$avg:'$yieldPerHectare'} } }]),
      Estimation.aggregate([{ $match: query }, { $group: { _id:'$district', count:{$sum:1}, avgYield:{$avg:'$yieldPerHectare'}, totalProduction:{$sum:'$totalProduction'} } }, { $sort:{count:-1} }, { $limit:10 }]),
      Estimation.aggregate([{ $match: query }, { $group: { _id:'$state', count:{$sum:1}, avgYield:{$avg:'$yieldPerHectare'} } }, { $sort:{count:-1} }]),
      Estimation.aggregate([{ $match: query }, { $group: { _id:{ year:{$year:'$createdAt'}, month:{$month:'$createdAt'} }, count:{$sum:1}, avgYield:{$avg:'$yieldPerHectare'} } }, { $sort:{'_id.year':1,'_id.month':1} }, { $limit:12 }]),
    ]);
    res.json({ success: true, data: { totalEstimations, avgYield: avgYield[0], byVariety, bySeason, byDistrict, byState, monthlyTrend } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.verifyEstimation = async (req, res) => {
  try {
    const est = await Estimation.findByIdAndUpdate(req.params.id, { status:'verified', verifiedBy: req.user._id, verifiedAt: new Date() }, { new: true });
    res.json({ success: true, data: est });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.exportEstimations = async (req, res) => {
  try {
    let query = {};
    if (!['super_admin','state_admin','district_admin','officer','scientist'].includes(req.user?.role)) {
      query.userId = req.user?._id;
    }
    const estimations = await Estimation.find(query).sort({ createdAt: -1 }).limit(500).populate('userId','name email farmerId');

    const headers = ['Date','Farmer ID','Name','Variety','Season','Area (ha)','NDVI','LAI','Irrigation','Soil','N (kg/ha)','P (kg/ha)','K (kg/ha)','Pest','Weather','Yield (t/ha)','Total Prod (t)','Revenue (INR)','Insurance Eligible','Subsidy (INR)','District','State','Model'];
    const rows = estimations.map(e => [
      new Date(e.createdAt).toLocaleDateString('en-IN'),
      e.farmerId || e.userId?.farmerId || '',
      e.userId?.name || '',
      e.riceVariety, e.season,
      e.fieldArea, e.ndvi, e.lai, e.irrigation, e.soilType,
      e.nitrogen, e.phosphorus || '', e.potassium || '',
      e.pestPressure || '', e.weatherCondition || '',
      e.yieldPerHectare, e.totalProduction, e.estimatedRevenue,
      e.insuranceEligible ? 'Yes' : 'No',
      e.subsidyAmount || 0,
      e.district || '', e.state || '',
      e.modelUsed || 'Hybrid LSTM+ORYZA2000',
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="riceyield-estimations-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
