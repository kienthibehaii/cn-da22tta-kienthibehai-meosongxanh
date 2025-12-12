import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const News = () => {
  const [posts, setPosts] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('user_info'));

  useEffect(() => {
    // Lấy bài viết loại NEWS
    axios.get('http://localhost:5000/api/posts?type=news&status=approved')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{maxWidth: '1000px', margin: '20px auto', padding: '0 20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', borderBottom:'2px solid #eee', paddingBottom:'15px'}}>
        <h1 style={{color: '#dc2626', margin: 0}}>📰 Tin Tức & Sự Kiện</h1>
        {/* CHỈ ADMIN MỚI THẤY NÚT ĐĂNG */}
        {currentUser?.role === 'admin' && (
            <Link to="/create-post?type=news" style={{background: '#dc2626', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration:'none', fontWeight:'bold'}}>
                ✍️ Đăng Tin Mới
            </Link>
        )}
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
        {posts.map(post => (
            <div key={post._id} style={{background: 'white', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', overflow:'hidden'}}>
                {post.image && <img src={post.image} style={{width:'100%', height:'200px', objectFit:'cover'}} />}
                <div style={{padding:'20px'}}>
                    <span style={{background:'#fee2e2', color:'#dc2626', padding:'2px 8px', borderRadius:'4px', fontSize:'0.8rem', fontWeight:'bold'}}>{post.category}</span>
                    <Link to={`/post/${post._id}`} style={{textDecoration:'none', color:'#333'}}>
                        <h3 style={{margin:'10px 0', fontSize:'1.2rem'}}>{post.title}</h3>
                    </Link>
                    <div style={{fontSize:'0.9rem', color:'#666', marginTop:'10px'}}>
                        <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span> • <span>👁️ {post.views}</span>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
export default News;