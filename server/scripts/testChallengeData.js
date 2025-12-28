const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Script để kiểm tra dữ liệu challenge
const testChallengeData = async () => {
  try {
    console.log('🔍 Kiểm tra dữ liệu challenges...');
    
    const challenges = await Challenge.find({})
      .populate('participants.user', 'username')
      .populate('createdBy', 'username');
    
    console.log(`📊 Tổng số challenges: ${challenges.length}`);
    
    for (const challenge of challenges) {
      console.log(`\n📋 Challenge: ${challenge.title}`);
      console.log(`   Status: ${challenge.status}`);
      console.log(`   Participants: ${challenge.participants.length}`);
      
      for (const participant of challenge.participants) {
        console.log(`   - ${participant.user.username}: ${participant.status} (${participant.progress}%)`);
      }
    }
    
    // Kiểm tra users có điểm không
    console.log('\n👥 Kiểm tra điểm users:');
    const users = await User.find({ points: { $gt: 0 } }).select('username points challengeStats');
    
    for (const user of users) {
      console.log(`   - ${user.username}: ${user.points} điểm, ${user.challengeStats?.totalCompleted || 0} hoàn thành`);
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/forum_db')
    .then(() => {
      console.log('📦 Kết nối MongoDB thành công');
      return testChallengeData();
    })
    .then(() => {
      console.log('✨ Kiểm tra hoàn thành');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Lỗi:', error);
      process.exit(1);
    });
}

module.exports = testChallengeData;