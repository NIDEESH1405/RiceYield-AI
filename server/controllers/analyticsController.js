const PageView = require('../models/PageView');

exports.trackPageView = async (req, res) => {
  try {
    const { page, referrer, sessionId } = req.body;
    await PageView.create({
      page: page || '/',
      referrer,
      sessionId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalViews = await PageView.countDocuments();
    const uniqueSessions = await PageView.distinct('sessionId');

    const last7Days = await PageView.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, data: { totalViews, uniqueVisitors: uniqueSessions.length, last7Days } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
