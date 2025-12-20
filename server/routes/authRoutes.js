// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Password reset routes (simplified)
router.post('/verify-email', authController.verifyEmail);
router.post('/reset-password-simple', authController.resetPasswordSimple);

module.exports = router;