const express = require('express');
const router = express.Router();
const {
  createEstimation,
  getEstimations,
  getStats,
  getEstimationById,
  deleteEstimation,
} = require('../controllers/estimationController');

router.post('/', createEstimation);         // POST   /api/estimations
router.get('/', getEstimations);            // GET    /api/estimations
router.get('/stats', getStats);             // GET    /api/estimations/stats
router.get('/:id', getEstimationById);      // GET    /api/estimations/:id
router.delete('/:id', deleteEstimation);    // DELETE /api/estimations/:id

module.exports = router;
