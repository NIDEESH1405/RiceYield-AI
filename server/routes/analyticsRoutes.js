const express = require('express');
const router = express.Router();
const { trackPageView, getAnalytics } = require('../controllers/analyticsController');

router.post('/pageview', trackPageView);    // POST /api/analytics/pageview
router.get('/', getAnalytics);              // GET  /api/analytics

module.exports = router;
