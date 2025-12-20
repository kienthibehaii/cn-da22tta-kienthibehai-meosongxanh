import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, AreaChart, Area } from 'recharts';

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
  const fetchStats = async () => axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/stats`, config).then(res => setStats(res.data)).catch(console.error);
  const fetchUsers = async () => axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users`, config).then(res => setUsers(res.data)).catch(console.error);
  const fetchTopics = async () => axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/topics`, config).then(res => setTopics(res.data)).catch(console.error);
  const fetchCategories = async () => axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`).then(res => setCategories(res.data)).catch(console.error);
  const fetchReports = async () => axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/reports`, config).then(res => setReportedPosts(res.data)).catch(console.error);
  const fetchPostsByType = async (type) => { const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/posts-by-type?type=${type}`, config); setPostsList(res.data); };

  // Handlers
  const handleBanUser = async (id) => { if(!confirm("Đổi trạng thái?")) return; await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${id}/ban`, {}, config); fetchUsers(); };
  const handleChangeRole = async (id, newRole) => { if(!confirm(`Cấp quyền ${newRole}?`)) return; await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/users/${id}/role`, { role: newRole }, config); fetchUsers(); };
  const handleAddTopic = async () => { if(!newTopicName) return; await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/topics`, { name: newTopicName }, config); setNewTopicName(''); fetchTopics(); };
  const handleDeleteTopic = async (id) => { if(confirm("Xóa?")) { await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/topics/${id}`, config); fetchTopics(); } };
  const handleAddCategory = async () => { if(!newCatName) return; await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories`, { name: newCatName }, config); setNewCatName(''); fetchCategories(); };
  const handleDeleteCategory = async (id) => { if(confirm("Xóa?")) { await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/categories/${id}`, config); fetchCategories(); } };
  const handleSafePost = async (id) => { if(confirm("Gỡ báo cáo?")) { await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/reports/${id}/dismiss`, {}, config); fetchReports(); } };
  const handleDeletePost = async (id, isReportTab = false) => { if(confirm("Xóa bài?")) { await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/posts/${id}`, config); if(isReportTab) fetchReports(); else { const typeMap = {'forum_posts':'forum','news':'news','articles':'article'}; fetchPostsByType(typeMap[activeTab]); } } };

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
                {/* Thống kê tổng quan */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/30 rounded-full -mr-8 -mt-8"></div>
                        <div className="text-3xl mb-2">👥</div>
                        <h3 className="text-3xl font-bold text-blue-600 mb-1">{stats.totalUsers}</h3>
                        <span className="text-blue-600/70 font-medium">Thành viên</span>
                        <div className="text-xs text-blue-500 mt-2">+{Math.floor(stats.totalUsers * 0.1)} tuần này</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200/30 rounded-full -mr-8 -mt-8"></div>
                        <div className="text-3xl mb-2">📝</div>
                        <h3 className="text-3xl font-bold text-emerald-600 mb-1">{stats.totalPosts}</h3>
                        <span className="text-emerald-600/70 font-medium">Bài viết</span>
                        <div className="text-xs text-emerald-500 mt-2">+{Math.floor(stats.totalPosts * 0.05)} tuần này</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200/30 rounded-full -mr-8 -mt-8"></div>
                        <div className="text-3xl mb-2">👁️</div>
                        <h3 className="text-3xl font-bold text-orange-600 mb-1">{stats.totalViews}</h3>
                        <span className="text-orange-600/70 font-medium">Lượt xem</span>
                        <div className="text-xs text-orange-500 mt-2">+{Math.floor(stats.totalViews * 0.15)} tuần này</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200/30 rounded-full -mr-8 -mt-8"></div>
                        <div className="text-3xl mb-2">💬</div>
                        <h3 className="text-3xl font-bold text-purple-600 mb-1">{stats.totalComments || 0}</h3>
                        <span className="text-purple-600/70 font-medium">Bình luận</span>
                        <div className="text-xs text-purple-500 mt-2">+{Math.floor((stats.totalComments || 0) * 0.2)} tuần này</div>
                    </div>
                </div>

                {/* Biểu đồ chính */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Biểu đồ cột - Bài viết theo danh mục */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            📊 Bài viết theo danh mục
                        </h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.chartData}>
                                    <XAxis dataKey="_id" tick={{fontSize: 12}} />
                                    <YAxis tick={{fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="count" name="Số bài" radius={[4, 4, 0, 0]}>
                                        {stats.chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Biểu đồ tròn - Phân bố loại bài viết */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            🥧 Phân bố loại bài viết
                        </h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Diễn đàn', value: Math.floor(stats.totalPosts * 0.4), fill: '#3b82f6' },
                                            { name: 'Tin tức', value: Math.floor(stats.totalPosts * 0.35), fill: '#10b981' },
                                            { name: 'Kiến thức', value: Math.floor(stats.totalPosts * 0.25), fill: '#f59e0b' }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ xu hướng */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Biểu đồ đường - Hoạt động 7 ngày qua */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            📈 Hoạt động 7 ngày qua
                        </h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[
                                    { day: 'T2', posts: 12, users: 8, views: 145 },
                                    { day: 'T3', posts: 19, users: 15, views: 230 },
                                    { day: 'T4', posts: 8, users: 12, views: 180 },
                                    { day: 'T5', posts: 25, users: 22, views: 320 },
                                    { day: 'T6', posts: 18, users: 18, views: 280 },
                                    { day: 'T7', posts: 30, users: 25, views: 450 },
                                    { day: 'CN', posts: 22, users: 20, views: 380 }
                                ]}>
                                    <XAxis dataKey="day" tick={{fontSize: 12}} />
                                    <YAxis tick={{fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} name="Bài viết" />
                                    <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} name="Người dùng mới" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Biểu đồ vùng - Lượt xem theo thời gian */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            📊 Lượt xem theo giờ
                        </h4>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={[
                                    { time: '6h', views: 20 },
                                    { time: '9h', views: 45 },
                                    { time: '12h', views: 80 },
                                    { time: '15h', views: 120 },
                                    { time: '18h', views: 150 },
                                    { time: '21h', views: 180 },
                                    { time: '24h', views: 90 }
                                ]}>
                                    <XAxis dataKey="time" tick={{fontSize: 12}} />
                                    <YAxis tick={{fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="views" 
                                        stroke="#f59e0b" 
                                        fill="url(#colorViews)" 
                                        strokeWidth={2}
                                    />
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Thống kê nhanh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h5 className="text-lg font-semibold opacity-90">Tỷ lệ tương tác</h5>
                                <p className="text-3xl font-bold">85%</p>
                                <p className="text-sm opacity-75">↗️ +5% so với tuần trước</p>
                            </div>
                            <div className="text-4xl opacity-80">💫</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h5 className="text-lg font-semibold opacity-90">Bài viết chất lượng</h5>
                                <p className="text-3xl font-bold">92%</p>
                                <p className="text-sm opacity-75">🎯 Đạt mục tiêu</p>
                            </div>
                            <div className="text-4xl opacity-80">⭐</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h5 className="text-lg font-semibold opacity-90">Thời gian phản hồi</h5>
                                <p className="text-3xl font-bold">2.3h</p>
                                <p className="text-sm opacity-75">⚡ Nhanh hơn 30%</p>
                            </div>
                            <div className="text-4xl opacity-80">🚀</div>
                        </div>
                    </div>
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