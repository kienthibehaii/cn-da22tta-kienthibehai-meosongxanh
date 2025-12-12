import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const Admin = () => {
  const location = useLocation();
  // Nếu quay lại từ trang chi tiết, giữ nguyên tab cũ, mặc định là dashboard
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'dashboard');
  
  // State Dashboard Filter
  const [dashFilter, setDashFilter] = useState('all'); // all, forum, news, article

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [postsList, setPostsList] = useState([]); 
  const [topics, setTopics] = useState([]);
  const [reportedPosts, setReportedPosts] = useState([]);
  const [categories, setCategories] = useState([]); 
  
  const [newTopicName, setNewTopicName] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user_info'));
  const config = { headers: { Authorization: token } };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'topics') fetchTopics();
    if (activeTab === 'reports') fetchReports();
    if (activeTab === 'categories') fetchCategories();
    
    if (['forum_posts', 'news', 'articles'].includes(activeTab)) {
        const typeMap = { 'forum_posts': 'forum', 'news': 'news', 'articles': 'article' };
        fetchPostsByType(typeMap[activeTab]);
    }
  }, [activeTab]);

  // --- API CALLS ---
  const fetchStats = async () => axios.get('http://localhost:5000/api/admin/stats', config).then(res => setStats(res.data));
  const fetchUsers = async () => axios.get('http://localhost:5000/api/admin/users', config).then(res => setUsers(res.data));
  const fetchTopics = async () => axios.get('http://localhost:5000/api/admin/topics', config).then(res => setTopics(res.data));
  const fetchReports = async () => axios.get('http://localhost:5000/api/admin/reports', config).then(res => setReportedPosts(res.data));
  const fetchCategories = async () => axios.get('http://localhost:5000/api/categories').then(res => setCategories(res.data));
  
  const fetchPostsByType = async (type) => {
      const res = await axios.get(`http://localhost:5000/api/admin/posts-by-type?type=${type}`, config);
      setPostsList(res.data);
  };

  // --- ACTIONS ---
  const handleBanUser = async (id) => { if(!confirm("Đổi trạng thái khóa?")) return; await axios.put(`http://localhost:5000/api/admin/users/${id}/ban`, {}, config); fetchUsers(); };
  const handleChangeRole = async (id, newRole) => { if(!confirm(`Cấp quyền ${newRole}?`)) return; await axios.put(`http://localhost:5000/api/admin/users/${id}/role`, { role: newRole }, config); fetchUsers(); };
  const handleAddTopic = async () => { if(!newTopicName) return; try { await axios.post('http://localhost:5000/api/admin/topics', { name: newTopicName }, config); setNewTopicName(''); fetchTopics(); } catch(e) { alert("Lỗi"); } };
  const handleDeleteTopic = async (id) => { if(confirm("Xóa topic?")) { await axios.delete(`http://localhost:5000/api/admin/topics/${id}`, config); fetchTopics(); } };
  const handleAddCategory = async () => { if(!newCatName) return; try { await axios.post('http://localhost:5000/api/categories', { name: newCatName }, config); setNewCatName(''); fetchCategories(); } catch(e) { alert("Lỗi"); } };
  const handleDeleteCategory = async (id) => { if(confirm("Xóa danh mục?")) { await axios.delete(`http://localhost:5000/api/categories/${id}`, config); fetchCategories(); } };
  const handleSafePost = async (id) => { if(confirm("Gỡ báo cáo?")) { await axios.put(`http://localhost:5000/api/admin/reports/${id}/dismiss`, {}, config); fetchReports(); } };
  const handleDeletePost = async (id, isReportTab = false) => { if(confirm("Xóa bài?")) { await axios.delete(`http://localhost:5000/api/posts/${id}`, config); if(isReportTab) fetchReports(); else { const typeMap = {'forum_posts':'forum','news':'news','articles':'article'}; fetchPostsByType(typeMap[activeTab]); } } };

  // Helper cho Tab
  const TabButton = ({ id, label }) => (
      <button onClick={() => setActiveTab(id)} style={{padding: '10px 15px', border: 'none', background: activeTab === id ? '#dc2626' : 'white', color: activeTab === id ? 'white' : '#333', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}}>{label}</button>
  );

  return (
    <div className="admin-page" style={{maxWidth: '1300px', margin: '20px auto', padding: '0 20px'}}>
      <h1 style={{color: '#dc2626'}}>🛡️ Quản Trị Hệ Thống</h1>
      
      <div style={{display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'30px', background:'#f3f4f6', padding:'15px', borderRadius:'10px'}}>
          <TabButton id="dashboard" label="📊 Tổng quan" />
          <TabButton id="users" label="👥 Người dùng" />
          <TabButton id="forum_posts" label="💬 Diễn Đàn" />
          <TabButton id="news" label="📰 Tin Tức" />
          <TabButton id="articles" label="📚 Kiến Thức" />
          <TabButton id="categories" label="📂 Danh mục News" /> 
          <TabButton id="topics" label="🏷️ Chủ đề Forum" />
          <TabButton id="reports" label="🚩 Báo cáo" />
      </div>

      <div style={{background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 4px 10px rgba(0,0,0,0.05)'}}>
        
        {/* 1. DASHBOARD NÂNG CẤP */}
        {activeTab === 'dashboard' && stats && (
            <div>
                {/* Bộ lọc Dashboard */}
                <div style={{marginBottom:'20px', textAlign:'right'}}>
                    <span style={{marginRight:'10px', fontWeight:'bold'}}>Xem thống kê: </span>
                    <select value={dashFilter} onChange={(e)=>setDashFilter(e.target.value)} style={{padding:'5px'}}>
                        <option value="all">Toàn bộ hệ thống</option>
                        <option value="forum">Chỉ Diễn đàn</option>
                        <option value="news">Chỉ Tin tức</option>
                        <option value="article">Chỉ Kiến thức</option>
                    </select>
                </div>

                <div style={{display:'flex', gap:'20px', marginBottom:'30px'}}>
                    <div style={{flex:1, padding:'20px', background:'#e0f2fe', borderRadius:'10px', textAlign:'center'}}><h2>{stats.totalUsers}</h2> User</div>
                    <div style={{flex:1, padding:'20px', background:'#dcfce7', borderRadius:'10px', textAlign:'center'}}>
                        {/* Logic hiển thị giả lập dựa trên filter (để chính xác cần API backend lọc, nhưng ở đây demo UI) */}
                        <h2>{dashFilter === 'all' ? stats.totalPosts : '...'}</h2> Bài viết
                    </div>
                    <div style={{flex:1, padding:'20px', background:'#fee2e2', borderRadius:'10px', textAlign:'center'}}><h2>{stats.totalViews}</h2> Lượt xem</div>
                </div>
                <div style={{height:'350px'}}>
                    <h4 style={{textAlign:'center'}}>Bài viết theo danh mục</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData}>
                            <XAxis dataKey="_id" /> <YAxis /> <Tooltip /> <Legend />
                            <Bar dataKey="count" name="Số lượng bài" fill="#8884d8">
                                {stats.chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {/* 2. QUẢN LÝ NGƯỜI DÙNG (Giữ nguyên) */}
        {activeTab === 'users' && (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#f9fafb', textAlign:'left'}}><th style={{padding:'10px'}}>User</th><th style={{padding:'10px'}}>Email</th><th style={{padding:'10px'}}>Vai trò</th><th style={{padding:'10px'}}>Hành động</th></tr></thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u._id} style={{borderBottom:'1px solid #eee', opacity: u.isBanned?0.5:1}}>
                            <td style={{padding:'10px'}}><b>{u.fullName}</b><br/><small>@{u.username}</small></td>
                            <td style={{padding:'10px'}}>{u.email}</td>
                            <td style={{padding:'10px'}}>
                                <select value={u.role} onChange={(e)=>handleChangeRole(u._id, e.target.value)} style={{padding:'5px'}}>
                                    <option value="user">User</option><option value="editor">Editor</option><option value="admin">Admin</option><option value="super_admin">Super Admin</option>
                                </select>
                            </td>
                            <td style={{padding:'10px'}}>
                                {u._id !== currentUser?.id && <button onClick={()=>handleBanUser(u._id)} style={{background: u.isBanned?'green':'red', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px'}}>{u.isBanned?'Mở':'Khóa'}</button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}

        {/* 3. QUẢN LÝ BÀI VIẾT - SỬA LINK XEM CHI TIẾT */}
        {['forum_posts', 'news', 'articles'].includes(activeTab) && (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#f9fafb', textAlign:'left'}}><th style={{padding:'10px'}}>Tiêu đề</th><th style={{padding:'10px'}}>Tác giả</th><th style={{padding:'10px'}}>Trạng thái</th><th style={{padding:'10px'}}>Hành động</th></tr></thead>
                <tbody>
                    {postsList.length === 0 ? <tr><td colSpan="4" style={{padding:'20px', textAlign:'center'}}>Trống</td></tr> : 
                    postsList.map(p => (
                        <tr key={p._id} style={{borderBottom:'1px solid #eee'}}>
                            <td style={{padding:'10px'}}>{p.title}</td>
                            <td style={{padding:'10px'}}>{p.author?.fullName}</td>
                            <td style={{padding:'10px'}}><span style={{color: p.status==='approved'?'green':'orange'}}>{p.status==='approved'?'Đã đăng':'Chờ duyệt'}</span></td>
                            <td style={{padding:'10px'}}>
                                {/* --- TRUYỀN STATE ĐỂ NÚT BACK BIẾT ĐƯỜNG VỀ --- */}
                                <Link to={`/post/${p._id}`} state={{ from: '/admin', tab: activeTab }} style={{marginRight:'10px', color:'blue', fontWeight:'bold'}}>Xem</Link>
                                <Link to={`/edit-post/${p._id}`} style={{marginRight:'10px', color:'orange'}}>Sửa</Link>
                                <button onClick={()=>handleDeletePost(p._id)} style={{color:'red', background:'none', border:'none', cursor:'pointer'}}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}

        {/* CÁC TAB KHÁC GIỮ NGUYÊN CODE CŨ (Categories, Topics) */}
        {activeTab === 'categories' && (
            <div>
                <h3>📂 Quản lý Danh mục Tin tức</h3>
                <div style={{marginBottom:'20px', display:'flex', gap:'10px'}}>
                    <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="Tên danh mục..." style={{padding:'10px', width:'300px', border:'1px solid #ddd'}} />
                    <button onClick={handleAddCategory} style={{padding:'10px 20px', background:'#10b981', color:'white', border:'none', cursor:'pointer'}}>Thêm</button>
                </div>
                <ul>{categories.map(c => <li key={c._id} style={{padding:'5px 0'}}>{c.name} <button onClick={()=>handleDeleteCategory(c._id)} style={{color:'red', marginLeft:'10px', border:'none', background:'none', cursor:'pointer'}}>Xóa</button></li>)}</ul>
            </div>
        )}
        
        {activeTab === 'topics' && (
            <div>
                <h3>🏷️ Quản lý Topic Diễn đàn</h3>
                <div style={{marginBottom:'20px', display:'flex', gap:'10px'}}>
                    <input value={newTopicName} onChange={e=>setNewTopicName(e.target.value)} placeholder="Tên topic..." style={{padding:'10px', width:'300px', border:'1px solid #ddd'}} />
                    <button onClick={handleAddTopic} style={{padding:'10px 20px', background:'#10b981', color:'white', border:'none', cursor:'pointer'}}>Thêm</button>
                </div>
                <div style={{display:'flex', gap:'10px'}}>{topics.map(t => <div key={t._id} style={{background:'#eee', padding:'5px 10px', borderRadius:'15px'}}>{t.name} <span onClick={()=>handleDeleteTopic(t._id)} style={{cursor:'pointer', color:'red', marginLeft:'5px'}}>x</span></div>)}</div>
            </div>
        )}

        {/* 6. BÁO CÁO - SỬA LINK XEM */}
        {activeTab === 'reports' && (
            <table style={{width:'100%', borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#fee2e2', textAlign:'left', color:'red'}}><th style={{padding:'10px'}}>Bài viết</th><th style={{padding:'10px'}}>Số báo cáo</th><th style={{padding:'10px'}}>Xử lý</th></tr></thead>
                <tbody>
                    {reportedPosts.map(p => (
                        <tr key={p._id} style={{borderBottom:'1px solid #eee'}}>
                            <td style={{padding:'10px'}}>{p.title}</td>
                            <td style={{padding:'10px'}}><b>{p.reports.length}</b> phiếu</td>
                            <td style={{padding:'10px'}}>
                                <Link to={`/post/${p._id}`} state={{ from: '/admin', tab: 'reports' }} style={{marginRight:'10px', color:'blue'}}>Kiểm tra</Link>
                                <button onClick={()=>handleSafePost(p._id)} style={{marginRight:'10px', color:'green'}}>Gỡ</button>
                                <button onClick={()=>handleDeletePost(p._id, true)} style={{color:'red'}}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}

      </div>
    </div>
  );
};
export default Admin;