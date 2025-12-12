import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('approved'); // approved, pending, saved, liked
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', bio: '', email: '' });
  const [avatarFile, setAvatarFile] = useState(null);
  
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user_info'));
  const isMyProfile = !id || (currentUser && id === currentUser.id);

  useEffect(() => { fetchProfile(); }, [id]);

  const fetchProfile = async () => {
    const url = id ? `http://localhost:5000/api/users/profile/${id}` : `http://localhost:5000/api/users/profile`;
    try {
      const res = await axios.get(url, { headers: { Authorization: token } });
      setData(res.data);
      setEditForm({ fullName: res.data.user.fullName, bio: res.data.user.bio || '', email: res.data.user.email || '' });
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('fullName', editForm.fullName);
    formData.append('bio', editForm.bio);
    formData.append('email', editForm.email);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: { Authorization: token, 'Content-Type': 'multipart/form-data' }
      });
      alert("Cập nhật thành công!");
      setIsEditing(false);
      fetchProfile();
    } catch (err) { alert("Lỗi cập nhật"); }
  };

  if (!data) return <p style={{padding:'20px'}}>Đang tải hồ sơ...</p>;

  return (
    <div style={{maxWidth: '900px', margin: '20px auto', padding: '0 20px'}}>
      
      {/* HEADER */}
      <div style={{background: 'white', padding: '30px', borderRadius: '12px', display: 'flex', gap: '30px', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
        <div style={{textAlign:'center'}}>
            <img src={data.user.avatar || "https://via.placeholder.com/150"} style={{width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #10b981'}} />
            {isEditing && <input type="file" onChange={e => setAvatarFile(e.target.files[0])} style={{marginTop: '10px', width:'200px'}} />}
        </div>
        
        {isEditing ? (
            <form onSubmit={handleUpdate} style={{flex: 1}}>
                <input value={editForm.fullName} onChange={e=>setEditForm({...editForm, fullName: e.target.value})} placeholder="Tên hiển thị" style={{display: 'block', width: '100%', marginBottom: '10px', padding: '8px'}}/>
                <textarea value={editForm.bio} onChange={e=>setEditForm({...editForm, bio: e.target.value})} placeholder="Giới thiệu bản thân" style={{display: 'block', width: '100%', marginBottom: '10px', padding: '8px'}}/>
                <button type="submit" style={{background:'#10b981', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', marginRight:'10px'}}>Lưu</button>
                <button type="button" onClick={()=>setIsEditing(false)}>Hủy</button>
            </form>
        ) : (
            <div style={{flex: 1}}>
                <h1 style={{margin:'0 0 5px 0'}}>{data.user.fullName}</h1>
                <p style={{color:'#666', fontStyle:'italic'}}>{data.user.bio || "Chưa có giới thiệu."}</p>
                {isMyProfile && <button onClick={() => setIsEditing(true)} style={{marginTop:'10px', padding:'5px 10px', cursor:'pointer'}}>✏️ Chỉnh sửa hồ sơ</button>}
            </div>
        )}
      </div>

      {/* THỐNG KÊ */}
      <div style={{display: 'flex', gap: '15px', margin: '20px 0'}}>
            <div style={{flex:1, background:'white', padding:'20px', borderRadius:'10px', textAlign:'center', boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
                <b style={{fontSize:'1.5rem', color:'#3b82f6'}}>{data.stats.postCount}</b><br/><span style={{color:'#666'}}>Bài viết</span>
            </div>
            <div style={{flex:1, background:'white', padding:'20px', borderRadius:'10px', textAlign:'center', boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
                <b style={{fontSize:'1.5rem', color:'#10b981'}}>{data.stats.views}</b><br/><span style={{color:'#666'}}>Lượt xem</span>
            </div>
            <div style={{flex:1, background:'white', padding:'20px', borderRadius:'10px', textAlign:'center', boxShadow:'0 2px 4px rgba(0,0,0,0.05)'}}>
                <b style={{fontSize:'1.5rem', color:'#ef4444'}}>{data.stats.likesReceived}</b><br/><span style={{color:'#666'}}>Yêu thích</span>
            </div>
      </div>

      {/* TABS */}
      <div style={{marginBottom: '20px', borderBottom: '2px solid #eee', display:'flex', gap:'10px'}}>
        {['approved', 'pending', 'saved', 'liked'].map(t => (
            (isMyProfile || t === 'approved') && (
                <button key={t} onClick={()=>setTab(t)} style={{padding: '10px 20px', background: 'none', border: 'none', borderBottom: tab===t?'3px solid #10b981':'3px solid transparent', fontWeight: tab===t?'bold':'normal', cursor:'pointer', color: tab===t?'#10b981':'#666'}}>
                    {t === 'approved' ? 'Đã đăng' : t === 'pending' ? 'Chờ duyệt' : t === 'saved' ? 'Đã lưu' : 'Đã thích'} ({data.posts[t]?.length || 0})
                </button>
            )
        ))}
      </div>

      {/* LIST */}

      <div className="profile-content">
      {(!data.posts[tab] || data.posts[tab].length === 0) ? (
          <p style={{textAlign:'center', color:'#888', marginTop:'30px'}}>Danh sách trống.</p>
      ) : (
          data.posts[tab].map(p => (
              <div key={p._id} className="mini-post-card" style={{/*style cũ*/}}>
                  {/* SỬA LINK Ở ĐÂY */}
                  <Link 
                      to={`/post/${p._id}`} 
                      state={{ from: '/profile' }} // <--- QUAN TRỌNG
                      style={{textDecoration: 'none', color: '#333'}}
                  >
                      <h3 style={{margin:'0 0 5px 0'}}>{p.title}</h3>
                      {/* ... */}
                  </Link>
                  {/* ... */}
              </div>
          ))
      )}
      </div>
    </div>
  );
};
export default Profile;