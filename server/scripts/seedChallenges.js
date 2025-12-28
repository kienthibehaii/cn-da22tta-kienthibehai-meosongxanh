const mongoose = require('mongoose');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const sampleChallenges = [
  {
    title: "Sử dụng túi vải thay thế túi nilon",
    description: "Trong 7 ngày, hãy sử dụng túi vải hoặc túi tái sử dụng khi đi mua sắm thay vì túi nilon. Chụp ảnh và chia sẻ trải nghiệm của bạn!",
    requirements: "Sử dụng túi vải/túi tái sử dụng ít nhất 5 lần trong tuần, chụp ảnh làm bằng chứng",
    pointsReward: 50,
    category: "weekly",
    priority: "high",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày từ bây giờ
    maxParticipants: 100,
    tags: ["zero-waste", "shopping", "environment"],
    status: "active"
  },
  {
    title: "Tắt đèn khi không sử dụng",
    description: "Thử thách hàng ngày: Nhớ tắt đèn mỗi khi rời khỏi phòng. Một hành động nhỏ nhưng có tác động lớn đến môi trường!",
    requirements: "Tắt đèn mỗi khi rời khỏi phòng trong 1 ngày, ghi lại số lần bạn nhớ được",
    pointsReward: 20,
    category: "daily",
    priority: "medium",
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 ngày
    maxParticipants: null,
    tags: ["energy-saving", "daily-habit", "electricity"],
    status: "active"
  },
  {
    title: "Trồng một cây xanh",
    description: "Hãy trồng một cây xanh trong tháng này! Có thể là cây cảnh trong nhà, cây ăn quả trong vườn, hoặc tham gia trồng cây cộng đồng.",
    requirements: "Trồng ít nhất 1 cây, chăm sóc và chụp ảnh tiến trình phát triển của cây",
    pointsReward: 100,
    category: "monthly",
    priority: "highest",
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    maxParticipants: 50,
    tags: ["planting", "green", "nature", "community"],
    status: "active"
  },
  {
    title: "Ngày Trái Đất - Dọn dẹp môi trường",
    description: "Tham gia hoạt động dọn dẹp môi trường nhân Ngày Trái Đất. Cùng nhau làm sạch công viên, bãi biển, hoặc khu vực xung quanh nơi bạn sống.",
    requirements: "Tham gia ít nhất 2 giờ dọn dẹp môi trường, thu gom rác thải và phân loại đúng cách",
    pointsReward: 200,
    category: "special",
    priority: "highest",
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 ngày
    maxParticipants: 200,
    tags: ["earth-day", "cleanup", "community", "volunteer"],
    status: "active"
  },
  {
    title: "Thử thách ăn chay 1 ngày",
    description: "Hãy thử ăn chay trong 1 ngày để giảm lượng khí thải carbon. Khám phá những món ăn chay ngon và bổ dưỡng!",
    requirements: "Ăn chay hoàn toàn trong 1 ngày, chia sẻ món ăn chay yêu thích của bạn",
    pointsReward: 30,
    category: "daily",
    priority: "low",
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 ngày
    maxParticipants: null,
    tags: ["vegetarian", "food", "carbon-footprint", "health"],
    status: "active"
  },
  {
    title: "Cộng đồng xanh - Chia sẻ kiến thức",
    description: "Chia sẻ một bài viết, video hoặc mẹo về sống xanh với cộng đồng. Hãy lan tỏa thông điệp bảo vệ môi trường!",
    requirements: "Tạo và chia sẻ nội dung về sống xanh trên mạng xã hội hoặc diễn đàn, nhận ít nhất 10 tương tác",
    pointsReward: 75,
    category: "community",
    priority: "medium",
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
    maxParticipants: null,
    tags: ["sharing", "education", "social-media", "awareness"],
    status: "active"
  },
  {
    title: "Nghiên cứu năng lượng tái tạo",
    description: "Tìm hiểu và nghiên cứu về các loại năng lượng tái tạo. Tạo báo cáo hoặc presentation về chủ đề này.",
    requirements: "Tạo một báo cáo hoặc presentation về năng lượng tái tạo, ít nhất 10 slides",
    pointsReward: 150,
    category: "special",
    priority: "low",
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 ngày
    maxParticipants: 30,
    tags: ["research", "renewable-energy", "education"],
    status: "draft"
  },
  {
    title: "Giảm thiểu rác thải nhựa",
    description: "Thử thách 30 ngày giảm thiểu việc sử dụng đồ nhựa một lần. Tìm các giải pháp thay thế bền vững.",
    requirements: "Ghi lại hàng ngày các hành động giảm thiểu nhựa, chụp ảnh các giải pháp thay thế",
    pointsReward: 120,
    category: "monthly",
    priority: "high",
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày
    maxParticipants: 80,
    tags: ["plastic-free", "sustainability", "zero-waste"],
    status: "draft"
  }
];

const seedChallenges = async () => {
  try {
    await connectDB();
    
    // Tìm user admin để làm creator
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('⚠️ Không tìm thấy admin user, tạo user mặc định...');
      adminUser = new User({
        username: 'admin',
        password: '$2b$10$8K1p/a0dclxKNfHQfnpbKOxYyNOsxnlkL5nAzBgeqbHopQpuB1Jm2', // 123456
        fullName: 'Administrator',
        email: 'admin@ecolife.com',
        role: 'admin',
        points: 1000
      });
      await adminUser.save();
      console.log('✅ Đã tạo admin user');
    }

    // Xóa challenges cũ (nếu có)
    await Challenge.deleteMany({});
    console.log('🗑️ Đã xóa challenges cũ');

    // Thêm createdBy cho mỗi challenge
    const challengesWithCreator = sampleChallenges.map(challenge => ({
      ...challenge,
      createdBy: adminUser._id
    }));

    // Tạo challenges mới
    const createdChallenges = await Challenge.insertMany(challengesWithCreator);
    
    console.log(`✅ Đã tạo ${createdChallenges.length} sample challenges:`);
    createdChallenges.forEach((challenge, index) => {
      console.log(`   ${index + 1}. ${challenge.title} (${challenge.category}) - ${challenge.pointsReward} điểm`);
    });

    console.log('\n🎯 Bạn có thể truy cập http://localhost:5173/challenges để xem các thử thách!');
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo sample challenges:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối database');
  }
};

// Chạy script
seedChallenges();