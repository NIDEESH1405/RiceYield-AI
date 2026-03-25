const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    if (!req.user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated' });
    next();
  } catch (err) { return res.status(401).json({ success: false, message: 'Invalid token' }); }
};

exports.optionalAuth = async (req, res, next) => {
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {}
  }
  next();
};

const GOV_ROLES = ['officer','scientist','district_admin','state_admin','super_admin'];
exports.adminOnly = (req, res, next) => { if (!GOV_ROLES.includes(req.user?.role)) return res.status(403).json({ success:false, message:'Government access required' }); next(); };
exports.superAdminOnly = (req, res, next) => { if (req.user?.role !== 'super_admin') return res.status(403).json({ success:false, message:'Super admin only' }); next(); };
exports.districtAdminUp = (req, res, next) => { if (!['district_admin','state_admin','super_admin'].includes(req.user?.role)) return res.status(403).json({ success:false, message:'District admin access required' }); next(); };
