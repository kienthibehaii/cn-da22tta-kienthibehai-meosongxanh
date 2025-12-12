import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '', email: '' });
  const [message, setMessage] = useState({ type: '', content: '' }); // State thông báo
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' }); // Reset thông báo
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      setMessage({ type: 'success', content: 'Đăng ký thành công! Đang chuyển hướng...' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      // Lấy thông báo lỗi từ server trả về
      setMessage({ type: 'error', content: err.response?.data?.message || 'Đăng ký thất bại.' });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>🌱 Tạo tài khoản mới</h2>
        {/* Hiển thị thông báo nếu có */}
        {message.content && (
            <div className={`message-box ${message.type}`}>
                {message.content}
            </div>
        )}
        <form onSubmit={handleRegister}>
          <input placeholder="Họ và tên" onChange={e => setFormData({...formData, fullName: e.target.value})} required />
          <input placeholder="Email" type="email" onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input placeholder="Tên đăng nhập" onChange={e => setFormData({...formData, username: e.target.value})} required />
          <input placeholder="Mật khẩu" type="password" onChange={e => setFormData({...formData, password: e.target.value})} required />
          <button type="submit" className="outline">Đăng Ký</button>
        </form>
        <p style={{marginTop: '20px'}}>Đã có tài khoản? <Link to="/login" style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Đăng nhập</Link></p>
      </div>
    </div>
  );
};
export default Register;