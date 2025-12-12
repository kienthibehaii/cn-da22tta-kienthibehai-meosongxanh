const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/profile', verifyToken, userController.getProfile);
router.put('/profile', verifyToken, upload.single('avatar'), userController.updateProfile);

module.exports = router;