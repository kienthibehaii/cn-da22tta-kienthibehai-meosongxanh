import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Articles = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]); // State danh mục
  const [filter, setFilter] = useState(''); // Filter đang chọn
  const token = localStorage.getItem('token');

  // Load danh mục & Bài viết
  useEffect(() => {
    // Lấy danh mục
    axios.get('http://localhost:5000/api/categories').then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    // Lấy bài viết (Có filter)
    let url = 'http://localhost:5000/api/posts?type=article&status=approved';
    if(filter) url += `&category=${filter}`; // Filter theo ID danh mục
    
    axios.get(url).then(res => setPosts(res.data));
  }, [filter]);

  return (
    <div style={{maxWidth: '800px', margin: '20px auto', padding: '0 20px'}}>
      
      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h1 style={{color: '#0ea5e9', margin: 0}}>📚 Kiến Thức Môi Trường</h1>
        {token && <Link to="/create-post?type=article" style={{background: '#0ea5e9', color: 'white', padding: '10px 15px', borderRadius: '8px', textDecoration:'none'}}>✍️ Viết Bài</Link>}
      </div>

      {/* THANH LỌC DANH MỤC */}
      <div style={{display:'flex', gap:'10px', overflowX:'auto', marginBottom:'20px', paddingBottom:'10px'}}>
          <button onClick={()=>setFilter('')} style={{padding:'5px 15px', borderRadius:'20px', border:'1px solid #ddd', background: filter===''?'#0ea5e9':'white', color: filter===''?'white':'#333', cursor:'pointer'}}>Tất cả</button>
          {categories.map(c => (
              <button key={c._id} onClick={()=>setFilter(c._id)} style={{padding:'5px 15px', borderRadius:'20px', border:'1px solid #ddd', background: filter===c._id?'#0ea5e9':'white', color: filter===c._id?'white':'#333', cursor:'pointer', whiteSpace:'nowrap'}}>
                  {c.name}
              </button>
          ))}
      </div>

      {/* Danh sách bài viết */}
      <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
        {posts.length === 0 ? <p>Chưa có bài viết nào.</p> : 
        posts.map(post => (
            <div key={post._id} style={{background: 'white', padding:'20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display:'flex', gap:'20px'}}>
                {post.image && <img src={post.image} style={{width:'150px', height:'100px', objectFit:'cover', borderRadius:'8px'}} />}
                <div>
                    <Link to={`/post/${post._id}`} style={{textDecoration:'none', color:'#333'}}>
                        <h3 style={{margin:'0 0 10px 0'}}>{post.title}</h3>
                    </Link>
                    <div style={{marginTop:'10px', fontSize:'0.85rem', color:'#999'}}>
                        👁️ {post.views} • ❤️ {post.likes.length} • 📅 {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
export default Articles;