const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authController = require('./controllers/authController');


// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

require('dotenv').config(); // Load biến môi trường

const app = express();
const PORT = process.env.PORT || 5000; // Render sẽ tự cấp PORT

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
// Uploads (Lưu ý: Trên Render miễn phí, ảnh upload sẽ mất sau khi restart server. Để lâu dài cần dùng Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DB & INIT ---
connectDB().then(() => {
  authController.createDefaultAdmin();
});

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// --- DEPLOYMENT CONFIG (QUAN TRỌNG) ---
// Kiểm tra nếu đang ở môi trường production (trên Render)
if (process.env.NODE_ENV === 'production') {
  // 1. Chỉ định thư mục chứa file build của React
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // 2. Với mọi request không phải API, trả về file index.html của React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
} else {
  // Ở môi trường dev
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// --- START ---
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});