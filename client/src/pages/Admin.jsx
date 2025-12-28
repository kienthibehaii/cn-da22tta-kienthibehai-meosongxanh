import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, AreaChart, Area } from 'recharts';
import { API_URL } from '../apiConfig';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [postsList, setPostsList] = useState([]);
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [reportedPosts, setReportedPosts] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  
  const [newTopicName, setNewTopicName] = useState('');
  const [newCatName, setNewCatName] = useState('');

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user_info'));
  const config = { headers: { Authorization: token } };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'challenges') fetchChallenges();
    if (activeTab === 'topics') fetchTopics();
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'reports') fetchReports();
    
    if (['forum_posts', 'news', 'articles'].includes(activeTab)) {
        const typeMap = { 'forum_posts': 'forum', 'news': 'news', 'articles': 'article' };
        fetchPostsByType(typeMap[activeTab]);
    }
  }, [activeTab]);

  // API Calls
  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/stats`, config);
      console.log('Stats data:', res.data); // Debug log
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  const fetchUsers = async () => axios.get(`${API_URL}/admin/users`, config).then(res => setUsers(res.data)).catch(console.error);
  const fetchChallenges = async () => {
    try {
      const res = await axios.get(`${API_URL}/challenges`, config);
      console.log('Challenges data:', res.data); // Debug log
      setChallenges(res.data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  };
  const fetchTopics = async () => axios.get(`${API_URL}/admin/topics`, config).then(res => setTopics(res.data)).catch(console.error);
  const fetchCategories = async () => axios.get(`${API_URL}/categories`).then(res => setCategories(res.data)).catch(console.error);
  const fetchReports = async () => axios.get(`${API_URL}/admin/reports`, config).then(res => setReportedPosts(res.data)).catch(console.error);
  const fetchPostsByType = async (type) => { const res = await axios.get(`${API_URL}/admin/posts-by-type?type=${type}`, config); setPostsList(res.data); };

  // Handlers
  const handleBanUser = async (id) => { if(!confirm("Đổi trạng thái?")) return; await axios.put(`${API_URL}/admin/users/${id}/ban`, {}, config); fetchUsers(); };
  const handleChangeRole = async (id, newRole) => { if(!confirm(`Cấp quyền ${newRole}?`)) return; await axios.put(`${API_URL}/admin/users/${id}/role`, { role: newRole }, config); fetchUsers(); };
  const handleDeleteChallenge = async (id) => { if(!confirm("Xóa challenge?")) return; await axios.delete(`${API_URL}/challenges/${id}`, config); fetchChallenges(); };
  const handleUpdateChallengeStatus = async (id, status) => { await axios.put(`${API_URL}/challenges/${id}`, { status }, config); fetchChallenges(); };
  const handleAddTopic = async () => { if(!newTopicName) return; await axios.post(`${API_URL}/admin/topics`, { name: newTopicName }, config); setNewTopicName(''); fetchTopics(); };
  const handleDeleteTopic = async (id) => { if(confirm("Xóa?")) { await axios.delete(`${API_URL}/admin/topics/${id}`, config); fetchTopics(); } };
  const handleAddCategory = async () => { if(!newCatName) return; await axios.post(`${API_URL}/categories`, { name: newCatName }, config); setNewCatName(''); fetchCategories(); };
  const handleDeleteCategory = async (id) => { if(confirm("Xóa?")) { await axios.delete(`${API_URL}/categories/${id}`, config); fetchCategories(); } };
  const handleSafePost = async (id) => { if(confirm("Gỡ báo cáo?")) { await axios.put(`${API_URL}/admin/reports/${id}/dismiss`, {}, config); fetchReports(); } };
  const handleDeletePost = async (id, isReportTab = false) => { if(confirm("Xóa bài?")) { await axios.delete(`${API_URL}/posts/${id}`, config); if(isReportTab) fetchReports(); else { const typeMap = {'forum_posts':'forum','news':'news','articles':'article'}; fetchPostsByType(typeMap[activeTab]); } } };

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
          <TabBtn id="dashboard" label="📊 Thống kê" />
          <TabBtn id="users" label="👥 Người dùng" />
          <TabBtn id="challenges" label="🎯 Thử thách" />
          <TabBtn id="forum_posts" label="💬 Diễn đàn" />
          <TabBtn id="news" label="📰 Tin tức" />
          <TabBtn id="articles" label="📚 Kiến thức" />
          <TabBtn id="topics" label="🏷️ Topic Forum" />
          <TabBtn id="categories" label="📂 Danh mục News" /> 
          <TabBtn id="reports" label="🚩 Báo cáo" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">
        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
            <div>
                {!stats ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải thống kê...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Thống kê tổng quan */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/30 rounded-full -mr-8 -mt-8"></div>
                        <div className="text-3xl mb-2">👥</div>
                        <h3 className="text-3xl font-bold text-blue-600 mb-1">{stats.totalUsers}</h3>
                        <span className="text-blue-600/70 font-medium">Thành viên</span>
                        <div className="text-xs text-blue-500 mt-2">+{stats.newUsersThisWeek || 0} tuần này</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200/30 rounded-full -mr-8 -mt-8"></div>
                        <div className="text-3xl mb-2">📝</div>
                        <h3 className="text-3xl font-bold text-emerald-600 mb-1">{stats.totalPosts}</h3>
                        <span className="text-emerald-600/70 font-medium">Bài viết</span>
                        <div className="text-xs text-emerald-500 mt-2">+{stats.newPostsThisWeek || 0} tuần này</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200/30 rounded-full -mr-8 -mt-8"></div>
                        <div className="text-3xl mb-2">👁️</div>
                        <h3 className="text-3xl font-bold text-orange-600 mb-1">{stats.totalViews}</h3>
                        <span className="text-orange-600/70 font-medium">Lượt xem</span>
                        <div className="text-xs text-orange-500 mt-2">Tổng lượt xem</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200/30 rounded-full -mr-8 -mt-8"></div>
                        <div className="text-3xl mb-2">💬</div>
                        <h3 className="text-3xl font-bold text-purple-600 mb-1">{stats.totalComments || 0}</h3>
                        <span className="text-purple-600/70 font-medium">Bình luận</span>
                        <div className="text-xs text-purple-500 mt-2">Tổng bình luận</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-200/30 rounded-full -mr-8 -mt-8"></div>
                        <div className="text-3xl mb-2">🎯</div>
                        <h3 className="text-3xl font-bold text-indigo-600 mb-1">{stats.totalChallenges || 0}</h3>
                        <span className="text-indigo-600/70 font-medium">Thử thách</span>
                        <div className="text-xs text-indigo-500 mt-2">+{stats.newChallengesThisWeek || 0} tuần này</div>
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
                            {stats.categoryStats && stats.categoryStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                    <BarChart data={stats.categoryStats}>
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
                                            {stats.categoryStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">📊</div>
                                        <p>Chưa có dữ liệu</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Biểu đồ tròn - Phân bố loại bài viết */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            🥧 Phân bố loại bài viết
                        </h4>
                        <div className="h-64">
                            {stats.postTypeStats && stats.postTypeStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                    <PieChart>
                                        <Pie
                                            data={stats.postTypeStats.map(item => ({
                                                name: item._id === 'forum' ? 'Diễn đàn' : 
                                                      item._id === 'news' ? 'Tin tức' : 
                                                      item._id === 'article' ? 'Kiến thức' : item._id,
                                                value: item.count,
                                                fill: item._id === 'forum' ? '#3b82f6' : 
                                                      item._id === 'news' ? '#10b981' : 
                                                      item._id === 'article' ? '#f59e0b' : '#8b5cf6'
                                            }))}
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
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🥧</div>
                                        <p>Chưa có dữ liệu</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Biểu đồ xu hướng */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Thống kê theo topic (forum) */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            🏷️ Bài viết theo chủ đề (Forum)
                        </h4>
                        <div className="h-64">
                            {stats.topicStats && stats.topicStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                    <BarChart data={stats.topicStats}>
                                        <XAxis dataKey="_id" tick={{fontSize: 12}} />
                                        <YAxis tick={{fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar dataKey="count" name="Số bài" radius={[4, 4, 0, 0]} fill="#6366f1" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🏷️</div>
                                        <p>Chưa có bài viết forum</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bài viết được xem nhiều nhất */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            🔥 Bài viết được xem nhiều nhất
                        </h4>
                        <div className="h-64 overflow-y-auto">
                            {stats.mostViewedPosts && stats.mostViewedPosts.length > 0 ? (
                                <div className="space-y-3">
                                    {stats.mostViewedPosts.slice(0, 8).map((post, index) => (
                                        <div key={post._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-sm font-bold px-2 py-1 rounded ${
                                                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                        index === 1 ? 'bg-gray-100 text-gray-800' :
                                                        index === 2 ? 'bg-orange-100 text-orange-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        #{index + 1}
                                                    </span>
                                                    <span className={`text-xs px-2 py-1 rounded ${
                                                        post.type === 'forum' ? 'bg-blue-100 text-blue-600' :
                                                        post.type === 'news' ? 'bg-green-100 text-green-600' :
                                                        'bg-purple-100 text-purple-600'
                                                    }`}>
                                                        {post.type === 'forum' ? 'Forum' : 
                                                         post.type === 'news' ? 'Tin tức' : 'Kiến thức'}
                                                    </span>
                                                </div>
                                                <h5 className="font-medium text-sm text-gray-900 truncate" title={post.title}>
                                                    {post.title}
                                                </h5>
                                                <p className="text-xs text-gray-500">
                                                    {post.author?.fullName || 'Ẩn danh'} • {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <div className="text-right ml-3">
                                                <div className="text-lg font-bold text-orange-600">{post.views.toLocaleString()}</div>
                                                <div className="text-xs text-gray-500">lượt xem</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🔥</div>
                                        <p>Chưa có dữ liệu</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Biểu đồ hoạt động và thống kê khác */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Hoạt động 7 ngày qua */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            📈 Hoạt động 7 ngày qua
                        </h4>
                        <div className="h-64">
                            {stats.dailyStats && stats.dailyStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                    <LineChart data={stats.dailyStats}>
                                        <XAxis dataKey="date" tick={{fontSize: 10}} />
                                        <YAxis tick={{fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="posts" stroke="#3b82f6" name="Bài viết" strokeWidth={2} />
                                        <Line type="monotone" dataKey="comments" stroke="#10b981" name="Bình luận" strokeWidth={2} />
                                        <Line type="monotone" dataKey="users" stroke="#f59e0b" name="Người dùng mới" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">📈</div>
                                        <p>Chưa có dữ liệu hoạt động</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Thống kê thử thách */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            🎯 Thống kê thử thách
                        </h4>
                        <div className="h-64">
                            {stats.challengeStatusStats && stats.challengeStatusStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                                    <BarChart data={stats.challengeStatusStats.map(item => ({
                                        status: item._id === 'draft' ? 'Nháp' :
                                               item._id === 'active' ? 'Hoạt động' :
                                               item._id === 'completed' ? 'Hoàn thành' :
                                               item._id === 'cancelled' ? 'Đã hủy' : item._id,
                                        count: item.count
                                    }))}>
                                        <XAxis dataKey="status" tick={{fontSize: 12}} />
                                        <YAxis tick={{fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar dataKey="count" name="Số lượng" radius={[4, 4, 0, 0]} fill="#6366f1" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🎯</div>
                                        <p>Chưa có thử thách</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                </div>

                {/* Thống kê nhanh */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h5 className="text-lg font-semibold opacity-90">Người dùng mới tuần này</h5>
                                <p className="text-3xl font-bold">{stats.newUsersThisWeek || 0}</p>
                                <p className="text-sm opacity-75">👥 Thành viên mới</p>
                            </div>
                            <div className="text-4xl opacity-80">�</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h5 className="text-lg font-semibold opacity-90">Bài viết mới tuần này</h5>
                                <p className="text-3xl font-bold">{stats.newPostsThisWeek || 0}</p>
                                <p className="text-sm opacity-75">📝 Nội dung mới</p>
                            </div>
                            <div className="text-4xl opacity-80">📝</div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h5 className="text-lg font-semibold opacity-90">Thử thách mới tuần này</h5>
                                <p className="text-3xl font-bold">{stats.newChallengesThisWeek || 0}</p>
                                <p className="text-sm opacity-75">🎯 Hoạt động mới</p>
                            </div>
                            <div className="text-4xl opacity-80">🎯</div>
                        </div>
                    </div>
                </div>
                    </>
                )}
            </div>
        )}

        {/* 2. TABLE TEMPLATE (Users, Posts, Reports, Challenges) */}
        {['users', 'challenges', 'forum_posts', 'news', 'articles', 'reports'].includes(activeTab) && (
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
                        {activeTab === 'challenges' && challenges.map(c => (
                            <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-bold">{c.title}<br/><span className="font-normal text-gray-400">{c.category}</span></td>
                                <td className="py-3 px-4">👥 {c.stats.totalParticipants} | 🏆 {c.pointsReward}đ<br/><span className="text-gray-400 text-xs">Kết thúc: {new Date(c.endDate).toLocaleDateString('vi-VN')}</span></td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        c.status === 'active' ? 'bg-green-100 text-green-600' :
                                        c.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                                        c.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                                        'bg-red-100 text-red-600'
                                    }`}>
                                        {c.status === 'active' ? 'Hoạt động' :
                                         c.status === 'draft' ? 'Nháp' :
                                         c.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-right flex justify-end gap-2">
                                    <select value={c.status} onChange={(e)=>handleUpdateChallengeStatus(c._id, e.target.value)} className="border rounded px-1 py-1 text-xs">
                                        <option value="draft">Nháp</option>
                                        <option value="active">Hoạt động</option>
                                        <option value="completed">Hoàn thành</option>
                                        <option value="cancelled">Đã hủy</option>
                                    </select>
                                    <button onClick={()=>setSelectedChallenge(c)} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200">Chi tiết</button>
                                    <button onClick={()=>handleDeleteChallenge(c._id)} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded border border-red-200">Xóa</button>
                                </td>
                            </tr>
                        ))}
                        {['forum_posts', 'news', 'articles'].includes(activeTab) && postsList.map(p => (
                            <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 font-medium">{p.title}</td>
                                <td className="py-3 px-4 text-gray-500">{p.author?.fullName}</td>
                                <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs font-bold ${p.status==='approved'?'bg-green-100 text-green-600':'bg-orange-100 text-orange-600'}`}>{p.status}</span></td>
                                <td className="py-3 px-4 text-right flex justify-end gap-2">
                                    <Link to={`/post/${p._id}`} state={{from:'/admin', tab: activeTab}} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 font-medium">Chi tiết</Link>
                                    <Link to={`/edit-post/${p._id}`} className="text-orange-500 hover:bg-orange-50 px-2 py-1 rounded border border-orange-200">Sửa</Link>
                                    <button onClick={()=>handleDeletePost(p._id)} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded border border-red-200">Xóa</button>
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

        {/* 4. CHALLENGE STATS */}
        {activeTab === 'challenge-stats' && (
          <div>
            {!challengeStats ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Đang tải thống kê thử thách...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Thống kê Thử thách</h2>
                  <p className="text-gray-600">Bảng xếp hạng và thống kê chi tiết của người dùng</p>
                </div>

                {/* Leaderboard */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">🏆 Bảng Xếp Hạng</h3>
                  </div>
                  <div className="p-6">
                    {challengeStats.leaderboard.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏆</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dữ liệu xếp hạng</h3>
                        <p className="text-gray-500">Chưa có ai hoàn thành thử thách nào!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {challengeStats.leaderboard.map((entry, index) => (
                          <div
                            key={entry.user._id}
                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' :
                              index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300' :
                              index === 2 ? 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300' :
                              'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              {/* Rank */}
                              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                                index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                index === 2 ? 'bg-orange-500 text-white' :
                                'bg-blue-100 text-blue-600'
                              }`}>
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                              </div>

                              {/* User Info */}
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                  {entry.user.avatar ? (
                                    <img src={entry.user.avatar} alt={entry.user.username} className="w-12 h-12 rounded-full object-cover" />
                                  ) : (
                                    entry.user.username.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{entry.user.username}</h3>
                                  <p className="text-sm text-gray-500">{entry.completedChallenges} thử thách hoàn thành</p>
                                </div>
                              </div>
                            </div>

                            {/* Points */}
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">{entry.totalPoints.toLocaleString()}</div>
                              <div className="text-sm text-gray-500">điểm</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* All Users Stats */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">👥 Thống kê Tất cả Người dùng</h3>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-gray-200 text-gray-500 text-sm uppercase">
                            <th className="py-3 px-4">Người dùng</th>
                            <th className="py-3 px-4">Điểm</th>
                            <th className="py-3 px-4">Tham gia</th>
                            <th className="py-3 px-4">Hoàn thành</th>
                            <th className="py-3 px-4">Tỷ lệ thành công</th>
                            <th className="py-3 px-4">Ngày tham gia</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                          {challengeStats.allUsers
                            .sort((a, b) => (b.points || 0) - (a.points || 0))
                            .map(user => (
                            <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                    {user.avatar ? (
                                      <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                      user.username.charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium">{user.fullName}</div>
                                    <div className="text-gray-500 text-xs">@{user.username}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold text-blue-600">{(user.points || 0).toLocaleString()}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-medium">{user.challengeStats?.totalJoined || 0}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-medium text-green-600">{user.challengeStats?.totalCompleted || 0}</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`font-medium ${
                                  (user.challengeStats?.successRate || 0) >= 80 ? 'text-green-600' :
                                  (user.challengeStats?.successRate || 0) >= 50 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {user.challengeStats?.successRate || 0}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 pt-20 z-[60]">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[calc(100vh-6rem)] overflow-y-auto shadow-2xl border border-gray-200 mt-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Chi tiết Challenge</h2>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="font-bold text-xl mb-3 text-gray-900">{selectedChallenge.title}</h3>
                  <p className="text-gray-700 mb-4 leading-relaxed">{selectedChallenge.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-blue-500">📅</span>
                      <span>Kết thúc: {new Date(selectedChallenge.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-yellow-500">🏆</span>
                      <span>Điểm thưởng: {selectedChallenge.pointsReward}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-purple-500">📂</span>
                      <span>Loại: {selectedChallenge.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-green-500">👥</span>
                      <span>Tham gia: {selectedChallenge.stats.totalParticipants}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                    <span className="text-orange-500">📋</span>
                    Yêu cầu hoàn thành:
                  </h4>
                  <p className="text-gray-700 bg-orange-50 p-4 rounded-lg border border-orange-200 leading-relaxed">
                    {selectedChallenge.requirements}
                  </p>
                </div>

                {selectedChallenge.tags && selectedChallenge.tags.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-gray-900 flex items-center gap-2">
                      <span className="text-indigo-500">🏷️</span>
                      Tags:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedChallenge.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <span className="text-emerald-500">📊</span>
                    Thống kê:
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600">{selectedChallenge.stats.totalParticipants}</div>
                      <div className="text-sm text-blue-600 font-medium mt-1">Tham gia</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                      <div className="text-3xl font-bold text-green-600">{selectedChallenge.stats.completedCount}</div>
                      <div className="text-sm text-green-600 font-medium mt-1">Hoàn thành</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600">{selectedChallenge.stats.successRate.toFixed(1)}%</div>
                      <div className="text-sm text-purple-600 font-medium mt-1">Tỷ lệ thành công</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-4 text-gray-900 flex items-center gap-2">
                    <span className="text-pink-500">👥</span>
                    Danh sách người tham gia:
                  </h4>
                  <div className="max-h-60 overflow-y-auto">
                    {selectedChallenge.participants.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-4">👥</div>
                        <p className="text-gray-500 italic">Chưa có ai tham gia</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedChallenge.participants.map((participant, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {typeof participant.user === 'object' ? participant.user.fullName : 'User'}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Tham gia: {new Date(participant.joinedAt).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  participant.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  participant.status === 'joined' ? 'bg-blue-100 text-blue-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {participant.status === 'completed' ? 'Hoàn thành' :
                                   participant.status === 'joined' ? 'Đang tham gia' : 'Thất bại'}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 font-medium">{participant.progress}%</div>
                              </div>
                              <div className="w-20 bg-gray-200 rounded-full h-3">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-500 ${
                                    participant.progress === 100 ? 'bg-green-500' :
                                    participant.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                                  }`}
                                  style={{ width: `${participant.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <select 
                      value={selectedChallenge.status} 
                      onChange={(e) => {
                        handleUpdateChallengeStatus(selectedChallenge._id, e.target.value);
                        setSelectedChallenge({...selectedChallenge, status: e.target.value});
                      }}
                      className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="draft">Nháp</option>
                      <option value="active">Hoạt động</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                    <button
                      onClick={() => {
                        handleDeleteChallenge(selectedChallenge._id);
                        setSelectedChallenge(null);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <span>🗑️</span>
                      Xóa Challenge
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Admin;