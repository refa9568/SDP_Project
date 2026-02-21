const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Public route for rank summary (no auth required)
router.get('/rank-summary', userController.getRankSummary);

// All user routes require authentication
router.use(authenticateToken);

// User routes
router.get('/', userController.getAllUsers);
router.get('/me', userController.getCurrentUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);

module.exports = router;
