const mongoose = require('mongoose');

const EstimationSchema = new mongoose.Schema({
  // User / Session
  sessionId: { type: String, default: () => Math.random().toString(36).substr(2, 12) },
  ipAddress: { type: String },
  userAgent: { type: String },

  // Field Parameters (inputs)
  fieldArea: { type: Number, required: true },
  riceVariety: { type: String, required: true },
  season: { type: String, required: true },
  ndvi: { type: Number, required: true },
  lai: { type: Number, required: true },
  irrigation: { type: String, required: true },
  soilType: { type: String, required: true },
  nitrogen: { type: Number, required: true },
  plantingYear: { type: Number },

  // Estimation Results (outputs)
  yieldPerHectare: { type: Number, required: true },
  totalProduction: { type: Number, required: true },
  confidenceIntervalLow: { type: Number },
  confidenceIntervalHigh: { type: Number },

  // Component Scores
  radiationUseEfficiency: { type: Number },
  harvestIndex: { type: Number },
  nitrogenUseEfficiency: { type: Number },
  waterProductivityScore: { type: Number },

  // Risk flags
  risks: [{ label: String, level: String }],

  // Metadata
  modelUsed: { type: String, default: 'Hybrid LSTM + ORYZA2000' },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: 'estimations',
});

// Index for fast querying in MongoDB
EstimationSchema.index({ createdAt: -1 });
EstimationSchema.index({ riceVariety: 1 });
EstimationSchema.index({ season: 1 });

module.exports = mongoose.model('Estimation', EstimationSchema);
