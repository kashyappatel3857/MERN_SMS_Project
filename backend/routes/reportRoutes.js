const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getStudentReport,
  getMonthlyReport,
} = require('../controllers/reportController');

router.get('/dashboard', getDashboardMetrics);
router.get('/monthly', getMonthlyReport);
router.get('/student/:id', getStudentReport);

module.exports = router;

