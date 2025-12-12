const express = require('express');
const router = express.Router();
const catController = require('../controllers/categoryController');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', catController.getCategories); // Public để load danh mục khi viết bài
router.post('/', verifyToken, catController.createCategory);
router.delete('/:id', verifyToken, catController.deleteCategory);

module.exports = router;