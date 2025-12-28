import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Footer from './components/Footer'; // Đảm bảo bạn đã tạo file Footer.jsx như bài trước

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import News from './pages/News';
import Articles from './pages/Articles';
import Forum from './pages/Forum';
import ChallengesKanban from './pages/ChallengesKanban';
import Admin from './pages/Admin';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import EditPost from './pages/EditPost';
import Profile from './pages/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const savedUser = localStorage.getItem('user_info');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? "text-emerald-600 bg-emerald-50 font-bold" : "text-gray-600 hover:text-emerald-600 hover:bg-gray-50 font-medium";
  const isMobileActive = (path) => location.pathname === path ? "text-emerald-600 bg-emerald-50 font-bold" : "text-gray-700 hover:text-emerald-600 hover:bg-gray-50";
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-2xl group-hover:rotate-12 transition-transform">🌿</div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">EcoLife</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-1">
                <Link to="/" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/')}`}>Trang Chủ</Link>
                <Link to="/news" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/news')}`}>Tin Tức</Link>
                <Link to="/articles" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/articles')}`}>Kiến Thức</Link>
                <Link to="/forum" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/forum')}`}>Diễn Đàn</Link>
                <Link to="/challenges" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/challenges')}`}>🎯 Thử Thách</Link>
                {isAdmin && (
                    <Link to="/admin" className={`px-4 py-2 rounded-full text-sm transition-all ${isActive('/admin')} text-red-600 hover:bg-red-50 hover:text-red-700`}>🛡️ Quản Trị</Link>
                )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              {user && (
                <Link to="/profile" className="flex items-center">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border border-emerald-200" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-emerald-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* User Action - Desktop Only */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                  <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-full transition group">
                    {user.avatar ? (
                        <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border border-emerald-200" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                        {user.fullName.charAt(0)}
                        </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden sm:block group-hover:text-emerald-700">{user.fullName}</span>
                  </Link>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50" title="Đăng xuất">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link to="/login" className="text-gray-600 hover:text-emerald-600 font-medium text-sm px-3 py-2 transition-colors">Đăng Nhập</Link>
                  <Link to="/register" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-emerald-200 transition-all hover:shadow-emerald-300 transform hover:-translate-y-0.5">
                    Đăng Ký
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link 
                  to="/" 
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isMobileActive('/')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🏠 Trang Chủ
                </Link>
                <Link 
                  to="/news" 
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isMobileActive('/news')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📰 Tin Tức
                </Link>
                <Link 
                  to="/articles" 
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isMobileActive('/articles')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📚 Kiến Thức
                </Link>
                <Link 
                  to="/forum" 
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isMobileActive('/forum')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  💬 Diễn Đàn
                </Link>
                <Link 
                  to="/challenges" 
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isMobileActive('/challenges')}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🎯 Thử Thách
                </Link>
                
                {/* User actions for mobile */}
                {user ? (
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <Link 
                      to="/profile" 
                      className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      👤 Hồ Sơ ({user.fullName})
                    </Link>
                    {isAdmin && (
                      <Link 
                        to="/admin" 
                        className="flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        🛡️ Quản Trị
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                    >
                      🚪 Đăng Xuất
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
                    <Link 
                      to="/login" 
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      🔑 Đăng Nhập
                    </Link>
                    <Link 
                      to="/register" 
                      className="block px-3 py-2 rounded-md text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ✨ Đăng Ký
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow pb-10">
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            <Route path="/news" element={<News />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/challenges" element={<ChallengesKanban />} />
            
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/edit-post/:id" element={<EditPost />} />
            
            <Route path="/profile" element={user ? <Profile /> : <Login setUser={setUser}/>} />
            <Route path="/profile/:id" element={<Profile />} />
            
            <Route path="/admin" element={isAdmin ? <Admin /> : <div className="text-center mt-20 text-red-500 font-bold text-xl">🚫 Bạn không có quyền truy cập!</div>} />
        </Routes>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

export default App;