import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [reportedPosts, setReportedPosts] = useState([]);
  
  const [newTopicName, setNewTopicName] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user_info'));
  const config = { headers: { Authorization: token } };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'topics') fetchTopics();
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'reports') fetchReports();
    
    if (['forum_posts', 'news', 'articles'].includes(activeTab)) {
        const typeMap = { 'forum_posts': 'forum', 'news': 'news', 'articles': 'article' };
        fetchPostsByType(typeMap[activeTab]);
    }
  }, [activeTab]);

  // API Calls
  const fetchStats = async () => axios.get('http://localhost:5000/api/admin/stats', config).then(res => setStats(res.data)).catch(console.error);
  const fetchUsers = async () => axios.get('http://localhost:5000/api/admin/users', config).then(res => setUsers(res.data)).catch(console.error);
  const fetchTopics = async () => axios.get('http://localhost:5000/api/admin/topics', config).then(res => setTopics(res.data)).catch(console.error);
  const fetchCategories = async () => axios.get('http://localhost:5000/api/categories').then(res => setCategories(res.data)).catch(console.error);
  const fetchReports = async () => axios.get('http://localhost:5000/api/admin/reports', config).then(res => setReportedPosts(res.data)).catch(console.error);
  const fetchPostsByType = async (type) => { const res = await axios.get(`http://localhost:5000/api/admin/posts-by-type?type=${type}`, config); setPostsList(res.data); };

  // Handlers
  const handleBanUser = async (id) => { if(!confirm("Đổi trạng thái?")) return; await axios.put(`http://localhost:5000/api/admin/users/${id}/ban`, {}, config); fetchUsers(); };
  const handleChangeRole = async (id, newRole) => { if(!confirm(`Cấp quyền ${newRole}?`)) return; await axios.put(`http://localhost:5000/api/admin/users/${id}/role`, { role: newRole }, config); fetchUsers(); };
  const handleAddTopic = async () => { if(!newTopicName) return; await axios.post('http://localhost:5000/api/admin/topics', { name: newTopicName }, config); setNewTopicName(''); fetchTopics(); };
  const handleDeleteTopic = async (id) => { if(confirm("Xóa?")) { await axios.delete(`http://localhost:5000/api/admin/topics/${id}`, config); fetchTopics(); } };
  const handleAddCategory = async () => { if(!newCatName) return; await axios.post('http://localhost:5000/api/categories', { name: newCatName }, config); setNewCatName(''); fetchCategories(); };
  const handleDeleteCategory = async (id) => { if(confirm("Xóa?")) { await axios.delete(`http://localhost:5000/api/categories/${id}`, config); fetchCategories(); } };
  const handleSafePost = async (id) => { if(confirm("Gỡ báo cáo?")) { await axios.put(`http://localhost:5000/api/admin/reports/${id}/dismiss`, {}, config); fetchReports(); } };
  const handleDeletePost = async (id, isReportTab = false) => { if(confirm("Xóa bài?")) { await axios.delete(`http://localhost:5000/api/posts/${id}`, config); if(isReportTab) fetchReports(); else { const typeMap = {'forum_posts':'forum','news':'news','articles':'article'}; fetchPostsByType(typeMap[activeTab]); } } };

  // UI Components
  const TabBtn = ({ id, label }) => (
      <button onClick={() => setActiveTab(id)} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === id ? 'bg-red-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>{label}</button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2"><span className="text-red-600">🛡️</span> Hệ Thống Quản Trị</h1>
          <div className="text-sm bg-white px-4 py-2 rounded-full border border-gray-200">Hi, <b>{currentUser?.username}</b></div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 p-2 rounded-xl">
          <TabBtn id="dashboard" label="📊 Tổng quan" />
          <TabBtn id="users" label="👥 Người dùng" />
          <TabBtn id="forum_posts" label="💬 Diễn đàn" />
          <TabBtn id="news" label="📰 Tin tức" />
          <TabBtn id="articles" label="📚 Kiến thức" />
          <TabBtn id="topics" label="🏷️ Topic Forum" />
          <TabBtn id="categories" label="📂 Danh mục News" /> 
          <TabBtn id="reports" label="🚩 Báo cáo" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && stats && (
            <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center"><h3 className="text-4xl font-bold text-blue-600 mb-1">{stats.totalUsers}</h3><span className="text-blue-600/70 font-medium">Thành viên</span></div>
                    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 text-center"><h3 className="text-4xl font-bold text-emerald-600 mb-1">{stats.totalPosts}</h3><span className="text-emerald-600/70 font-medium">Bài viết</span></div>
                    <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 text-center"><h3 className="text-4xl font-bold text-orange-600 mb-1">{stats.totalViews}</h3><span className="text-orange-600/70 font-medium">Lượt xem</span></div>
                </div>
                <div className="h-80 bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h4 className="text-center font-bold text-gray-500 mb-4">Thống kê bài viết theo danh mục</h4>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={stats.chartData}>
                            <XAxis dataKey="_id" /> <YAxis /> <Tooltip /> <Bar dataKey="count" name="Số bài" fill="#8884d8" radius={[4, 4, 0, 0]}>{stats.chartData.map((e, i) => <Cell key={i} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][i % 4]} />)}</Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {/* 2. TABLE TEMPLATE (Users, Posts, Reports) */}
        {['users', 'forum_posts', 'news', 'articles', 'reports'].includes(activeTab) && (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 text-gray-500 text-sm uppercase"><th className="py-3 px-4">Thông tin chính</th><th className="py-3 px-4">Chi tiết</th><th className="py-3 px-4">Trạng thái</th><th className="py-3 px-4 text-right">Hành động</th></tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                        {activeTab === 'users' && users.map(u => (
                            <tr key={u._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-bold">{u.fullName}<br/><span className="font-normal text-gray-400">@{u.username}</span></td>
                                <td className="py-3 px-4">{u.email}</td>
                                <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs font-bold ${u.isBanned?'bg-red-100 text-red-600':'bg-green-100 text-green-600'}`}>{u.isBanned?'Locked':'Active'}</span></td>
                                <td className="py-3 px-4 text-right flex justify-end gap-2">
                                    <select value={u.role} onChange={(e)=>handleChangeRole(u._id, e.target.value)} className="border rounded px-1 py-1 text-xs"><option value="user">User</option><option value="editor">Editor</option><option value="admin">Admin</option><option value="super_admin">Super</option></select>
                                    {u._id !== currentUser?.id && <button onClick={()=>handleBanUser(u._id)} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded border border-red-200">{u.isBanned?'Mở':'Khóa'}</button>}
                                </td>
                            </tr>
                        ))}
                        {['forum_posts', 'news', 'articles'].includes(activeTab) && postsList.map(p => (
                            <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium">{p.title}</td>
                                <td className="py-3 px-4 text-gray-500">{p.author?.fullName}</td>
                                <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs font-bold ${p.status==='approved'?'bg-green-100 text-green-600':'bg-orange-100 text-orange-600'}`}>{p.status}</span></td>
                                <td className="py-3 px-4 text-right">
                                    <Link to={`/post/${p._id}`} state={{from:'/admin', tab: activeTab}} className="text-blue-600 font-bold mr-3 hover:underline">Xem</Link>
                                    <Link to={`/edit-post/${p._id}`} className="text-orange-500 mr-3 hover:underline">Sửa</Link>
                                    <button onClick={()=>handleDeletePost(p._id)} className="text-red-500 hover:underline">Xóa</button>
                                </td>
                            </tr>
                        ))}
                        {activeTab === 'reports' && reportedPosts.map(p => (
                            <tr key={p._id} className="border-b border-gray-100 bg-red-50/50">
                                <td className="py-3 px-4 font-medium text-red-900">{p.title}</td>
                                <td className="py-3 px-4 font-bold text-red-600">{p.reports.length} phiếu</td>
                                <td className="py-3 px-4 text-red-500 italic">Vi phạm</td>
                                <td className="py-3 px-4 text-right">
                                    <Link to={`/post/${p._id}`} state={{from:'/admin', tab: 'reports'}} className="text-blue-600 font-bold mr-3">Kiểm tra</Link>
                                    <button onClick={()=>handleSafePost(p._id)} className="text-green-600 mr-3 font-bold">Gỡ</button>
                                    <button onClick={()=>handleDeletePost(p._id, true)} className="text-red-600 font-bold">Xóa bài</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* 3. INPUT FORMS (Topics, Categories) */}
        {['topics', 'categories'].includes(activeTab) && (
            <div className="max-w-xl mx-auto">
                <div className="flex gap-2 mb-6">
                    <input 
                        value={activeTab==='topics'?newTopicName:newCatName} 
                        onChange={e => activeTab==='topics'?setNewTopicName(e.target.value):setNewCatName(e.target.value)}
                        placeholder={`Thêm ${activeTab==='topics'?'chủ đề':'danh mục'} mới...`} 
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button onClick={activeTab==='topics'?handleAddTopic:handleAddCategory} className="bg-emerald-600 text-white px-6 rounded-lg font-bold hover:bg-emerald-700">Thêm</button>
                </div>
                <div className="space-y-2">
                    {(activeTab==='topics'?topics:categories).map(item => (
                        <div key={item._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="font-medium text-gray-700">{item.name}</span>
                            <button onClick={()=>activeTab==='topics'?handleDeleteTopic(item._id):handleDeleteCategory(item._id)} className="text-red-500 hover:bg-red-100 p-1 rounded transition">🗑️</button>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
export default Admin;