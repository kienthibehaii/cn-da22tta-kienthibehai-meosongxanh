import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
// import axios from 'axios'; // Bỏ nếu không dùng trực tiếp ở đây
import './App.css';

// Import các trang
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import CreatePost from './pages/CreatePost';
import Forum from './pages/Forum';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import EditPost from './pages/EditPost';
import News from './pages/News';
import Articles from './pages/Articles';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  // Hàm kiểm tra quyền Admin (bao gồm cả admin và super_admin)
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <div className="app">
      <header>
        <div className="logo">🌿 EcoLife</div>
        <nav>
            <Link to="/">Trang Chủ</Link>
            <Link to="/news">Tin Tức</Link>
            <Link to="/articles">Kiến Thức</Link>
            <Link to="/forum">Diễn Đàn</Link>
            
            {/* Hiển thị nút Quản trị cho cả admin và super_admin */}
            {isAdmin && <Link to="/admin" style={{color:'red', fontWeight:'bold'}}>Quản Trị</Link>}
            
            {user ? (
                <div className="user-menu">
                    <Link to="/profile">👤 {user.fullName}</Link>
                    <button onClick={handleLogout} className="btn-logout">Thoát</button>
                </div>
            ) : (
                <div className="auth-links">
                    <Link to="/login">Đăng Nhập</Link>
                    <Link to="/register" className="btn-register-nav">Đăng Ký</Link>
                </div>
            )}
        </nav>
      </header>

      <main>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/news" element={<News />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/forum" element={<Forum />} />
            
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/edit-post/:id" element={<EditPost />} />
            
            <Route path="/profile" element={user ? <Profile /> : <Login setUser={setUser}/>} />
            <Route path="/profile/:id" element={<Profile />} />
            
            {/* Route Admin bảo vệ chặt chẽ hơn */}
            <Route path="/admin" element={isAdmin ? <Admin /> : <div style={{textAlign:'center', marginTop:'50px'}}><h2>🚫 Bạn không có quyền truy cập!</h2></div>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;