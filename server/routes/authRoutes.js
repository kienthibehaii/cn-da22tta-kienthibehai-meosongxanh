// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Chỉ giữ lại 2 dòng này
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;