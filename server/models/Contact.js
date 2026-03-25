const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  organization: { type: String, trim: true },
  message: { type: String, trim: true },
  interest: { type: String, enum: ['api', 'research', 'farming', 'other'], default: 'other' },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: 'contacts',
});

ContactSchema.index({ email: 1 });
ContactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', ContactSchema);
