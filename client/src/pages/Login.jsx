import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  // Thêm state message để lưu thông báo (type: 'error' hoặc 'success')
  const [message, setMessage] = useState({ type: '', content: '' });
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' }); // Xóa thông báo cũ mỗi khi bấm nút

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // 1. Nếu thành công: Hiện thông báo xanh
      setMessage({ type: 'success', content: 'Đăng nhập thành công! Đang chuyển trang...' });

      // 2. Lưu dữ liệu
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user_info', JSON.stringify(res.data));
      setUser(res.data);

      // 3. Đợi 1.5 giây để người dùng đọc thông báo rồi mới chuyển trang
      setTimeout(() => {
        navigate('/'); 
      }, 1500);

    } catch (err) {
      // 4. Nếu lỗi: Hiện thông báo đỏ
      // Lấy câu "Sai thông tin đăng nhập" từ Backend gửi về
      const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
      setMessage({ type: 'error', content: errorMsg });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>👋 Đăng Nhập EcoLife</h2>

        {/* --- KHỐI HIỂN THỊ THÔNG BÁO --- */}
        {message.content && (
            <div className={`message-box ${message.type}`}>
                {/* Thêm icon nhỏ cho sinh động */}
                {message.type === 'error' ? '⚠️ ' : '✅ '}
                {message.content}
            </div>
        )}
        
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Tên đăng nhập" 
            onChange={e => setFormData({...formData, username: e.target.value})} 
            required 
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            onChange={e => setFormData({...formData, password: e.target.value})} 
            required 
          />
          <button type="submit">Vào hệ thống</button>
        </form>
        
        <div className="auth-links">
          <p>
            Chưa có tài khoản? <Link to="/register" style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Đăng ký ngay</Link>
          </p>
          <p>
            <Link to="/forgot-password" style={{color: 'var(--secondary-color)', fontSize: '14px'}}>Quên mật khẩu?</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;