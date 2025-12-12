// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authController = require('./controllers/authController');

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes'); // <--- ĐÂY LÀ DÒNG BẠN BỊ THIẾU
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = 5000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DB & INIT ---
connectDB().then(() => {
  authController.createDefaultAdmin();
});

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes); // Dòng này gây lỗi nếu thiếu dòng require bên trên
app.use('/api/categories', categoryRoutes);
// --- START ---
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
});