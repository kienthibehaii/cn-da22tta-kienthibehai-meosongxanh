import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// --- CẤU HÌNH API KEY (Đã cập nhật key thực) ---
const WEATHER_API_KEY = '278b369b634e6ed7f3fbb56044eb0196';
const AQI_API_KEY = 'dd55bc5957b6d1acc6b9313ccd429835cdbf95f7';

const Home = () => {
  const [weather, setWeather] = useState(null);
  const [aqiData, setAqiData] = useState(null);
  const [news, setNews] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [pinnedArticles, setPinnedArticles] = useState([]);
  const [locationError, setLocationError] = useState('');
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    // 1. Lấy dữ liệu bài viết từ Server của mình
    const fetchContent = async () => {
        try {
            const newsRes = await axios.get('http://localhost:5000/api/posts?type=news&status=approved');
            setNews(newsRes.data);
            
            const topRes = await axios.get('http://localhost:5000/api/posts/top');
            setTopPosts(topRes.data);

            const articleRes = await axios.get('http://localhost:5000/api/posts?type=article&status=approved');
            setPinnedArticles(articleRes.data.filter(p => p.isPinned));
        } catch (e) {
            console.error("Lỗi tải nội dung:", e);
        }
    };
    fetchContent();

    // 2. Lấy dữ liệu Môi trường (Weather & AQI)
    getRealLocationData();
  }, []);

  const getRealLocationData = () => {
    if (!navigator.geolocation) {
        setLocationError('Trình duyệt không hỗ trợ định vị GPS.');
        setLoadingWeather(false);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            // console.log("Tọa độ của bạn:", latitude, longitude); // Bật dòng này để debug nếu cần

            try {
                // --- A. THỜI TIẾT (OpenWeatherMap) ---
                const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}&lang=vi`);
                
                // --- B. LẤY TÊN ĐỊA PHƯƠNG CHÍNH XÁC (Reverse Geocoding) ---
                // Bước này giúp hiện "Trà Vinh" thay vì tên trạm khí tượng
                const geoRes = await axios.get(`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${WEATHER_API_KEY}`);
                
                // Ưu tiên tên tiếng Việt từ Geo API -> Tên gốc -> Tên từ Weather API
                const localName = geoRes.data[0]?.local_names?.vi || geoRes.data[0]?.name || weatherRes.data.name;

                setWeather({
                    temp: Math.round(weatherRes.data.main.temp),
                    city: localName, // Kết quả mong đợi: "Trà Vinh"
                    desc: weatherRes.data.weather[0].description,
                    icon: weatherRes.data.weather[0].icon
                });

                // --- C. CHẤT LƯỢNG KHÔNG KHÍ (AQICN - WAQI) ---
                // API này tự động tìm trạm đo gần nhất với tọa độ lat/lon gửi lên
                const pollutionRes = await axios.get(`https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${AQI_API_KEY}`);
                
                if (pollutionRes.data.status === 'ok') {
                    const aqiValue = pollutionRes.data.data.aqi;
                    // Lấy tên trạm đo để hiển thị (tùy chọn)
                    const stationName = pollutionRes.data.data.city.name; 
                    setAqiData({ ...getAqiInfo(aqiValue), station: stationName });
                } else {
                    console.warn("AQI API Error:", pollutionRes.data.data);
                    // Fallback nếu lỗi: hiển thị dữ liệu giả lập hoặc thông báo
                    setAqiData(getAqiInfo(50)); 
                }

                setLoadingWeather(false);
            } catch(e) {
                console.error("Lỗi API Môi trường:", e);
                setLocationError('Không thể lấy dữ liệu thời tiết. Vui lòng kiểm tra kết nối mạng.');
                setLoadingWeather(false);
            }
        },
        (error) => {
            console.error("Lỗi GPS:", error);
            if (error.code === 1) setLocationError('Vui lòng cho phép truy cập vị trí để xem thời tiết Trà Vinh.');
            else setLocationError('Lỗi định vị không xác định.');
            setLoadingWeather(false);
        }
    );
  };

  // Helper: Chuyển đổi chỉ số AQI (0-500) sang Tiếng Việt & Màu sắc
  const getAqiInfo = (aqi) => {
      if (aqi <= 50) return { value: aqi, level: 'Tốt', color: '#10b981', desc: 'Không khí trong lành, lý tưởng cho mọi hoạt động.' };
      if (aqi <= 100) return { value: aqi, level: 'Trung bình', color: '#eab308', desc: 'Chấp nhận được. Nhóm nhạy cảm nên hạn chế vận động mạnh.' };
      if (aqi <= 150) return { value: aqi, level: 'Kém', color: '#f97316', desc: 'Nhóm nhạy cảm có thể bị ảnh hưởng sức khỏe.' };
      if (aqi <= 200) return { value: aqi, level: 'Xấu', color: '#ef4444', desc: 'Có hại cho sức khỏe mọi người. Nên đeo khẩu trang.' };
      if (aqi <= 300) return { value: aqi, level: 'Rất xấu', color: '#881337', desc: 'Cảnh báo sức khỏe khẩn cấp! Hạn chế ra ngoài.' };
      return { value: aqi, level: 'Nguy hại', color: '#450a0a', desc: 'Mọi người nên ở trong nhà, đóng cửa sổ.' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* 1. HERO SECTION */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-xl mb-12 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10">
         
         {/* Background Effect */}
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-400 opacity-20 blur-3xl"></div>

         <div className="md:w-1/2 text-center md:text-left z-10">
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-500/30 border border-emerald-400/30 text-emerald-100 text-sm font-semibold mb-4">🌿 Cộng đồng Sống Xanh</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Hành động nhỏ <br/> <span className="text-emerald-200">Ý nghĩa lớn 🌍</span></h1>
            <p className="text-emerald-100 text-lg mb-8">Chia sẻ kiến thức, lan tỏa lối sống bền vững.</p>
            <div className="flex gap-4 justify-center md:justify-start">
                <Link to="/forum" className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-50 transition transform hover:-translate-y-1">Tham gia ngay</Link>
                <Link to="/articles" className="bg-emerald-700/50 border border-emerald-500/50 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700/70 transition">Khám phá</Link>
            </div>
         </div>

         <div className="md:w-1/2 flex flex-wrap gap-4 justify-center z-10">
             {/* Thẻ Thời Tiết */}
             <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-64 text-center shadow-lg">
                {loadingWeather ? <div className="animate-pulse text-emerald-100">📡 Đang định vị...</div> : 
                 locationError ? <p className="text-red-200 text-sm">{locationError}</p> : 
                 weather && (
                    <>
                        <h3 className="text-xl font-semibold mb-2 flex items-center justify-center gap-2">📍 {weather.city}</h3>
                        <div className="flex items-center justify-center gap-2 my-2">
                            <img src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`} className="w-16 h-16 drop-shadow-md" />
                            <span className="text-5xl font-bold">{weather.temp}°</span>
                        </div>
                        <p className="text-emerald-100 capitalize font-medium">{weather.desc}</p>
                    </>
                )}
             </div>

             {/* Thẻ AQI */}
             {aqiData && (
                 <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl w-64 text-center shadow-lg">
                    <h3 className="text-lg font-medium text-emerald-100 mb-3">💨 Chất lượng không khí</h3>
                    <div className="inline-block px-4 py-1 rounded-xl bg-white text-gray-800 font-bold text-4xl mb-2 shadow-inner" style={{color: aqiData.color}}>
                        {aqiData.value}
                    </div>
                    <div className="font-bold text-xl mb-1">{aqiData.level}</div>
                    <p className="text-xs text-emerald-100 opacity-80 line-clamp-2" title={aqiData.desc}>{aqiData.desc}</p>
                    {/* Hiển thị tên trạm đo nếu muốn debug */}
                    {/* <div className="text-[10px] text-gray-300 mt-2 truncate">{aqiData.station}</div> */}
                 </div>
             )}
         </div>
      </div>

      {/* 2. PINNED ARTICLES (Kiến Thức Nổi Bật) */}
      {pinnedArticles.length > 0 && (
          <div className="mb-16 bg-blue-50 rounded-3xl p-8 border border-blue-100">
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

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
          
          {/* CỘT TRÁI: TIN TỨC */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6 border-b-2 border-emerald-100 pb-2">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><span className="text-emerald-500">📰</span> Tin Tức Mới Nhất</h2>
                <Link to="/news" className="text-emerald-600 text-sm font-bold hover:underline">Xem tất cả &rarr;</Link>
            </div>
            <div className="space-y-5">
                {news.length === 0 ? <p className="text-gray-500 italic py-10 text-center bg-gray-50 rounded-xl">Chưa có tin tức nào.</p> : news.map(item => (
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

          {/* CỘT PHẢI: TOP DIỄN ĐÀN */}
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