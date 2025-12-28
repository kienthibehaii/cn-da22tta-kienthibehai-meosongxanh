const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SECRET_KEY = 'green_life_secret_key_pro';

// Hàm tạo OTP 6 số
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hàm gửi email (giả lập - trong thực tế sẽ dùng nodemailer)
const sendEmail = async (email, subject, message) => {
  // Trong môi trường thực tế, bạn sẽ dùng nodemailer hoặc service email khác
  console.log(`📧 Email gửi đến ${email}:`);
  console.log(`Tiêu đề: ${subject}`);
  console.log(`Nội dung: ${message}`);
  console.log('---');
  
  // Giả lập việc gửi email thành công
  return Promise.resolve(true);
};

// Đăng ký
exports.register = async (req, res) => {
  const { username, password, fullName, email } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, fullName, email, role: 'user' });
    
    await newUser.save();
    res.json({ message: 'Đăng ký thành công' });
  } catch (e) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    
    // Kiểm tra User tồn tại
    if (!user) return res.status(400).json({ message: 'Sai thông tin đăng nhập' });

    // Kiểm tra bị khóa
    if (user.isBanned) {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị KHÓA. Vui lòng liên hệ quản trị viên." });
    }
    
    // Kiểm tra mật khẩu
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Sai thông tin đăng nhập' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY);
    res.json({ 
      token, 
      _id: user._id,
      username: user.username, 
      role: user.role, 
      fullName: user.fullName 
    });
  } catch (e) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xác thực email đơn giản (không cần OTP)
exports.verifyEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại trong hệ thống!' });
    }

    res.json({ 
      message: `Email ${email} đã được xác thực thành công! Bạn có thể đặt mật khẩu mới.` 
    });

  } catch (error) {
    console.error('Lỗi xác thực email:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
  }
};

// Đặt lại mật khẩu đơn giản (chỉ cần email)
exports.resetPasswordSimple = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Tìm user theo email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ 
        message: 'Email không tồn tại trong hệ thống!' 
      });
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.' 
    });

  } catch (error) {
    console.error('Lỗi đặt lại mật khẩu:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
  }
};

// Lấy thông tin user hiện tại
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy user' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// --- HÀM TẠO ADMIN MẶC ĐỊNH (ĐÃ FIX LỖI E11000) ---
exports.createDefaultAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Tìm user có username là "admin" (Thay vì tìm theo role)
    // Điều này ngăn chặn việc cố tạo username "admin" khi nó đã tồn tại
    let adminUser = await User.findOne({ username: 'admin' });

    if (!adminUser) {
      // Nếu chưa có -> Tạo mới
      adminUser = new User({
        username: 'admin',
        password: hashedPassword,
        fullName: 'Super Administrator',
        email: 'admin@ecolife.com',
        role: 'admin' // Set luôn là Super Admin
      });
      await adminUser.save();
      console.log('✅ Đã TẠO MỚI tài khoản Admin: admin / 123456');
    } else {
      // Nếu đã có -> Cập nhật lại quyền và mật khẩu (để đảm bảo bạn luôn vào được)
      adminUser.password = hashedPassword;
      adminUser.role = 'admin'; // Nâng quyền lên Super Admin
      await adminUser.save();
      console.log('🔄 Đã RESET tài khoản Admin: admin / 123456 (Role: Admin)');
    }
  } catch (err) { console.error('Lỗi tạo Admin:', err); }
};