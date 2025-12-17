const mongoose = require('mongoose');
require('dotenv').config(); // Load biến môi trường

const connectDB = async () => {
  try {
    // Sử dụng biến môi trường, nếu không có thì fallback về local
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/greenlife_mvc';
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;