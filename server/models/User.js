const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // ... các trường cũ
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, default: "Người dùng mới" },
  email: String,
  avatar: String,
  bio: String,
  
  // Sửa Enum Role
  role: { 
    type: String, 
    enum: ['admin', 'editor', 'moderator', 'content_writer', 'user'], 
    default: 'user' 
  },
  
  isBanned: { type: Boolean, default: false },
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);