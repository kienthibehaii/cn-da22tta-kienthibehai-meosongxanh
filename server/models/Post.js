const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  type: { type: String, enum: ['news', 'forum', 'article'], required: true },
  
  // --- TÁCH BIỆT ---
  // 1. Dành cho Tin tức/Bài viết (Liên kết với bảng Category)
  newsCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  
  // 2. Dành cho Diễn đàn (Lưu tên chủ đề dạng text hoặc ref tới Topic nếu muốn chặt chẽ)
  forumTopic: { type: String }, 
  // -----------------

  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  views: { type: Number, default: 0 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  commentsCount: { type: Number, default: 0 },
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);