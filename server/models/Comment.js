const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  content: { type: String, required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  
  // --- MỚI ---
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Like bình luận
  reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Báo cáo bình luận
  // -----------
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', CommentSchema);