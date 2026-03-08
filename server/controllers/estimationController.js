const Estimation = require('../models/Estimation');

// Yield calculation engine (mirrors frontend logic but runs on server)
const varietyBase = { ir64: 6.2, swarna: 5.1, basmati: 5.8, dhan: 5.5, br11: 5.3, samba: 4.9 };
const irrigationMult = { full: 1.0, rainfed: 0.78, partial: 0.90, awi: 0.95 };
const soilMult = { clay: 1.0, loam: 1.05, silt: 0.98, sandy: 0.88 };
const seasonMult = { kharif: 1.0, rabi: 1.08, boro: 0.93 };

function computeYield(params) {
  const { fieldArea, riceVariety, season, ndvi, lai, irrigation, soilType, nitrogen } = params;

  const ndviFactor = 0.5 + ndvi * 0.8;
  const laiFactor = 0.6 + (lai / 9) * 0.7;
  const nFactor = 0.7 + Math.min(nitrogen / 200, 1) * 0.4;
  const base = varietyBase[riceVariety] || 5.5;

  const rawYield =
    base *
    ndviFactor *
    laiFactor *
    (irrigationMult[irrigation] || 1.0) *
    (soilMult[soilType] || 1.0) *
    (seasonMult[season] || 1.0) *
    nFactor;

  const yieldPerHectare = Math.min(Math.max(rawYield, 1.5), 10.5);
  const totalProduction = yieldPerHectare * fieldArea;
  const ciLow = yieldPerHectare * 0.91;
  const ciHigh = yieldPerHectare * 1.09;

  const rue = Math.min(ndvi * 110, 100);
  const hi = 40 + (yieldPerHectare / 10) * 25;
  const nue = Math.min((nitrogen / 150) * 85, 95);
  const wpMap = { full: 78, awi: 88, rainfed: 55, partial: 70 };
  const wp = wpMap[irrigation] || 70;

  const risks = [];
  if (ndvi < 0.5) risks.push({ label: 'Low NDVI', level: 'high' });
  if (ndvi > 0.65) risks.push({ label: 'Optimal Canopy', level: 'low' });
  if (lai < 3) risks.push({ label: 'Low LAI', level: 'high' });
  if (nitrogen < 80) risks.push({ label: 'N Deficiency', level: 'high' });
  if (nitrogen > 100 && nitrogen < 160) risks.push({ label: 'N Optimal', level: 'low' });
  if (nitrogen > 200) risks.push({ label: 'N Excess Risk', level: 'medium' });
  if (irrigation === 'rainfed') risks.push({ label: 'Drought Risk', level: 'medium' });
  if (irrigation === 'full') risks.push({ label: 'Well Irrigated', level: 'low' });

  return {
    yieldPerHectare: parseFloat(yieldPerHectare.toFixed(2)),
    totalProduction: parseFloat(totalProduction.toFixed(2)),
    confidenceIntervalLow: parseFloat(ciLow.toFixed(2)),
    confidenceIntervalHigh: parseFloat(ciHigh.toFixed(2)),
    radiationUseEfficiency: parseFloat(rue.toFixed(1)),
    harvestIndex: parseFloat(hi.toFixed(1)),
    nitrogenUseEfficiency: parseFloat(nue.toFixed(1)),
    waterProductivityScore: wp,
    risks,
  };
}

// POST /api/estimations — run estimation and save to MongoDB
exports.createEstimation = async (req, res) => {
  try {
    const {
      fieldArea, riceVariety, season, ndvi, lai,
      irrigation, soilType, nitrogen, plantingYear,
    } = req.body;

    // Validate required fields
    if (!fieldArea || !riceVariety || !season || ndvi == null || lai == null || !irrigation || !soilType || nitrogen == null) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const computed = computeYield({ fieldArea, riceVariety, season, ndvi, lai, irrigation, soilType, nitrogen });

    const estimation = await Estimation.create({
      fieldArea,
      riceVariety,
      season,
      ndvi,
      lai,
      irrigation,
      soilType,
      nitrogen,
      plantingYear,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      ...computed,
    });

    res.status(201).json({ success: true, data: estimation });
  } catch (error) {
    console.error('Estimation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/estimations — fetch all estimations (for admin/MongoDB viewer)
exports.getEstimations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const estimations = await Estimation.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Estimation.countDocuments();

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), data: estimations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/estimations/stats — aggregated stats
exports.getStats = async (req, res) => {
  try {
    const totalEstimations = await Estimation.countDocuments();

    const avgYield = await Estimation.aggregate([
      { $group: { _id: null, avg: { $avg: '$yieldPerHectare' }, max: { $max: '$yieldPerHectare' }, min: { $min: '$yieldPerHectare' } } }
    ]);

    const byVariety = await Estimation.aggregate([
      { $group: { _id: '$riceVariety', count: { $sum: 1 }, avgYield: { $avg: '$yieldPerHectare' } } },
      { $sort: { count: -1 } }
    ]);

    const bySeason = await Estimation.aggregate([
      { $group: { _id: '$season', count: { $sum: 1 }, avgYield: { $avg: '$yieldPerHectare' } } }
    ]);

    const byIrrigation = await Estimation.aggregate([
      { $group: { _id: '$irrigation', count: { $sum: 1 }, avgYield: { $avg: '$yieldPerHectare' } } }
    ]);

    const recentTrend = await Estimation.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('yieldPerHectare riceVariety season createdAt');

    res.json({
      success: true,
      data: {
        totalEstimations,
        avgYield: avgYield[0] || {},
        byVariety,
        bySeason,
        byIrrigation,
        recentTrend,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/estimations/:id
exports.getEstimationById = async (req, res) => {
  try {
    const estimation = await Estimation.findById(req.params.id);
    if (!estimation) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: estimation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/estimations/:id
exports.deleteEstimation = async (req, res) => {
  try {
    await Estimation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
