import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', content: '', category: '' });
  const [imageFile, setImageFile] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/posts/${id}`).then(res => {
        setFormData({ 
            title: res.data.post.title, 
            content: res.data.post.content, 
            category: res.data.post.category 
        });
    });
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('category', formData.category);
    if(imageFile) data.append('image', imageFile);

    try {
        await axios.put(`http://localhost:5000/api/posts/${id}`, data, {
            headers: { Authorization: token, 'Content-Type': 'multipart/form-data' }
        });
        alert("Đã cập nhật bài viết!");
        navigate(`/post/${id}`);
    } catch(err) { alert("Lỗi cập nhật"); }
  };

  return (
    <div className="create-post-page">
        <h2>✏️ Chỉnh sửa bài viết</h2>
        <form onSubmit={handleUpdate}>
            <label>Tiêu đề:</label>
            <input value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
            
            <label>Nội dung:</label>
            <textarea rows="10" value={formData.content} onChange={e=>setFormData({...formData, content: e.target.value})} />
            
            <label>Ảnh mới (nếu muốn thay):</label>
            <input type="file" onChange={e=>setImageFile(e.target.files[0])} />
            
            <button type="submit">Lưu thay đổi</button>
        </form>
    </div>
  );
};
export default EditPost;