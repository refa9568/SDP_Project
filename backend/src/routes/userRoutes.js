const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// All user routes require authentication
router.use(authenticateToken);

// User routes
router.get('/', userController.getAllUsers);
router.get('/me', userController.getCurrentUser);
router.get('/roster/personal', userController.getPersonalRoster);
router.get('/employment/daily', userController.getDailyEmployment);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);

module.exports = router;
