import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { WEATHER_KEY, IQAIR_KEY, API_URL } from '../apiConfig';// Import từ file cấu hình

const Home = () => {
  const [weather, setWeather] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [news, setNews] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [pinnedArticles, setPinnedArticles] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [loadingWeather, setLoadingWeather] = useState(true);

useEffect(() => {
    // 1. Fetch dữ liệu từ Server Backend
    const fetchData = async () => {
        try {
            // Lấy Tin tức
            axios.get(`${API_URL}/posts?type=news&status=approved`)
                .then(res => setNews(res.data))
                .catch(err => console.error("Lỗi tải tin tức:", err));

            // Lấy Top bài viết Forum
            axios.get(`${API_URL}/posts/top`)
                .then(res => setTopPosts(res.data))
                .catch(err => console.error("Lỗi tải top bài:", err));

            // Lấy Bài viết Kiến thức để lọc bài GHIM
            axios.get(`${API_URL}/posts?type=article&status=approved`)
                .then(res => {
                    const pinned = res.data.filter(p => p.isPinned);
                    setPinnedArticles(pinned);
                })
                .catch(err => console.error("Lỗi tải bài ghim:", err));

            // Lấy Challenges nổi bật
            axios.get(`${API_URL}/challenges?limit=3`)
                .then(res => setChallenges(res.data.slice(0, 3)))
                .catch(err => console.error("Lỗi tải challenges:", err));
        } catch (e) {
            console.error("Lỗi kết nối Server:", e);
        }
    };
    fetchData();

    // 2. Fetch dữ liệu Môi trường (Weather & AQI)
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
        console.log('Vị trí người dùng:', { latitude, longitude });

        try {
        // --- A. Weather API (OpenWeatherMap) ---
        const weatherRes = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_KEY}&lang=vi`
        );

        // --- B. Reverse Geocoding ---
        const geoRes = await axios.get(
            `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${WEATHER_KEY}`
        );

        const localName =
            geoRes.data[0]?.local_names?.vi ||
            geoRes.data[0]?.name ||
            weatherRes.data.name;

        setWeather({
            temp: Math.round(weatherRes.data.main.temp),
            city: localName,
            desc: weatherRes.data.weather[0].description,
            icon: weatherRes.data.weather[0].icon,
        });

        // --- C. AQI API (IQAir - Cải thiện) ---
        try {
            console.log('Đang gọi IQAir API với tọa độ:', { latitude, longitude });
            
            const aqiResponse = await axios.get(
                `https://api.iqair.com/v2/nearest_city?lat=${latitude}&lon=${longitude}&key=${IQAIR_KEY}`,
                {
                    timeout: 10000, // Timeout 10 giây
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            );

            console.log('IQAir API Response:', aqiResponse.data);

            if (aqiResponse.data.status === 'success' && aqiResponse.data.data) {
                const pollution = aqiResponse.data.data.current.pollution;
                const aqiUS = pollution.aqius;
                const cityName = aqiResponse.data.data.city;
                const country = aqiResponse.data.data.country;
                
                console.log('AQI Data:', { aqiUS, cityName, country });
                
                setAqiData({
                    ...getAqiInfo(aqiUS),
                    city: cityName,
                    country: country,
                    timestamp: pollution.ts
                });
            } else {
                console.warn('IQAir API không trả về dữ liệu hợp lệ:', aqiResponse.data);
                // Fallback: Sử dụng OpenWeatherMap Air Pollution API
                await getAQIFallback(latitude, longitude);
            }
        } catch (aqiError) {
            console.error('Lỗi IQAir API:', aqiError);
            // Fallback: Sử dụng OpenWeatherMap Air Pollution API
            await getAQIFallback(latitude, longitude);
        }

        setLoadingWeather(false);
        } catch (e) {
        console.error('Lỗi API Môi trường:', e);
        setLocationError('Không thể lấy dữ liệu thời tiết.');
        setLoadingWeather(false);
        }
    },
    (err) => {
        console.error('Lỗi GPS:', err);
        let errorMessage = 'Vui lòng cho phép truy cập vị trí.';
        
        switch(err.code) {
            case err.PERMISSION_DENIED:
                errorMessage = 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật GPS và cho phép truy cập.';
                break;
            case err.POSITION_UNAVAILABLE:
                errorMessage = 'Không thể xác định vị trí của bạn.';
                break;
            case err.TIMEOUT:
                errorMessage = 'Quá thời gian chờ định vị.';
                break;
        }
        
        setLocationError(errorMessage);
        setLoadingWeather(false);
    },
    {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // Cache vị trí trong 5 phút
    }
    );
  };

  // Hàm fallback sử dụng OpenWeatherMap Air Pollution API
  const getAQIFallback = async (latitude, longitude) => {
    try {
        console.log('Sử dụng OpenWeatherMap Air Pollution API làm fallback');
        
        const pollutionRes = await axios.get(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${WEATHER_KEY}`
        );

        if (pollutionRes.data && pollutionRes.data.list && pollutionRes.data.list[0]) {
            const aqi = pollutionRes.data.list[0].main.aqi;
            // Chuyển đổi từ scale 1-5 của OpenWeatherMap sang US AQI
            const aqiUS = convertToUSAQI(aqi, pollutionRes.data.list[0].components);
            
            console.log('Fallback AQI Data:', { aqi, aqiUS });
            
            setAqiData({
                ...getAqiInfo(aqiUS),
                source: 'OpenWeatherMap',
                timestamp: new Date().toISOString()
            });
        }
    } catch (fallbackError) {
        console.error('Lỗi Fallback AQI API:', fallbackError);
        setAqiData({
            value: 'N/A',
            level: 'Không có dữ liệu',
            color: '#6b7280',
            desc: 'Không thể lấy dữ liệu chất lượng không khí.',
            range: 'N/A',
            explanation: 'Vui lòng thử lại sau.'
        });
    }
  };

  // Chuyển đổi từ OpenWeatherMap AQI (1-5) sang US AQI (0-500)
  const convertToUSAQI = (owmAqi, components) => {
    // Sử dụng PM2.5 làm chỉ số chính để chuyển đổi
    const pm25 = components.pm2_5;
    
    if (pm25 <= 12) return Math.round((50 / 12) * pm25);
    if (pm25 <= 35.4) return Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
    if (pm25 <= 55.4) return Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
    if (pm25 <= 150.4) return Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
    if (pm25 <= 250.4) return Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
    return Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301);
  };


  const getAqiInfo = (aqi) => {


      if (aqi <= 50) return { 
        value: aqi, 
        level: 'Tốt', 
        color: '#10b981', 
        desc: 'Không khí trong lành.',
        range: '0-50',
        explanation: 'Chất lượng không khí được coi là đạt tiêu chuẩn và ô nhiễm không khí gây ra ít hoặc không có nguy cơ.'
      };
      if (aqi <= 100) return { 
        value: aqi, 
        level: 'Trung bình', 
        color: '#eab308', 
        desc: 'Chấp nhận được.',
        range: '51-100',
        explanation: 'Chất lượng không khí có thể chấp nhận được đối với hầu hết mọi người, nhóm nhạy cảm có thể gặp vấn đề sức khỏe nhẹ.'
      };
      if (aqi <= 150) return { 
        value: aqi, 
        level: 'Kém', 
        color: '#f97316', 
        desc: 'Nhóm nhạy cảm hạn chế ra ngoài.',
        range: '101-150',
        explanation: 'Nhóm nhạy cảm có thể gặp vấn đề sức khỏe. Công chúng nói chung ít có khả năng bị ảnh hưởng.'
      };
      if (aqi <= 200) return { 
        value: aqi, 
        level: 'Xấu', 
        color: '#ef4444', 
        desc: 'Có hại sức khỏe.',
        range: '151-200',
        explanation: 'Mọi người có thể bắt đầu gặp vấn đề sức khỏe; nhóm nhạy cảm có thể gặp vấn đề sức khỏe nghiêm trọng hơn.'
      };
      return { 
        value: aqi, 
        level: 'Nguy hại', 
        color: '#881337', 
        desc: 'Cảnh báo khẩn cấp!',
        range: '201+',
        explanation: 'Cảnh báo sức khỏe khẩn cấp. Toàn bộ dân số có nhiều khả năng bị ảnh hưởng.'
      };
  };


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* 1. HERO SECTION: THỜI TIẾT & AQI */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-xl mb-12 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
         
         {/* Background Effects */}
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-400 opacity-20 blur-3xl"></div>

         <div className="md:w-1/2 text-center md:text-left z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-emerald-100 text-sm font-semibold mb-4">🌿 Cộng đồng Sống Xanh</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Hành động nhỏ <br/> <span className="text-emerald-200">Ý nghĩa lớn 🌍</span></h1>
            <p className="text-emerald-100 text-lg mb-8">Chia sẻ kiến thức, lan tỏa lối sống bền vững.</p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
                <Link
                to="/forum"
                className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-emerald-400 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
                >
                Tham gia ngay
                </Link>
                <Link
                to="/challenges"
                className="bg-transparent border-2 border-emerald-400 text-emerald-200 px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur-sm hover:bg-emerald-500/20 transition-all duration-300 transform hover:-translate-y-1"
                >
                🎯 Thử thách xanh
                </Link>
            </div>
         </div>

         <div className="md:w-1/2 flex flex-wrap gap-4 justify-center z-10">
             {/* Weather Card */}
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-64 text-center shadow-lg transform hover:scale-105 transition duration-300">
                {loadingWeather ? <div className="animate-pulse text-emerald-100">📡 Đang định vị...</div> : 
                 locationError ? <p className="text-red-200 text-sm">{locationError}</p> : 
                 weather && (
                    <>
                        <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">📍 {weather.city}</h3>
                        <div className="flex items-center justify-center gap-2 my-2">
                            <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt="icon" className="w-16 h-16 drop-shadow-md" />
                            <span className="text-5xl font-bold">{weather.temp}°</span>
                        </div>
                        <p className="text-emerald-100 capitalize font-medium">{weather.desc}</p>
                    </>
                )}
             </div>

             {/* AQI Card */}
             {aqiData && (
                 <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-64 text-center shadow-lg transform hover:scale-105 transition duration-300">
                    <h3 className="text-lg font-medium text-emerald-100 mb-3">💨 Chất lượng không khí</h3>
                    
                    {/* Hiển thị thành phố từ IQAir nếu có */}
                    {aqiData.city && (
                        <div className="text-xs text-emerald-200 mb-2 opacity-80">
                            📍 {aqiData.city}{aqiData.country && `, ${aqiData.country}`}
                        </div>
                    )}
                    
                    <div className="inline-block px-4 py-1 rounded-xl bg-white text-gray-800 font-bold text-4xl mb-2 shadow-inner" style={{color: aqiData.color}}>
                        {aqiData.value}
                    </div>
                    <div className="font-bold text-xl mb-1">{aqiData.level}</div>

                    <p className="text-xs text-emerald-100 opacity-80 line-clamp-2">{aqiData.desc}</p>

                    <div className="text-xs text-emerald-100 opacity-80 mb-2">Chỉ số: {aqiData.range}</div>
                    <p className="text-xs text-emerald-100 opacity-80 line-clamp-3 leading-relaxed">{aqiData.explanation}</p>

                    {/* Hiển thị nguồn dữ liệu */}
                    {aqiData.source && (
                        <div className="text-xs text-emerald-200 mt-2 opacity-60">
                            Nguồn: {aqiData.source}
                        </div>
                    )}
                    
                    {/* Hiển thị thời gian cập nhật */}
                    {aqiData.timestamp && (
                        <div className="text-xs text-emerald-200 mt-1 opacity-60">
                            Cập nhật: {new Date(aqiData.timestamp).toLocaleTimeString('vi-VN')}
                        </div>
                    )}
                 </div>
             )}
         </div>
      </div>

{/* 2. PINNED ARTICLES (Kiến Thức Nổi Bật) */}
      {pinnedArticles.length > 0 && (
          <div className="mb-16 bg-blue-50 rounded-3xl p-8 border border-blue-100 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 justify-center"><span className="text-blue-500">⭐</span> Kiến Thức Nổi Bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pinnedArticles.map(post => (
                    <Link to={`/post/${post._id}`} key={post._id} className="group h-full block">
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 h-full border border-gray-100 overflow-hidden flex flex-col">
                            <div className="h-48 overflow-hidden relative bg-gray-200">
                                {post.image ? <img src={post.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="flex items-center justify-center h-full text-4xl text-gray-400">📚</div>}
                                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-blue-700 shadow-sm">{post.category}</span>
                            </div>
                            <div className="p-5 flex-grow">
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 mb-2 line-clamp-2 transition-colors">{post.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">{post.content}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
          </div>
      )}

      {/* 2.5. CHALLENGES SECTION */}
      {challenges.length > 0 && (
          <div className="mb-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-purple-500">🎯</span> Thử Thách Xanh
              </h2>
              <Link to="/challenges" className="text-purple-600 text-sm font-bold hover:underline">
                Xem tất cả &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {challenges.map(challenge => (
                    <div key={challenge._id} className="group h-full">
                        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 h-full border border-gray-100 overflow-hidden flex flex-col">
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        challenge.category === 'daily' ? 'bg-blue-100 text-blue-800' :
                                        challenge.category === 'weekly' ? 'bg-green-100 text-green-800' :
                                        challenge.category === 'monthly' ? 'bg-purple-100 text-purple-800' :
                                        challenge.category === 'special' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {challenge.category === 'daily' ? 'Hàng ngày' :
                                         challenge.category === 'weekly' ? 'Hàng tuần' :
                                         challenge.category === 'monthly' ? 'Hàng tháng' :
                                         challenge.category === 'special' ? 'Đặc biệt' : 'Cộng đồng'}
                                    </span>
                                    <span className="text-emerald-600 font-bold text-sm">
                                        🏆 {challenge.pointsReward} điểm
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 mb-2 line-clamp-2 transition-colors">
                                    {challenge.title}
                                </h3>
                                
                                <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4">
                                    {challenge.description}
                                </p>
                                
                                <div className="flex justify-between items-center text-xs text-gray-400 mb-4">
                                    <span className="flex items-center gap-1">
                                        👥 {challenge.stats?.totalParticipants || 0} người tham gia
                                    </span>
                                    <span>
                                        📅 {new Date(challenge.endDate).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>
                                
                                <Link 
                                    to="/challenges"
                                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg text-center block"
                                >
                                    Tham gia ngay
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="text-center mt-8">
                <Link 
                    to="/challenges" 
                    className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-full font-bold hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg border border-purple-200"
                >
                    <span>🎯</span>
                    Khám phá thêm thử thách
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          
          {/* 3. TIN TỨC MỚI */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6 border-b-2 border-emerald-100 pb-2">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><span className="text-emerald-500">📰</span> Tin Tức Mới Nhất</h2>
                <Link to="/news" className="text-emerald-600 text-sm font-bold hover:underline">Xem tất cả &rarr;</Link>
            </div>
            <div className="space-y-5">
                {news.length === 0 ? <p className="text-gray-500 italic py-10 text-center bg-gray-50 rounded-xl border border-gray-100">Chưa có tin tức nào.</p> : news.map(item => (
                    <Link to={`/post/${item._id}`} key={item._id} className="block group">
                        <div className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 transition flex gap-5 items-start">
                            <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                                {item.image ? <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">📰</div>}
                            </div>
                            <div className="flex-1 py-1">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 mb-2">{item.category}</span>
                                <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition leading-snug mb-2 line-clamp-2">{item.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                    <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                                    <span>👁️ {item.views}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
          </div>

          {/* 4. TOP DIỄN ĐÀN (SIDEBAR) */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-orange-100 pb-2 flex items-center gap-2"><span className="text-orange-500">🔥</span> Sôi Động Nhất</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="space-y-6">
                    {topPosts.length === 0 ? <p className="text-gray-500 italic text-center py-5">Chưa có bài viết nổi bật.</p> : topPosts.map((post, index) => (
                        <Link to={`/post/${post._id}`} key={post._id} className="flex gap-4 items-start group">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' : index === 1 ? 'bg-gray-200 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'}`}>
                                {index + 1}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition line-clamp-2 leading-snug mb-1">{post.title}</h4>
                                <div className="text-xs text-gray-400 flex items-center gap-2 font-medium">
                                    <span className="flex items-center gap-1 text-gray-500">👁️ {post.views}</span>
                                    <span>•</span>
                                    <span>{post.author?.fullName}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                    <Link to="/forum" className="text-sm font-bold text-emerald-600 hover:underline">Vào diễn đàn thảo luận &rarr;</Link>
                </div>
            </div>
          </div>

      </div>
    </div>
  );
};

export default Home;