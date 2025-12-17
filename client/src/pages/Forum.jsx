import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); 
  const [topics, setTopics] = useState([]);
  
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('user_info') ? JSON.parse(localStorage.getItem('user_info')) : null;

  useEffect(() => {
      // Lấy danh sách Topic
      axios.get('http://localhost:5000/api/admin/topics', { headers: { Authorization: token } })
           .then(res => setTopics(res.data))
           .catch(() => setTopics([{ name: 'Thảo luận chung' }]));
  }, []);

  useEffect(() => { fetchPosts(); }, [filter]);

  const fetchPosts = async () => {
    try {
      let url = 'http://localhost:5000/api/posts?type=forum&status=approved';
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
      await axios.put(`http://localhost:5000/api/posts/${id}/like`, {}, { headers: { Authorization: token } });
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
        await axios.put(`http://localhost:5000/api/posts/${id}/save`, {}, { headers: { Authorization: token } });
        alert("✅ Đã lưu bài viết!");
    } catch (err) { alert("Lỗi kết nối!"); }
  };

  const handleReport = async (e, id) => {
    e.preventDefault();
    if (!token) return alert("Bạn cần đăng nhập!");
    if(confirm("Báo cáo vi phạm?")) {
        try {
            await axios.post(`http://localhost:5000/api/posts/${id}/report`, {}, { headers: { Authorization: token } });
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

      {/* Topics Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        <button onClick={() => setFilter('')} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${filter === '' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>Tất cả</button>
        {topics.map((t, index) => (
            <button key={index} onClick={() => setFilter(t.name)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${filter === t.name ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{t.name}</button>
        ))}
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