// server/models/Challenge.js
const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  pointsReward: {
    type: Number,
    required: true,
    min: 0,
    default: 10
  },
  
  // Thông tin về thời gian
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Trạng thái challenge
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Độ ưu tiên
  priority: {
    type: String,
    enum: ['lowest', 'low', 'medium', 'high', 'highest'],
    default: 'medium'
  },
  
  // Loại challenge
  category: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'special', 'community'],
    default: 'daily'
  },
  
  // Điều kiện hoàn thành
  requirements: {
    type: String,
    required: true
  },
  
  // Số lượng tham gia tối đa (nếu có giới hạn)
  maxParticipants: {
    type: Number,
    default: null // null = không giới hạn
  },
  
  // Danh sách người tham gia
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['joined', 'completed', 'failed'],
      default: 'joined'
    },
    completedAt: Date,
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  
  // Người tạo challenge
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Hình ảnh đại diện cho challenge
  image: {
    type: String,
    default: null
  },
  
  // Tags để phân loại
  tags: [String],
  
  // Thống kê
  stats: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    completedCount: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true // Tự động thêm createdAt và updatedAt
});

// Index để tối ưu query
ChallengeSchema.index({ status: 1, category: 1 });
ChallengeSchema.index({ endDate: 1 });
ChallengeSchema.index({ createdBy: 1 });

// Virtual để tính số người tham gia hiện tại
ChallengeSchema.virtual('currentParticipants').get(function() {
  return this.participants.length;
});

// Virtual để kiểm tra challenge có còn active không
ChallengeSchema.virtual('isActive').get(function() {
  return this.status === 'active' && new Date() <= this.endDate;
});

// Method để join challenge
ChallengeSchema.methods.joinChallenge = function(userId) {
  // Kiểm tra xem user đã tham gia chưa
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (existingParticipant) {
    throw new Error('User already joined this challenge');
  }
  
  // Kiểm tra giới hạn số người tham gia
  if (this.maxParticipants && this.participants.length >= this.maxParticipants) {
    throw new Error('Challenge is full');
  }
  
  // Kiểm tra challenge còn active không
  if (!this.isActive) {
    throw new Error('Challenge is not active');
  }
  
  this.participants.push({
    user: userId,
    joinedAt: new Date(),
    status: 'joined',
    progress: 0
  });
  
  this.stats.totalParticipants = this.participants.length;
  return this.save();
};

// Method để complete challenge
ChallengeSchema.methods.completeChallenge = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('User is not participating in this challenge');
  }
  
  if (participant.status === 'completed') {
    throw new Error('Challenge already completed by this user');
  }
  
  participant.status = 'completed';
  participant.completedAt = new Date();
  participant.progress = 100;
  
  // Cập nhật thống kê
  this.stats.completedCount = this.participants.filter(p => p.status === 'completed').length;
  this.stats.successRate = (this.stats.completedCount / this.stats.totalParticipants) * 100;
  
  return this.save();
};

// Method để update progress
ChallengeSchema.methods.updateProgress = function(userId, progress) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!participant) {
    throw new Error('User is not participating in this challenge');
  }
  
  participant.progress = Math.min(100, Math.max(0, progress));
  
  // Tự động complete nếu progress = 100
  if (participant.progress === 100 && participant.status !== 'completed') {
    participant.status = 'completed';
    participant.completedAt = new Date();
    this.stats.completedCount = this.participants.filter(p => p.status === 'completed').length;
    this.stats.successRate = (this.stats.completedCount / this.stats.totalParticipants) * 100;
  }
  
  return this.save();
};

// Pre-save middleware để cập nhật stats
ChallengeSchema.pre('save', function(next) {
  if (this.isModified('participants')) {
    this.stats.totalParticipants = this.participants.length;
    this.stats.completedCount = this.participants.filter(p => p.status === 'completed').length;
    if (this.stats.totalParticipants > 0) {
      this.stats.successRate = (this.stats.completedCount / this.stats.totalParticipants) * 100;
    }
  }
  next();
});

module.exports = mongoose.model('Challenge', ChallengeSchema);