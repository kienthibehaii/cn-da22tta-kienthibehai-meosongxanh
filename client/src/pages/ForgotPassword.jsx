import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Đặt mật khẩu mới
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', content: '' });
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Bước 1: Xác thực email
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-email`, { email });
      setMessage({ type: 'success', content: res.data.message });
      setStep(2);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        content: err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Đặt mật khẩu mới
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', content: 'Mật khẩu xác nhận không khớp!' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', content: 'Mật khẩu phải có ít nhất 6 ký tự!' });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password-simple`, { 
        email, 
        newPassword 
      });
      setMessage({ type: 'success', content: res.data.message });
      
      // Chuyển về trang đăng nhập sau 2 giây
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        content: err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>🔐 Quên Mật Khẩu</h2>
        
        {/* Progress indicator */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>1</div>
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>2</div>
        </div>

        {/* Message box */}
        {message.content && (
          <div className={`message-box ${message.type}`}>
            {message.type === 'error' ? '⚠️ ' : '✅ '}
            {message.content}
          </div>
        )}

        {/* Step 1: Nhập email */}
        {step === 1 && (
          <form onSubmit={handleVerifyEmail}>
            <p className="text-gray-600 text-sm mb-4">
              Nhập email đã đăng ký để xác thực tài khoản
            </p>
            <input 
              type="email" 
              placeholder="Email của bạn" 
              value={email}
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác thực email'}
            </button>
          </form>
        )}

        {/* Step 2: Đặt mật khẩu mới */}
        {step === 2 && (
          <form onSubmit={handleResetPassword}>
            <p className="text-gray-600 text-sm mb-4">
              Email <strong>{email}</strong> đã được xác thực. Đặt mật khẩu mới:
            </p>
            <input 
              type="password" 
              placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)} 
              required 
              disabled={loading}
            />
            <input 
              type="password" 
              placeholder="Xác nhận mật khẩu mới" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="mt-2 bg-gray-300 hover:bg-gray-400"
              disabled={loading}
            >
              Quay lại
            </button>
          </form>
        )}

        <p style={{marginTop: '20px', textAlign: 'center'}}>
          <Link to="/login" style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>
            ← Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
