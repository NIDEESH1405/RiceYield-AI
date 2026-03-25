const mongoose = require('mongoose');
const WeatherAlertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['info','warning','danger'], default: 'info' },
  affectedDistricts: [String],
  affectedStates: [String],
  alertType: { type: String, enum: ['flood','drought','cyclone','pest','disease','frost','heatwave'], required: true },
  isActive: { type: Boolean, default: true },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('WeatherAlert', WeatherAlertSchema);
