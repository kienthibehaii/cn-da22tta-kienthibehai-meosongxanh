import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(''); // Lọc theo Topic
  const [topics, setTopics] = useState([]); // Danh sách chủ đề lấy từ API
  
  const token = localStorage.getItem('token');
  // Lấy user an toàn
  const currentUser = localStorage.getItem('user_info') 
    ? JSON.parse(localStorage.getItem('user_info')) 
    : null;

  // 1. Lấy danh sách Chủ đề (Topics) để hiển thị bộ lọc
  useEffect(() => {
      axios.get('http://localhost:5000/api/admin/topics', { headers: { Authorization: token } })
           .then(res => setTopics(res.data))
           .catch(() => {
               // Fallback nếu chưa có API topics hoặc lỗi: Dùng danh sách cứng
               setTopics([{ name: 'Thảo luận chung' }, { name: 'Mẹo sống xanh' }, { name: 'Hỏi đáp' }]);
           });
  }, []);

  // 2. Lấy bài viết khi bộ lọc thay đổi
  useEffect(() => {
    fetchPosts();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      // SỬA: Gửi param 'topic' thay vì 'category'
      let url = 'http://localhost:5000/api/posts?type=forum&status=approved';
      if (filter) url += `&topic=${filter}`;
      
      const res = await axios.get(url);
      setPosts(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // --- CÁC HÀM TƯƠNG TÁC (Đã sửa lỗi kết nối) ---
  const handleLike = async (e, id) => {
    e.preventDefault(); // Chặn việc bấm nút like mà bị nhảy trang
    if (!token) return alert("Bạn cần đăng nhập để thích bài viết!");
    
    try {
      await axios.put(`http://localhost:5000/api/posts/${id}/like`, {}, { headers: { Authorization: token } });
      
      // Cập nhật giao diện ngay lập tức
      setPosts(posts.map(p => {
        if (p._id === id) {
          const safeLikes = p.likes || [];
          const isLiked = safeLikes.includes(currentUser?.id);
          return {
            ...p,
            likes: isLiked 
              ? safeLikes.filter(uid => uid !== currentUser.id) 
              : [...safeLikes, currentUser.id]
          };
        }
        return p;
      }));
    } catch (err) { 
        alert("Lỗi kết nối! Hãy thử đăng xuất và đăng nhập lại."); 
    }
  };

  const handleSave = async (e, id) => {
    e.preventDefault();
    if (!token) return alert("Bạn cần đăng nhập!");
    try {
        await axios.put(`http://localhost:5000/api/posts/${id}/save`, {}, { headers: { Authorization: token } });
        alert("✅ Đã lưu bài viết!");
    } catch (err) { alert("Lỗi kết nối server"); }
  };

  const handleReport = async (e, id) => {
    e.preventDefault();
    if (!token) return alert("Bạn cần đăng nhập!");
    if(confirm("Báo cáo bài viết này vi phạm?")) {
        try {
            await axios.post(`http://localhost:5000/api/posts/${id}/report`, {}, { headers: { Authorization: token } });
            alert("✅ Đã gửi báo cáo!");
        } catch (err) { alert("Lỗi kết nối"); }
    }
  };

  return (
    <div className="forum-page" style={{maxWidth: '1000px', margin: '20px auto', padding: '0 20px'}}>
      
      {/* HEADER */}
      <div className="forum-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px'}}>
        <div>
            <h1 style={{color: '#10b981', margin: 0}}>💬 Diễn Đàn Sống Xanh</h1>
            <p style={{color: '#666', margin: '5px 0 0 0'}}>Cùng thảo luận, chia sẻ kinh nghiệm bảo vệ môi trường</p>
        </div>
        <Link to="/create-post" className="btn-create" style={{background: '#3b82f6', color: 'white', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none'}}>
            ➕ Viết bài mới
        </Link>
      </div>

      {/* --- SỬA BỘ LỌC: DÙNG TOPIC THAY VÌ CATEGORY CŨ --- */}
      <div className="filter-bar" style={{marginBottom: '20px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px'}}>
        <button 
            onClick={() => setFilter('')}
            style={{
                padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd',
                background: filter === '' ? '#10b981' : 'white',
                color: filter === '' ? 'white' : '#555',
                cursor: 'pointer', whiteSpace: 'nowrap'
            }}
        >
            Tất cả
        </button>
        
        {/* Render danh sách Topic lấy từ API */}
        {topics.map((t, index) => (
            <button 
                key={index} 
                onClick={() => setFilter(t.name)}
                style={{
                    padding: '8px 16px', borderRadius: '20px', border: '1px solid #ddd',
                    background: filter === t.name ? '#10b981' : 'white',
                    color: filter === t.name ? 'white' : '#555',
                    cursor: 'pointer', whiteSpace: 'nowrap'
                }}
            >
                {t.name}
            </button>
        ))}
      </div>

      {/* DANH SÁCH BÀI VIẾT */}
      {loading ? <p>Đang tải...</p> : (
        <div className="forum-list">
            {posts.length === 0 ? <p style={{textAlign:'center', color:'#888'}}>Chưa có bài viết nào.</p> : null}
            
            {posts.map(post => {
                const safeLikes = post.likes || [];
                const isLiked = currentUser && safeLikes.includes(currentUser?.id);
                
                return (
                    <div key={post._id} className="forum-card" style={{background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', gap: '20px'}}>
                        
                        {/* Cột trái: Vote/Like */}
                        <div className="vote-column" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '50px'}}>
                            <button onClick={(e) => handleLike(e, post._id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem'}}>
                                {isLiked ? '❤️' : '🤍'}
                            </button>
                            <span style={{fontWeight: 'bold', color: '#555'}}>{safeLikes.length}</span>
                        </div>

                        {/* Cột phải: Nội dung */}
                        <div className="content-column" style={{flex: 1}}>
                            <div className="meta" style={{fontSize: '0.85rem', color: '#888', marginBottom: '5px'}}>
                                {/* Hiển thị Tên Topic thay vì Category cũ */}
                                <span className="tag" style={{background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', marginRight: '10px', fontWeight: 'bold'}}>
                                    {post.forumTopic || post.category || 'Thảo luận'}
                                </span>
                                <span>Đăng bởi <b>{post.author?.fullName}</b> • {new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>

                            <Link to={`/post/${post._id}`} style={{textDecoration: 'none', color: '#333'}}>
                                <h2 style={{margin: '5px 0 10px 0', fontSize: '1.4rem'}}>{post.title}</h2>
                            </Link>

                            {/* --- SỬA: HIỂN THỊ TOÀN BỘ NỘI DUNG (KHÔNG CẮT) --- */}
                            <p style={{color: '#555', lineHeight: '1.6', marginBottom: '15px', whiteSpace: 'pre-line'}}>
                                {post.content} 
                            </p>
                            {/* ----------------------------------------------- */}

                            {post.image && (
                                <Link to={`/post/${post._id}`}>
                                    <img src={post.image} alt="Thumbnail" style={{height: '200px', borderRadius: '8px', objectFit: 'cover', marginBottom: '15px'}} />
                                </Link>
                            )}

                            {/* Footer */}
                            <div className="card-footer" style={{display: 'flex', gap: '20px', borderTop: '1px solid #eee', paddingTop: '10px', color: '#666', fontSize: '0.9rem'}}>
                                <Link to={`/post/${post._id}`} style={{display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#666'}}>
                                    💬 {post.commentsCount || 0} Bình luận
                                </Link>
                                <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                    👁️ {post.views} lượt xem
                                </span>
                                <button onClick={(e) => handleSave(e, post._id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', marginLeft: 'auto'}}>
                                    💾 Lưu bài
                                </button>
                                <button onClick={(e) => handleReport(e, post._id)} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444'}}>
                                    🚩 Báo cáo
                                </button>
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