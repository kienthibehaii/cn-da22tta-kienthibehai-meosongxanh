const mongoose = require('mongoose');
const User = require('../models/User');
const Challenge = require('../models/Challenge');

// Script để cập nhật challengeStats cho các user hiện tại
const updateUserChallengeStats = async () => {
  try {
    console.log('🔄 Bắt đầu cập nhật challengeStats cho users...');
    
    const users = await User.find({});
    
    for (const user of users) {
      // Tìm tất cả challenges mà user đã tham gia
      const userChallenges = await Challenge.find({
        'participants.user': user._id
      });
      
      let totalJoined = 0;
      let totalCompleted = 0;
      let totalPoints = 0;
      
      for (const challenge of userChallenges) {
        const participant = challenge.participants.find(p => 
          p.user.toString() === user._id.toString()
        );
        
        if (participant) {
          totalJoined++;
          if (participant.status === 'completed') {
            totalCompleted++;
            totalPoints += challenge.pointsReward;
          }
        }
      }
      
      // Tính success rate
      const successRate = totalJoined > 0 ? Math.round((totalCompleted / totalJoined) * 100) : 0;
      
      // Cập nhật user
      await User.findByIdAndUpdate(user._id, {
        points: totalPoints,
        challengeStats: {
          totalJoined,
          totalCompleted,
          successRate
        }
      });
      
      console.log(`✅ Updated ${user.username}: ${totalCompleted}/${totalJoined} challenges, ${totalPoints} points, ${successRate}% success rate`);
    }
    
    console.log('🎉 Hoàn thành cập nhật challengeStats!');
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật challengeStats:', error);
  }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/forum_db')
    .then(() => {
      console.log('📦 Kết nối MongoDB thành công');
      return updateUserChallengeStats();
    })
    .then(() => {
      console.log('✨ Script hoàn thành');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Lỗi:', error);
      process.exit(1);
    });
}

module.exports = updateUserChallengeStats;