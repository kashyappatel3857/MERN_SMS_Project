const express = require('express');
const router = express.Router();
const {
  saveAttendance,
  getAttendance,
  updateAttendanceById,
  getDailyAttendance,
  getMonthlyAttendance,
} = require('../controllers/attendanceController');

router.post('/', saveAttendance);
router.get('/', getAttendance);
router.get('/daily', getDailyAttendance);
router.get('/monthly', getMonthlyAttendance);
router.put('/:id', updateAttendanceById);

module.exports = router;

