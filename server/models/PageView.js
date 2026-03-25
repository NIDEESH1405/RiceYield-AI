const mongoose = require('mongoose');

const PageViewSchema = new mongoose.Schema({
  page: { type: String, default: '/' },
  referrer: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  country: { type: String },
  sessionId: { type: String },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  collection: 'pageviews',
});

PageViewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PageView', PageViewSchema);
