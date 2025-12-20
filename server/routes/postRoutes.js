const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const verifyToken = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public Routes
router.get('/', postController.getPosts);
router.get('/test', (req, res) => {
  res.json({ message: 'Posts API is working', timestamp: new Date() });
});
router.get('/top', postController.getTopPosts);
router.get('/:id', postController.getPostDetail);

// Protected Routes (Cần đăng nhập)
// QUAN TRỌNG: Dòng dưới đây xử lý Đăng bài
router.post('/', verifyToken, upload.single('image'), postController.createPost);

router.put('/:id', verifyToken, upload.single('image'), postController.updatePost);
router.delete('/:id', verifyToken, postController.deletePost);

router.put('/:id/like', verifyToken, postController.likePost);
router.put('/:id/save', verifyToken, postController.savePost);
router.post('/:id/report', verifyToken, postController.reportPost);

// Comments
router.post('/:id/comments', verifyToken, postController.addComment);
router.delete('/comments/:id', verifyToken, postController.deleteComment);
router.put('/comments/:id/like', verifyToken, postController.likeComment);
router.put('/comments/:id/report', verifyToken, postController.reportComment);

module.exports = router;