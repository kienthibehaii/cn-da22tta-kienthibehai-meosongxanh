import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Thay API Key thời tiết thật của bạn vào đây
const API_KEY = 'YOUR_API_KEY_HERE'; 

const Home = () => {
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  
  // --- SỬA LỖI 1: KHAI BÁO BIẾN pinnedArticles ---
  const [pinnedArticles, setPinnedArticles] = useState([]); 
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    // 1. Lấy tin tức
    axios.get('http://localhost:5000/api/posts?type=news&status=approved')
        .then(res => setNews(res.data))
        .catch(err => console.error(err));
    
    // 2. Lấy Top bài viết Forum
    axios.get('http://localhost:5000/api/posts/top')
        .then(res => setTopPosts(res.data))
        .catch(err => console.error(err));

    // 3. Lấy bài viết Kiến thức (Article) để lọc bài GHIM
    axios.get('http://localhost:5000/api/posts?type=article&status=approved')
        .then(res => {
            // Lọc những bài có isPinned = true
            const pinned = res.data.filter(p => p.isPinned);
            setPinnedArticles(pinned);
        })
        .catch(err => console.error(err));

    // 4. Lấy thời tiết
    getRealLocationWeather();
  }, []);

  const getRealLocationWeather = () => {
    if (!navigator.geolocation) {
        setLocationError('Trình duyệt không hỗ trợ định vị.');
        return;
    }
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}&lang=vi`);
                setWeather({
                    temp: Math.round(res.data.main.temp),
                    city: res.data.name,
                    desc: res.data.weather[0].description,
                    aqi: 2 
                });
            } catch(e) {
                setLocationError('Lỗi lấy thời tiết (Kiểm tra API Key).');
            }
        },
        () => {
            setLocationError('Bạn đã chặn quyền truy cập vị trí.');
        }
    );
  };

  return (
    <div className="home-page">
      
      {/* 1. Phần Thời tiết (Hero Section) */}
      <div className="hero-section" style={{display:'flex', gap:'30px', padding:'50px', background:'linear-gradient(135deg, #10b981, #047857)', color:'white', borderRadius:'20px', margin:'30px 20px', alignItems:'center', boxShadow:'0 10px 20px -10px rgba(16, 185, 129, 0.5)'}}>
         <div className="weather-card" style={{background:'rgba(255,255,255,0.25)', backdropFilter:'blur(10px)', padding:'25px', borderRadius:'16px', minWidth:'220px', textAlign:'center', border:'1px solid rgba(255,255,255,0.3)'}}>
            {locationError ? (
                <p style={{color: '#fee2e2'}}>{locationError}</p>
            ) : weather ? (
                <>
                    <h3>📍 {weather.city}</h3>
                    <div className="temp-box">
                        <span className="temp" style={{fontSize:'3.5rem', fontWeight:'800', display:'block', lineHeight:1}}>{weather.temp}°C</span>
                        <span className="desc" style={{fontSize:'1.1rem', textTransform:'capitalize'}}>{weather.desc}</span>
                    </div>
                    <div className="aqi-badge" style={{margin:'15px 0', padding:'8px 15px', background:'white', color:'#047857', borderRadius:'20px', fontWeight:'bold', display:'inline-block'}}>
                        Chất lượng không khí: Tốt
                    </div>
                    <p style={{marginTop: '15px'}}>💡 <i>Hôm nay trời đẹp, hãy đi xe đạp để bảo vệ môi trường!</i></p>
                </>
            ) : <p>Đang định vị & tải thời tiết...</p>}
         </div>
         <div className="hero-text">
            <h1 style={{fontSize:'2.5rem', marginBottom:'10px'}}>Chung tay vì một hành tinh xanh 🌍</h1>
            <p style={{fontSize: '1.2rem', opacity: 0.9}}>Biến đổi khí hậu đang diễn ra. Mỗi hành động nhỏ của bạn đều mang lại ý nghĩa lớn cho tương lai.</p>
         </div>
      </div>

      {/* 2. KIẾN THỨC NỔI BẬT (GHIM) */}
      {/* SỬA LỖI 2: Xóa thuộc tính padding bị lặp lại */}
      {pinnedArticles.length > 0 && (
          <div className="featured-section" style={{ marginBottom: '40px', background: '#f0f9ff', padding: '30px 20px' }}>
            <h2 style={{color: '#0284c7', marginBottom: '20px', textAlign:'center'}}>⭐ Kiến Thức Nổi Bật</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth:'1000px', margin:'0 auto'}}>
                {pinnedArticles.map(post => (
                    <Link to={`/post/${post._id}`} key={post._id} style={{textDecoration:'none', color:'inherit'}}>
                        <div style={{background: 'white', borderRadius: '10px', overflow:'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}>
                            {post.image && <img src={post.image} style={{width:'100%', height:'180px', objectFit:'cover'}} />}
                            <div style={{padding:'15px'}}>
                                <h3 style={{margin:'0 0 10px 0', fontSize:'1.2rem'}}>{post.title}</h3>
                                <p style={{color:'#666', fontSize:'0.9rem'}}>{post.content.substring(0, 80)}...</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
          </div>
      )}

      {/* 3. Phần Top Bài Viết Forum */}
      <div className="top-posts-section" style={{padding: '0 20px', marginBottom: '40px'}}>
        <h2 style={{color: 'var(--primary-color)', marginBottom: '20px'}}>🔥 Xu hướng cộng đồng</h2>
        <div className="top-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px'}}>
            {topPosts.length === 0 ? <p>Chưa có bài viết nổi bật.</p> : topPosts.map((post, index) => (
                <Link to={`/post/${post._id}`} key={post._id} className="post-card" style={{display: 'block', textDecoration: 'none', color: 'inherit', background:'white', padding:'20px', borderRadius:'12px', boxShadow:'0 2px 5px rgba(0,0,0,0.05)'}}>
                    <div style={{background: '#fef3c7', color: '#d97706', width: 'fit-content', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', marginBottom: '10px'}}>
                        Top #{index + 1}
                    </div>
                    <h3 style={{margin: '0 0 10px 0'}}>{post.title}</h3>
                    <p style={{fontSize: '0.9rem', color: '#666'}}>
                        👁️ {post.views} views • Đăng bởi: {post.author?.fullName}
                    </p>
                </Link>
            ))}
        </div>
      </div>

      {/* 4. Phần Tin tức */}
      <div className="news-section" style={{padding: '0 20px'}}>
        <h2 style={{color: 'var(--primary-color)', marginBottom: '25px'}}>📰 Tin Tức & Tuyên Truyền</h2>
        <div className="news-grid" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            {news.length === 0 ? <p>Chưa có tin tức nào.</p> : news.map(item => (
                <div key={item._id} className="news-card" style={{background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6'}}>
                    <div style={{marginBottom: '10px'}}><span className="tag" style={{background: '#dcfce7', color: '#047857', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'}}>{item.category}</span></div>
                    {item.image && <img src={item.image} alt={item.title} className="post-image" style={{height: '200px', width:'100%', objectFit:'cover', borderRadius:'8px', marginBottom: '15px'}} />}
                    <h3 style={{margin: '0 0 10px 0', fontSize: '1.3rem'}}>{item.title}</h3>
                    <p style={{color: 'var(--text-light)'}}>{item.content.substring(0, 120)}...</p>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default Home;