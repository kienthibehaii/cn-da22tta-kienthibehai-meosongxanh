const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'green_life_secret_key_pro';

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
    res.json({ token, username: user.username, role: user.role, fullName: user.fullName });
  } catch (e) {
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