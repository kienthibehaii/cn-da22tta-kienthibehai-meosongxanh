import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// ⚠️ CẤU HÌNH API KEY RIÊNG BIỆT
const WEATHER_API_KEY = '278b369b634e6ed7f3fbb56044eb0196'; // Key lấy từ openweathermap.org
const AQI_API_KEY = 'dd55bc5957b6d1acc6b9313ccd429835cdbf95f7';         // Key lấy từ aqicn.org (WAQI)

const Home = () => {
  const [weather, setWeather] = useState(null);
  const [aqiData, setAqiData] = useState(null); 
  const [news, setNews] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [pinnedArticles, setPinnedArticles] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    // 1. Lấy tin tức & bài viết (Giữ nguyên)
    axios.get('http://localhost:5000/api/posts?type=news&status=approved').then(res => setNews(res.data)).catch(e => console.error(e));
    axios.get('http://localhost:5000/api/posts/top').then(res => setTopPosts(res.data)).catch(e => console.error(e));
    axios.get('http://localhost:5000/api/posts?type=article&status=approved').then(res => {
        setPinnedArticles(res.data.filter(p => p.isPinned));
    }).catch(e => console.error(e));

    // 2. Bắt đầu lấy vị trí và thời tiết
    getRealLocationData();
  }, []);

  const getRealLocationData = () => {
    if (!navigator.geolocation) {
        setLocationError('Trình duyệt không hỗ trợ định vị.');
        setLoadingWeather(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // --- A. GỌI API THỜI TIẾT (OpenWeatherMap) ---
                const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}&lang=vi`);
                
                // --- B. GỌI API ĐỊA DANH (Reverse Geocoding - OpenWeatherMap) ---
                const geoRes = await axios.get(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${WEATHER_API_KEY}`);
                const localName = geoRes.data[0]?.local_names?.vi || geoRes.data[0]?.name || weatherRes.data.name;

                setWeather({
                    temp: Math.round(weatherRes.data.main.temp),
                    city: localName,
                    desc: weatherRes.data.weather[0].description,
                    icon: weatherRes.data.weather[0].icon
                });

                // --- C. GỌI API CHẤT LƯỢNG KHÔNG KHÍ (AQICN - WAQI) ---
                // Sử dụng API Key riêng cho AQI
                const pollutionRes = await axios.get(`https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${AQI_API_KEY}`);
                
                if (pollutionRes.data.status === 'ok') {
                    const aqiValue = pollutionRes.data.data.aqi; // Giá trị AQI thực tế (0-500+)
                    setAqiData(getAqiInfo(aqiValue));
                } else {
                    console.error("Lỗi API AQI:", pollutionRes.data.data);
                }

                setLoadingWeather(false);
            } catch(e) {
                console.error("Lỗi API:", e);
                setLocationError('Lỗi lấy dữ liệu (Kiểm tra lại các API Key).');
                setLoadingWeather(false);
            }
        },
        () => {
            setLocationError('Bạn đã chặn quyền truy cập vị trí. Không thể lấy thời tiết.');
            setLoadingWeather(false);
        }
    );
  };

  // Helper: Chuyển đổi chỉ số AQI (Thang chuẩn 0-500) sang thông tin hiển thị
  const getAqiInfo = (aqi) => {
      // Logic màu sắc chuẩn theo thang AQI quốc tế
      if (aqi <= 50) return { value: aqi, level: 'Tốt', color: '#10b981', desc: 'Không khí trong lành.' };
      if (aqi <= 100) return { value: aqi, level: 'Trung bình', color: '#eab308', desc: 'Chấp nhận được.' };
      if (aqi <= 150) return { value: aqi, level: 'Kém', color: '#f97316', desc: 'Nhóm nhạy cảm nên hạn chế ra ngoài.' };
      if (aqi <= 200) return { value: aqi, level: 'Xấu', color: '#ef4444', desc: 'Có hại sức khỏe, nên đeo khẩu trang.' };
      if (aqi <= 300) return { value: aqi, level: 'Rất xấu', color: '#881337', desc: 'Cảnh báo sức khỏe khẩn cấp!' };
      return { value: aqi, level: 'Nguy hại', color: '#450a0a', desc: 'Mọi người nên ở trong nhà.' };
  };

  return (
    <div className="home-page">
      
      {/* 1. HERO SECTION: THỜI TIẾT & AQI */}
      <div className="hero-section" style={{display:'flex', flexDirection:'column', gap:'20px', padding:'40px', background:'linear-gradient(135deg, #0f766e, #115e59)', color:'white', borderRadius:'20px', margin:'20px', boxShadow:'0 10px 25px -5px rgba(15, 118, 110, 0.5)'}}>
         
         <div style={{display:'flex', flexWrap:'wrap', gap:'40px', alignItems:'center', justifyContent:'center'}}>
             {/* Thẻ Thời Tiết */}
             <div className="weather-card" style={{background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', padding:'20px', borderRadius:'16px', minWidth:'280px', textAlign:'center', border:'1px solid rgba(255,255,255,0.2)'}}>
                {loadingWeather ? <p>📡 Đang định vị & tải dữ liệu...</p> : 
                 locationError ? <p style={{color:'#fca5a5'}}>{locationError}</p> : 
                 weather && (
                    <>
                        <h2 style={{margin:'0 0 10px 0', fontSize:'1.5rem'}}>📍 {weather.city}</h2>
                        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'10px'}}>
                            <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt="icon" style={{width:'60px'}} />
                            <span style={{fontSize:'3.5rem', fontWeight:'bold', lineHeight:1}}>{weather.temp}°</span>
                        </div>
                        <p style={{textTransform:'capitalize', fontSize:'1.1rem', margin:'5px 0'}}>{weather.desc}</p>
                    </>
                )}
             </div>

             {/* Thẻ AQI (Chất lượng không khí - Dữ liệu từ AQICN) */}
             {aqiData && (
                 <div className="aqi-card" style={{background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', padding:'20px', borderRadius:'16px', minWidth:'280px', textAlign:'center', border:'1px solid rgba(255,255,255,0.2)'}}>
                    <h3 style={{margin:'0 0 15px 0', fontSize:'1.2rem', opacity:0.9}}>💨 Chất lượng không khí</h3>
                    <div style={{background: 'white', color: aqiData.color, padding:'8px 20px', borderRadius:'20px', fontWeight:'bold', fontSize:'2rem', display:'inline-block', marginBottom:'10px', minWidth:'100px'}}>
                        {aqiData.value}
                    </div>
                    <div style={{fontSize:'1.2rem', fontWeight:'bold', marginBottom:'5px'}}>{aqiData.level}</div>
                    <p style={{margin:0, fontSize:'0.95rem', opacity:0.9}}>{aqiData.desc}</p>
                 </div>
             )}
         </div>

         <div className="hero-text" style={{textAlign:'center', marginTop:'20px'}}>
            <h1 style={{fontSize:'2.2rem', marginBottom:'10px'}}>Hành động nhỏ - Ý nghĩa lớn 🌍</h1>
            <p style={{fontSize: '1.1rem', opacity: 0.9, maxWidth:'600px', margin:'0 auto'}}>Cùng cộng đồng EcoLife chia sẻ kiến thức và lan tỏa lối sống xanh để bảo vệ môi trường ngay hôm nay.</p>
         </div>
      </div>

      {/* 2. KIẾN THỨC NỔI BẬT (GHIM) */}
      {pinnedArticles.length > 0 && (
          <div className="featured-section" style={{marginBottom: '40px', background: '#f0f9ff', padding: '30px 20px'}}>
            <h2 style={{color: '#0284c7', marginBottom: '20px', textAlign:'center', fontSize:'1.8rem'}}>⭐ Kiến Thức Nổi Bật</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth:'1200px', margin:'0 auto'}}>
                {pinnedArticles.map(post => (
                    <Link to={`/post/${post._id}`} key={post._id} style={{textDecoration:'none', color:'inherit'}}>
                        <div style={{background: 'white', borderRadius: '12px', overflow:'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', transition:'transform 0.2s', height:'100%'}}>
                            {post.image && <img src={post.image} style={{width:'100%', height:'180px', objectFit:'cover'}} />}
                            <div style={{padding:'20px'}}>
                                <h3 style={{margin:'0 0 10px 0', fontSize:'1.2rem', color:'#0284c7'}}>{post.title}</h3>
                                <p style={{color:'#666', fontSize:'0.9rem', lineHeight:'1.5'}}>{post.content.substring(0, 80)}...</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
          </div>
      )}

      <div style={{maxWidth:'1200px', margin:'0 auto', padding:'0 20px', display:'grid', gridTemplateColumns:'2fr 1fr', gap:'40px'}}>
          
          {/* 3. TIN TỨC MỚI */}
          <div className="news-section">
            <h2 style={{color: '#10b981', marginBottom: '20px', borderBottom:'2px solid #10b981', paddingBottom:'10px', display:'inline-block'}}>📰 Tin Tức Mới Nhất</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                {news.length === 0 ? <p>Chưa có tin tức nào.</p> : news.map(item => (
                    <Link to={`/post/${item._id}`} key={item._id} style={{textDecoration:'none', color:'inherit'}}>
                        <div style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display:'flex', gap:'20px', alignItems:'center'}}>
                            {item.image && <img src={item.image} alt={item.title} style={{height: '100px', width:'140px', objectFit:'cover', borderRadius:'8px'}} />}
                            <div>
                                <span style={{background: '#dcfce7', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'}}>{item.category}</span>
                                <h3 style={{margin: '8px 0', fontSize: '1.1rem'}}>{item.title}</h3>
                                <small style={{color:'#999'}}>{new Date(item.createdAt).toLocaleDateString()}</small>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
          </div>

          {/* 4. TOP DIỄN ĐÀN (SIDEBAR) */}
          <div className="top-posts-section">
            <h2 style={{color: '#f59e0b', marginBottom: '20px', borderBottom:'2px solid #f59e0b', paddingBottom:'10px'}}>🔥 Sôi Động Nhất</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {topPosts.length === 0 ? <p>Chưa có bài viết nổi bật.</p> : topPosts.map((post, index) => (
                    <Link to={`/post/${post._id}`} key={post._id} style={{textDecoration: 'none', color: 'inherit'}}>
                        <div style={{background:'white', padding:'15px', borderRadius:'10px', boxShadow:'0 2px 4px rgba(0,0,0,0.05)', display:'flex', gap:'10px', alignItems:'center'}}>
                            <div style={{background: index===0?'#f59e0b':(index===1?'#94a3b8':'#b45309'), color: 'white', width: '30px', height: '30px', borderRadius: '50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', flexShrink:0}}>
                                {index + 1}
                            </div>
                            <div>
                                <h4 style={{margin: '0 0 5px 0', fontSize:'1rem'}}>{post.title}</h4>
                                <p style={{fontSize: '0.8rem', color: '#666', margin:0}}>
                                    👁️ {post.views} • {post.author?.fullName}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
          </div>

      </div>
    </div>
  );
};

export default Home;