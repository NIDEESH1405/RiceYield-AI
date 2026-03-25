const mongoose = require('mongoose');
const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  reportType: { type: String, enum: ['district','state','national','seasonal','crop','farmer'], required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  district: { type: String },
  state: { type: String },
  season: { type: String },
  year: { type: Number },
  data: { type: mongoose.Schema.Types.Mixed },
  totalFarmers: { type: Number },
  totalArea: { type: Number },
  totalProduction: { type: Number },
  avgYield: { type: Number },
  status: { type: String, enum: ['generating','ready','archived'], default: 'ready' },
}, { timestamps: true });
module.exports = mongoose.model('Report', ReportSchema);
