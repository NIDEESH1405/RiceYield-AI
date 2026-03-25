const mongoose = require('mongoose');
const MarketPriceSchema = new mongoose.Schema({
  variety: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String },
  mspPrice: { type: Number },
  marketPrice: { type: Number, required: true },
  priceDate: { type: Date, default: Date.now },
  priceUnit: { type: String, default: 'per_quintal' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('MarketPrice', MarketPriceSchema);
