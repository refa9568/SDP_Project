const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// GET  /api/attendance/soldiers  — list of all soldiers
router.get('/soldiers', attendanceController.getSoldiers);

// GET  /api/attendance/dates     — all dates that have records
router.get('/dates', attendanceController.getDates);

// GET  /api/attendance/summary   — count stats for a date (?date=YYYY-MM-DD)
router.get('/summary', attendanceController.getAttendanceSummary);

// POST /api/attendance/init-date — create blank records for all soldiers for a date
router.post(
  '/init-date',
  authorizeRoles('bsm', 'adjutant', 'coy_comd', 'commanding_officer'),
  attendanceController.initDate
);

// POST /api/attendance/mark      — BSM marks attendance for a soldier
router.post(
  '/mark',
  authorizeRoles('bsm', 'adjutant', 'coy_comd', 'commanding_officer'),
  attendanceController.markAttendance
);

// GET  /api/attendance/:service_number — specific soldier's record (?date=YYYY-MM-DD)
router.get('/:service_number', attendanceController.getSoldierAttendance);

// GET  /api/attendance             — all records for a date (?date=YYYY-MM-DD)
router.get('/', attendanceController.getAttendance);

module.exports = router;
