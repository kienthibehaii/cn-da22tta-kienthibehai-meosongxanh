const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Script để tạo thử thách test đã hoàn thành
const createTestCompletedChallenge = async () => {
  try {
    console.log('🎯 Tạo thử thách test đã hoàn thành...');
    
    // Tìm user đầu tiên để test
    const user = await User.findOne({});
    if (!user) {
      console.log('❌ Không tìm thấy user nào để test');
      return;
    }
    
    console.log(`👤 Sử dụng user: ${user.username} (${user._id})`);
    
    // Tạo challenge mới
    const challenge = new Challenge({
      title: 'Test Challenge - Đã Hoàn Thành',
      description: 'Đây là thử thách test để kiểm tra hiển thị trạng thái hoàn thành',
      requirements: 'Hoàn thành task test này',
      pointsReward: 50,
      category: 'daily',
      priority: 'medium',
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày sau
      createdBy: user._id,
      status: 'active'
    });
    
    await challenge.save();
    console.log(`✅ Đã tạo challenge: ${challenge._id}`);
    
    // User tham gia challenge
    await challenge.joinChallenge(user._id);
    console.log('✅ User đã tham gia challenge');
    
    // Cập nhật progress thành 100% (hoàn thành)
    await challenge.updateProgress(user._id, 100);
    console.log('✅ Đã cập nhật progress thành 100%');
    
    // Cập nhật điểm cho user
    user.points = (user.points || 0) + challenge.pointsReward;
    user.challengeStats.totalJoined = (user.challengeStats.totalJoined || 0) + 1;
    user.challengeStats.totalCompleted = (user.challengeStats.totalCompleted || 0) + 1;
    user.challengeStats.successRate = Math.round((user.challengeStats.totalCompleted / user.challengeStats.totalJoined) * 100);
    
    await user.save();
    console.log(`✅ Đã cập nhật điểm user: ${user.points} điểm`);
    
    // Kiểm tra kết quả
    const updatedChallenge = await Challenge.findById(challenge._id).populate('participants.user', 'username');
    console.log('\n📊 Kết quả:');
    console.log(`Challenge: ${updatedChallenge.title}`);
    console.log(`Status: ${updatedChallenge.status}`);
    console.log('Participants:');
    
    for (const participant of updatedChallenge.participants) {
      console.log(`  - ${participant.user.username}: ${participant.status} (${participant.progress}%)`);
    }
    
    console.log('\n🎉 Tạo test data thành công!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/forum_db')
    .then(() => {
      console.log('📦 Kết nối MongoDB thành công');
      return createTestCompletedChallenge();
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

module.exports = createTestCompletedChallenge;