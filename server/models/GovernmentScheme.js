const mongoose = require('mongoose');
const SchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  ministry: { type: String },
  schemeType: { type: String, enum: ['subsidy','insurance','loan','training','equipment'], required: true },
  eligibility: { type: String },
  benefit: { type: String },
  applicationUrl: { type: String },
  deadline: { type: Date },
  maxBenefitAmount: { type: Number },
  isActive: { type: Boolean, default: true },
  applicableStates: [String],
  applicableCrops: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });
module.exports = mongoose.model('GovernmentScheme', SchemeSchema);
