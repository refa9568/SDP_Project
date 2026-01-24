const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authenticateToken } = require('../middleware/auth');

// All leave routes require authentication
router.use(authenticateToken);

// Leave routes
router.get('/', leaveController.getAllLeaves);
router.get('/types', leaveController.getLeaveTypes);
router.get('/balance/:userId?', leaveController.getLeaveBalance);
router.get('/:id', leaveController.getLeaveById);
router.post('/', leaveController.createLeave);
router.put('/:id/approve', leaveController.approveLeave);
router.put('/:id/reject', leaveController.rejectLeave);
router.delete('/:id', leaveController.deleteLeave);

module.exports = router;
