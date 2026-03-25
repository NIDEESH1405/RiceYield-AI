const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['farmer','officer','scientist','district_admin','state_admin','super_admin'], default: 'farmer' },
  phone: { type: String },
  aadhaarNumber: { type: String },
  farmerId: { type: String, unique: true, sparse: true },
  district: { type: String },
  state: { type: String },
  village: { type: String },
  totalLandHolding: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  kycStatus: { type: String, enum: ['pending','verified','rejected'], default: 'pending' },
  lastLogin: { type: Date },
  estimationCount: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  notifications: [{ message: String, read: { type: Boolean, default: false }, createdAt: { type: Date, default: Date.now } }],
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
UserSchema.methods.comparePassword = async function(p) { return bcrypt.compare(p, this.password); };
UserSchema.methods.toJSON = function() { const o = this.toObject(); delete o.password; return o; };
module.exports = mongoose.model('User', UserSchema);
