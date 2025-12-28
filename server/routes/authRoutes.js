// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', verifyToken, authController.getMe);

// Password reset routes (simplified)
router.post('/verify-email', authController.verifyEmail);
router.post('/reset-password-simple', authController.resetPasswordSimple);

module.exports = router;