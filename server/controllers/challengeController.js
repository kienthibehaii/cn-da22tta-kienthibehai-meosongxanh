const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Lấy tất cả challenges
const getAllChallenges = async (req, res) => {
  try {
    const { category, status } = req.query;
    let filter = {};
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (status) {
      filter.status = status;
    }

    const challenges = await Challenge.find(filter)
      .populate('createdBy', 'username avatar')
      .populate('participants.user', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách challenges' });
  }
};

// Lấy challenge theo ID
const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('createdBy', 'username avatar')
      .populate('participants.user', 'username avatar');

    if (!challenge) {
      return res.status(404).json({ message: 'Không tìm thấy challenge' });
    }

    res.json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin challenge' });
  }
};

// Tạo challenge mới
const createChallenge = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      pointsReward,
      category,
      endDate,
      maxParticipants,
      tags
    } = req.body;

    // Validation
    if (!title || !description || !requirements || !endDate) {
      return res.status(400).json({ 
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
      });
    }

    // Kiểm tra endDate phải là tương lai
    if (new Date(endDate) <= new Date()) {
      return res.status(400).json({ 
        message: 'Ngày kết thúc phải là thời gian trong tương lai' 
      });
    }

    const challenge = new Challenge({
      title,
      description,
      requirements,
      pointsReward: pointsReward || 10,
      category: category || 'daily',
      endDate,
      maxParticipants: maxParticipants || null,
      tags: tags || [],
      createdBy: req.user.id,
      status: 'active'
    });

    await challenge.save();
    
    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('createdBy', 'username avatar');

    res.status(201).json(populatedChallenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Lỗi server khi tạo challenge' });
  }
};

// Tham gia challenge
const joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Không tìm thấy challenge' });
    }

    // Sử dụng method từ model
    await challenge.joinChallenge(req.user.id);
    
    // Cập nhật stats cho user
    const user = await User.findById(req.user.id);
    if (user) {
      user.challengeStats.totalJoined = (user.challengeStats.totalJoined || 0) + 1;
      await user.save();
    }
    
    const updatedChallenge = await Challenge.findById(challenge._id)
      .populate('createdBy', 'username avatar')
      .populate('participants.user', 'username avatar');

    res.json(updatedChallenge);
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(400).json({ message: error.message || 'Lỗi khi tham gia challenge' });
  }
};

// Hoàn thành challenge
const completeChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Không tìm thấy challenge' });
    }

    // Sử dụng method từ model
    await challenge.completeChallenge(req.user.id);
    
    // Cộng điểm và cập nhật stats cho user
    const user = await User.findById(req.user.id);
    if (user) {
      user.points = (user.points || 0) + challenge.pointsReward;
      
      // Cập nhật challengeStats
      user.challengeStats.totalCompleted = (user.challengeStats.totalCompleted || 0) + 1;
      
      // Tính lại success rate
      if (user.challengeStats.totalJoined > 0) {
        user.challengeStats.successRate = Math.round((user.challengeStats.totalCompleted / user.challengeStats.totalJoined) * 100);
      }
      
      await user.save();
    }

    const updatedChallenge = await Challenge.findById(challenge._id)
      .populate('createdBy', 'username avatar')
      .populate('participants.user', 'username avatar');

    res.json({
      challenge: updatedChallenge,
      pointsEarned: challenge.pointsReward
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    res.status(400).json({ message: error.message || 'Lỗi khi hoàn thành challenge' });
  }
};

// Cập nhật tiến độ
const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    
    if (progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Tiến độ phải từ 0 đến 100' });
    }

    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Không tìm thấy challenge' });
    }

    // Kiểm tra xem user đã hoàn thành chưa trước khi update
    const participant = challenge.participants.find(p => p.user.toString() === req.user.id);
    const wasCompleted = participant && participant.status === 'completed';

    // Sử dụng method từ model
    await challenge.updateProgress(req.user.id, progress);
    
    // Nếu hoàn thành 100% và chưa từng hoàn thành trước đó, cộng điểm
    if (progress === 100 && !wasCompleted) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.points = (user.points || 0) + challenge.pointsReward;
        
        // Cập nhật challengeStats
        user.challengeStats.totalCompleted = (user.challengeStats.totalCompleted || 0) + 1;
        
        // Tính lại success rate
        if (user.challengeStats.totalJoined > 0) {
          user.challengeStats.successRate = Math.round((user.challengeStats.totalCompleted / user.challengeStats.totalJoined) * 100);
        }
        
        await user.save();
      }
    }

    const updatedChallenge = await Challenge.findById(challenge._id)
      .populate('createdBy', 'username avatar')
      .populate('participants.user', 'username avatar');

    res.json(updatedChallenge);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(400).json({ message: error.message || 'Lỗi khi cập nhật tiến độ' });
  }
};

// Lấy challenges của user hiện tại
const getMyChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      'participants.user': req.user.id
    })
    .populate('createdBy', 'username avatar')
    .populate('participants.user', 'username avatar')
    .sort({ createdAt: -1 });

    res.json(challenges);
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy challenges của bạn' });
  }
};

// Cập nhật challenge (chỉ creator)
const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Không tìm thấy challenge' });
    }

    // Kiểm tra quyền sở hữu
    if (challenge.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa challenge này' });
    }

    const allowedUpdates = ['title', 'description', 'requirements', 'endDate', 'status', 'tags'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'username avatar')
    .populate('participants.user', 'username avatar');

    res.json(updatedChallenge);
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật challenge' });
  }
};

// Xóa challenge (chỉ creator)
const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Không tìm thấy challenge' });
    }

    // Kiểm tra quyền sở hữu
    if (challenge.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa challenge này' });
    }

    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa challenge thành công' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({ message: 'Lỗi server khi xóa challenge' });
  }
};

// Lấy bảng xếp hạng
const getLeaderboard = async (req, res) => {
  try {
    const { period = 'all' } = req.query;
    let dateFilter = {};
    
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { 'participants.completedAt': { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { 'participants.completedAt': { $gte: monthAgo } };
    }

    const leaderboard = await Challenge.aggregate([
      { $match: dateFilter },
      { $unwind: '$participants' },
      { $match: { 'participants.status': 'completed' } },
      {
        $group: {
          _id: '$participants.user',
          completedChallenges: { $sum: 1 },
          totalPoints: { $sum: '$pointsReward' }
        }
      },
      { $sort: { totalPoints: -1, completedChallenges: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: {
            _id: '$user._id',
            username: '$user.username',
            avatar: '$user.avatar'
          },
          completedChallenges: 1,
          totalPoints: 1
        }
      }
    ]);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy bảng xếp hạng' });
  }
};

module.exports = {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  joinChallenge,
  completeChallenge,
  updateProgress,
  getMyChallenges,
  updateChallenge,
  deleteChallenge,
  getLeaderboard
};