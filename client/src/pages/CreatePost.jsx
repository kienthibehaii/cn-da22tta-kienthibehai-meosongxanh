import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CreatePost = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('user_info') ? JSON.parse(localStorage.getItem('user_info')) : null;

  // Lấy loại bài từ URL (mặc định là forum)
  const queryType = searchParams.get('type') || 'forum';

  const [categories, setCategories] = useState([]); 
  const [topics, setTopics] = useState([]);         
  
  // FORM STATE
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedId, setSelectedId] = useState(''); // ID danh mục hoặc Tên Topic
  const [selectedName, setSelectedName] = useState(''); // Tên hiển thị (để lưu vào category)
  const [imageFile, setImageFile] = useState(null);

  // 1. Load danh sách chọn
  useEffect(() => {
      const fetchData = async () => {
          try {
              if (queryType !== 'forum') {
                  // Lấy Category cho News/Articles
                  const res = await axios.get('http://localhost:5000/api/categories');
                  setCategories(res.data);
                  if (res.data.length > 0) {
                      setSelectedId(res.data[0]._id);
                      setSelectedName(res.data[0].name);
                  }
              } else {
                  // Lấy Topic cho Forum
                  const res = await axios.get('http://localhost:5000/api/admin/topics', { headers: { Authorization: token } });
                  setTopics(res.data);
                  if (res.data.length > 0) {
                      setSelectedId(res.data[0].name);
                      setSelectedName(res.data[0].name);
                  }
              }
          } catch (err) {
              // Fallback nếu lỗi
              if (queryType === 'forum') {
                  setTopics([{ name: 'Thảo luận chung' }]);
                  setSelectedId('Thảo luận chung');
                  setSelectedName('Thảo luận chung');
              }
          }
      };
      fetchData();
  }, [queryType, token]);

const handleSubmit = async (e) => {
  e.preventDefault();

  // --- DEBUG: In ra dữ liệu chuẩn bị gửi ---
  console.log("Đang gửi bài:", { title, type: queryType, selectedId });

  const formData = new FormData();
  formData.append('title', title);
  formData.append('content', content);
  formData.append('type', queryType);
  formData.append('selectedId', selectedId);

  // Gửi thêm category dạng text để hiển thị
  formData.append('category', selectedName || 'Chung');

  if (imageFile) formData.append('image', imageFile);

  try {
    await axios.post('http://localhost:5000/api/posts', formData, {
      headers: { 
        Authorization: token, 
        'Content-Type': 'multipart/form-data' 
      }
    });

    // Xử lý thông báo thành công tùy theo loại bài viết
    let message;
    if (queryType === 'forum') {
      message = "Bài đã được đăng thành công!";
    } else {
      message = "Bài viết đã được gửi đến quản trị viên để duyệt.";
    }
    alert(message);

    // Điều hướng về trang tương ứng
    if (queryType === 'news') {
      navigate('/news');
    } else if (queryType === 'article') {
      navigate('/articles');
    } else {
      navigate('/forum');
    }

  } catch (err) {
    console.error(err);
    alert('Lỗi đăng bài: ' + (err.response?.data?.message || err.message));
  }
};

  const handleSelectChange = (e) => {
      setSelectedId(e.target.value);
      // Tìm tên tương ứng để lưu
      const index = e.target.selectedIndex;
      setSelectedName(e.target.options[index].text);
  };

  return (
    <div className="create-post-page" style={{maxWidth: '700px', margin: '40px auto', background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'}}>
        <h2 style={{color: '#10b981', textAlign: 'center', marginBottom: '30px'}}>
            {queryType === 'forum' ? '💬 Đăng bài Diễn đàn' : '📝 Viết bài mới'}
        </h2>
        
        <form onSubmit={handleSubmit}>
            <label style={{display:'block', fontWeight:'bold', marginBottom:'5px'}}>Tiêu đề:</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required style={{width:'100%', padding:'10px', marginBottom:'20px', border:'1px solid #ddd', borderRadius:'5px'}} />
            
            <label style={{display:'block', fontWeight:'bold', marginBottom:'5px'}}>Ảnh minh họa:</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{marginBottom:'20px'}} />
            
            <label style={{display:'block', fontWeight:'bold', marginBottom:'5px'}}>
                {queryType === 'forum' ? 'Chủ đề:' : 'Danh mục:'}
            </label>
            <select 
                value={selectedId} 
                onChange={handleSelectChange} 
                style={{width:'100%', padding:'10px', marginBottom:'20px', border:'1px solid #ddd', borderRadius:'5px'}}
            >
                {queryType === 'forum' 
                    ? topics.map((t, i) => <option key={i} value={t.name}>{t.name}</option>)
                    : categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)
                }
            </select>
            
            <label style={{display:'block', fontWeight:'bold', marginBottom:'5px'}}>Nội dung:</label>
            <textarea rows="10" value={content} onChange={e => setContent(e.target.value)} required style={{width:'100%', padding:'10px', border:'1px solid #ddd', borderRadius:'5px'}}></textarea>
            
            <button type="submit" style={{width:'100%', marginTop:'30px', padding:'15px', background:'#10b981', color:'white', border:'none', borderRadius:'8px', fontSize:'1.1rem', fontWeight:'bold', cursor:'pointer'}}>
                Đăng bài
            </button>
        </form>
    </div>
  );
};
export default CreatePost;