import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../apiConfig';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); 
  const [topics, setTopics] = useState([]);
  const [topicCounts, setTopicCounts] = useState({}); // Đếm số bài viết theo topic
  
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('user_info') ? JSON.parse(localStorage.getItem('user_info')) : null;

  useEffect(() => {
      // Lấy danh sách Topic với API URL động
      axios.get(`${API_URL}/admin/topics`, { headers: { Authorization: token } })
           .then(res => {
             setTopics(res.data);
             // Lấy số lượng bài viết cho mỗi topic
             fetchTopicCounts(res.data);
           })
           .catch(() => setTopics([
             { name: 'Thảo luận chung' },
             { name: 'Môi trường' },
             { name: 'Tái chế' },
             { name: 'Tiết kiệm năng lượng' }
           ]));
  }, []);

  const fetchTopicCounts = async (topicList) => {
    const counts = {};
    
    try {
      // Đếm tổng số bài viết
      const totalRes = await axios.get(`${API_URL}/posts?type=forum&status=approved`);
      counts[''] = totalRes.data.length;

      // Đếm cho từng topic
      for (const topic of topicList) {
        try {
          const res = await axios.get(`${API_URL}/posts?type=forum&status=approved&topic=${topic.name}`);
          counts[topic.name] = res.data.length;
        } catch (err) {
          counts[topic.name] = 0;
        }
      }
      setTopicCounts(counts);
    } catch (err) {
      console.error('Error fetching topic counts:', err);
    }
  };

  useEffect(() => { fetchPosts(); }, [filter]);

  const fetchPosts = async () => {
    try {
      let url = `${API_URL}/posts?type=forum&status=approved`;
      if (filter) url += `&topic=${filter}`;
      const res = await axios.get(url);
      setPosts(res.data);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  const handleLike = async (e, id) => {
    e.preventDefault();
    if (!token) return alert("Bạn cần đăng nhập!");
    try {
      await axios.put(`${API_URL}/posts/${id}/like`, {}, { headers: { Authorization: token } });
      setPosts(posts.map(p => {
        if (p._id === id) {
          const likes = p.likes || [];
          const isLiked = likes.includes(currentUser?.id);
          return { ...p, likes: isLiked ? likes.filter(uid => uid !== currentUser.id) : [...likes, currentUser.id] };
        }
        return p;
      }));
    } catch (err) { alert("Lỗi kết nối!"); }
  };

  const handleSave = async (e, id) => {
    e.preventDefault();
    if (!token) return alert("Bạn cần đăng nhập!");
    try {
        await axios.put(`${API_URL}/posts/${id}/save`, {}, { headers: { Authorization: token } });
        alert("✅ Đã lưu bài viết!");
    } catch (err) { alert("Lỗi kết nối!"); }
  };

  const handleReport = async (e, id) => {
    e.preventDefault();
    if (!token) return alert("Bạn cần đăng nhập!");
    if(confirm("Báo cáo vi phạm?")) {
        try {
            await axios.post(`${API_URL}/posts/${id}/report`, {}, { headers: { Authorization: token } });
            alert("✅ Đã gửi báo cáo!");
        } catch (err) { alert("Lỗi kết nối!"); }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">💬 Diễn Đàn Sống Xanh</h1>
            <p className="text-gray-500 mt-1">Cùng thảo luận, chia sẻ kinh nghiệm bảo vệ môi trường</p>
        </div>
        <Link to="/create-post" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-emerald-200 transition flex items-center gap-2 transform hover:-translate-y-0.5">
            <span>➕</span> Viết bài mới
        </Link>
      </div>

      {/* Topics Filter - Thanh ngang di chuyển */}
      <div className="mb-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-3 topic-scroll scroll-smooth">
          <button 
            onClick={() => setFilter('')} 
            className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              filter === '' 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200 ring-2 ring-emerald-300 ring-opacity-50' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
            }`}
          >
            <span className="flex items-center gap-2">
              Tất cả
              {topicCounts[''] && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  filter === '' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {topicCounts['']}
                </span>
              )}
            </span>
          </button>
          
          {topics.map((topic, index) => (
            <button 
              key={index} 
              onClick={() => setFilter(topic.name)} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                filter === topic.name 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200 ring-2 ring-emerald-300 ring-opacity-50' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              <span className="flex items-center gap-2">
                {topic.name}
                {topicCounts[topic.name] !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    filter === topic.name ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {topicCounts[topic.name]}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
        
        {/* Indicator line với animation */}
        <div className="relative">
          <div className="h-0.5 bg-gray-200 rounded-full"></div>
          <div className="absolute top-0 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500 ease-out" 
               style={{width: filter ? '60px' : '80px', left: filter ? '100px' : '0px'}}></div>
        </div>
        
        {/* Filter info */}
        {filter && (
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600">
            <span className="bg-emerald-50 px-3 py-1 rounded-full font-medium">
              Đang lọc: {filter}
            </span>
            <button 
              onClick={() => setFilter('')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Xóa bộ lọc"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Post List */}
      {loading ? <div className="text-center py-20 text-gray-400">Đang tải dữ liệu...</div> : (
        <div className="space-y-6">
            {posts.length === 0 ? <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 text-gray-500">Chưa có bài viết nào.</div> : null}
            
            {posts.map(post => {
                const safeLikes = post.likes || [];
                const isLiked = currentUser && safeLikes.includes(currentUser.id);
                
                return (
                    <div key={post._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex gap-6">
                        <div className="flex flex-col items-center gap-1 min-w-[50px]">
                            <button onClick={(e) => handleLike(e, post._id)} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-red-50 flex items-center justify-center transition group">
                                <span className={`text-xl ${isLiked ? '' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'}`}>❤️</span>
                            </button>
                            <span className="font-bold text-gray-700 text-sm">{safeLikes.length}</span>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-bold">{post.category || post.forumTopic}</span>
                                <span>•</span>
                                <span className="font-medium text-gray-700">{post.author?.fullName}</span>
                                <span>•</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>

                            <Link to={`/post/${post._id}`} className="block group">
                                <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-emerald-600 transition">{post.title}</h2>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 whitespace-pre-line">{post.content}</p>
                                {post.image && <img src={post.image} className="w-full h-64 object-cover rounded-xl mb-4 border border-gray-100" />}
                            </Link>

                            <div className="flex items-center gap-6 pt-4 border-t border-gray-100 text-sm text-gray-500 font-medium">
                                <Link to={`/post/${post._id}`} className="flex items-center gap-2 hover:text-emerald-600 transition"><span>💬</span> {post.commentsCount || 0} Bình luận</Link>
                                <div className="flex items-center gap-2"><span>👁️</span> {post.views}</div>
                                <button onClick={(e) => handleSave(e, post._id)} className="ml-auto hover:text-blue-600 transition flex items-center gap-1"><span>💾</span> Lưu</button>
                                <button onClick={(e) => handleReport(e, post._id)} className="hover:text-red-500 transition flex items-center gap-1"><span>🚩</span> Báo cáo</button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};

export default Forum;