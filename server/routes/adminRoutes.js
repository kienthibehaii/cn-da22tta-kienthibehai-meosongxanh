const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');

// Users
router.get('/users', verifyToken, adminController.getAllUsers);
router.put('/users/:id/role', verifyToken, adminController.updateUserRole); // Đổi quyền
router.put('/users/:id/ban', verifyToken, adminController.toggleBanUser);   // Khóa/Mở

// Topics
router.get('/topics', verifyToken, adminController.getTopics);
router.post('/topics', verifyToken, adminController.createTopic);
router.delete('/topics/:id', verifyToken, adminController.deleteTopic);

// --- THÊM ROUTE GHIM ---
router.put('/posts/:id/pin', verifyToken, adminController.togglePinPost);

// Posts Management
router.get('/posts-by-type', verifyToken, adminController.getPostsByType); // Lấy theo loại
router.put('/reports/:id/dismiss', verifyToken, adminController.dismissReport); // Báo cáo an toàn

router.get('/stats', verifyToken, adminController.getStats);
router.get('/users', verifyToken, adminController.getAllUsers); // Mới: Lấy User
router.delete('/users/:id', verifyToken, adminController.deleteUser); // Mới: Xóa User
router.get('/posts', verifyToken, adminController.getAllPostsAdmin); // Mới: Lấy All Posts

router.put('/posts/:id/approve', verifyToken, adminController.approvePost);
router.get('/reports', verifyToken, adminController.getReportedPosts);

module.exports = router;