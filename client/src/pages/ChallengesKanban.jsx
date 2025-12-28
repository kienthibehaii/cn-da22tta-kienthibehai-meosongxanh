import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../apiConfig';

const ChallengesKanban = () => {
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeView, setActiveView] = useState('kanban'); // 'kanban' hoặc 'leaderboard'
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [filter, setFilter] = useState({
    assignee: 'all',
    category: 'all',
    priority: 'all'
  });

  // Form state cho tạo challenge mới
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    requirements: '',
    pointsReward: 10,
    category: 'daily',
    priority: 'medium',
    endDate: '',
    maxParticipants: '',
    tags: '',
    assignee: ''
  });

  // Kanban columns
  const columns = [
    { id: 'backlog', title: 'Danh sách chờ', status: 'draft', color: 'bg-gray-100', headerColor: 'bg-gray-200' },
    { id: 'todo', title: 'Sẵn sàng', status: 'active', color: 'bg-blue-50', headerColor: 'bg-blue-200' },
    { id: 'inprogress', title: 'Đang thực hiện', status: 'joined', color: 'bg-yellow-50', headerColor: 'bg-yellow-200' },
    { id: 'done', title: 'Hoàn thành', status: 'completed', color: 'bg-green-50', headerColor: 'bg-green-200' }
  ];

  useEffect(() => {
    fetchChallenges();
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (activeView === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeView, leaderboardPeriod]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        const savedUser = localStorage.getItem('user_info');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        const savedUser = localStorage.getItem('user_info');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      const savedUser = localStorage.getItem('user_info');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      }
    }
  };

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/challenges`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Fetched challenges:', data.length);
        
        // Debug: Log challenges with participants
        data.forEach(challenge => {
          const completedParticipants = challenge.participants.filter(p => p.status === 'completed');
          if (completedParticipants.length > 0) {
            console.log(`✅ Challenge "${challenge.title}" has ${completedParticipants.length} completed participants`);
          }
        });
        
        setChallenges(data);
      } else {
        setError('Không thể tải danh sách thử thách');
      }
    } catch (error) {
      setError('Lỗi kết nối server');
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/challenges/leaderboard?period=${leaderboardPeriod}`);
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      } else {
        setError('Không thể tải bảng xếp hạng');
      }
    } catch (error) {
      setError('Lỗi kết nối server');
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const challengeData = {
        ...newChallenge,
        pointsReward: parseInt(newChallenge.pointsReward),
        maxParticipants: newChallenge.maxParticipants ? parseInt(newChallenge.maxParticipants) : null,
        tags: newChallenge.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch(`${API_URL}/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(challengeData)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewChallenge({
          title: '',
          description: '',
          requirements: '',
          pointsReward: 10,
          category: 'daily',
          priority: 'medium',
          endDate: '',
          maxParticipants: '',
          tags: '',
          assignee: ''
        });
        fetchChallenges();
        setError('');
        setSuccess('🎉 Đã tạo thử thách mới thành công!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không thể tạo thử thách');
      }
    } catch (error) {
      setError('Lỗi kết nối server');
      console.error('Error creating challenge:', error);
    }
  };

  const handleJoinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchChallenges();
        setError('');
        setSuccess('🎯 Bạn đã tham gia thử thách thành công!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không thể tham gia thử thách');
      }
    } catch (error) {
      setError('Lỗi kết nối server');
      console.error('Error joining challenge:', error);
    }
  };

  const handleCompleteChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/challenges/${challengeId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchChallenges();
        setShowProgressModal(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không thể hoàn thành thử thách');
      }
    } catch (error) {
      setError('Lỗi kết nối server');
      console.error('Error completing challenge:', error);
    }
  };

  const handleUpdateProgress = async (challengeId, progress) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/challenges/${challengeId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ progress })
      });

      if (response.ok) {
        fetchChallenges();
        setShowProgressModal(false); // Always close modal after successful update
        setError(''); // Clear any existing errors
        if (progress === 100) {
          setSuccess('🎉 Chúc mừng! Bạn đã hoàn thành thử thách và nhận được điểm thưởng!');
        } else {
          setSuccess(`✅ Đã cập nhật tiến độ thành công: ${progress}%`);
        }
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không thể cập nhật tiến độ');
      }
    } catch (error) {
      setError('Lỗi kết nối server');
      console.error('Error updating progress:', error);
    }
  };

  const openProgressModal = (challenge) => {
    setSelectedChallenge(challenge);
    setProgressValue(getUserProgress(challenge));
    setShowProgressModal(true);
  };

  const getChallengeStatus = (challenge) => {
    if (!user || !user._id) return 'not_joined';
    
    const participant = challenge.participants.find(p => {
      const participantUserId = typeof p.user === 'object' ? p.user._id : p.user;
      return participantUserId.toString() === user._id.toString();
    });
    
    if (!participant) return 'not_joined';
    return participant.status;
  };

  const getUserProgress = (challenge) => {
    if (!user || !user._id) return 0;
    
    const participant = challenge.participants.find(p => {
      const participantUserId = typeof p.user === 'object' ? p.user._id : p.user;
      return participantUserId.toString() === user._id.toString();
    });
    
    return participant ? participant.progress : 0;
  };

  // Debug function để kiểm tra trạng thái challenges
  const debugChallengeStatus = () => {
    if (!user) {
      console.log('❌ User chưa đăng nhập');
      return;
    }
    
    console.log('🔍 Debug Challenge Status:');
    console.log(`👤 Current user: ${user.username} (${user._id})`);
    console.log(`📋 Total challenges: ${challenges.length}`);
    
    challenges.forEach(challenge => {
      const status = getChallengeStatus(challenge);
      const progress = getUserProgress(challenge);
      const participant = challenge.participants.find(p => {
        const participantUserId = typeof p.user === 'object' ? p.user._id : p.user;
        return participantUserId.toString() === user._id.toString();
      });
      
      console.log(`\n📌 ${challenge.title}:`);
      console.log(`   Challenge Status: ${challenge.status}`);
      console.log(`   User Status: ${status}`);
      console.log(`   Progress: ${progress}%`);
      if (participant) {
        console.log(`   Participant: ${JSON.stringify(participant, null, 2)}`);
      }
    });
    
    // Hiển thị số lượng theo cột
    columns.forEach(column => {
      const count = getFilteredChallenges(column.status).length;
      console.log(`📊 ${column.title}: ${count} challenges`);
    });
  };

  // Gọi debug khi user và challenges đã load
  useEffect(() => {
    if (user && challenges.length > 0) {
      // Uncomment dòng dưới để debug
      debugChallengeStatus();
    }
  }, [user, challenges]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'highest': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'lowest': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'highest': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      case 'lowest': return '⚪';
      default: return '⚪';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'daily': return '📅';
      case 'weekly': return '📊';
      case 'monthly': return '📈';
      case 'special': return '⭐';
      case 'community': return '👥';
      default: return '📋';
    }
  };

  const getFilteredChallenges = (columnStatus) => {
    return challenges.filter(challenge => {
      // Status filtering based on column
      let statusMatch = false;
      const challengeStatus = getChallengeStatus(challenge);
      
      if (columnStatus === 'draft') {
        statusMatch = challenge.status === 'draft';
      } else if (columnStatus === 'active') {
        statusMatch = challenge.status === 'active' && challengeStatus === 'not_joined';
      } else if (columnStatus === 'joined') {
        statusMatch = challengeStatus === 'joined';
      } else if (columnStatus === 'completed') {
        statusMatch = challengeStatus === 'completed';
      }

      // Apply filters
      const categoryMatch = filter.category === 'all' || challenge.category === filter.category;
      const priorityMatch = filter.priority === 'all' || challenge.priority === filter.priority;

      return statusMatch && categoryMatch && priorityMatch;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thử thách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal styles to ensure proper display */}
      <style>{`
        .modal-overlay {
          backdrop-filter: blur(2px);
          -webkit-backdrop-filter: blur(2px);
          z-index: 60 !important;
        }
        .modal-content {
          transform: translateZ(0);
          will-change: transform;
          position: relative;
          z-index: 61 !important;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
        @media (max-width: 768px) {
          .modal-content {
            margin-top: 2rem;
            margin-bottom: 2rem;
          }
        }
      `}</style>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-blue-600">🎯</span>
              {activeView === 'kanban' ? 'Bảng Thử Thách' : 'Bảng Xếp Hạng'}
            </h1>
            <p className="text-gray-600 text-sm">
              {activeView === 'kanban' ? 'Quản lý thử thách theo phong cách Agile' : 'Top người dùng xuất sắc nhất'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('kanban')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'kanban' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Kanban
              </button>
              <button
                onClick={() => setActiveView('leaderboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'leaderboard' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🏆 Xếp Hạng
              </button>
            </div>

            {user && activeView === 'kanban' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>+</span>
                Tạo Thử Thách
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Danh mục:</label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({...filter, category: e.target.value})}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="daily">Hàng ngày</option>
                <option value="weekly">Hàng tuần</option>
                <option value="monthly">Hàng tháng</option>
                <option value="special">Đặc biệt</option>
                <option value="community">Cộng đồng</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Độ ưu tiên:</label>
              <select
                value={filter.priority}
                onChange={(e) => setFilter({...filter, priority: e.target.value})}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="highest">Cao nhất</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
                <option value="lowest">Thấp nhất</option>
              </select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">
                Tổng: {challenges.length} thử thách
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
            <button 
              onClick={() => setSuccess('')}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Main Content */}
        {activeView === 'kanban' ? (
          /* Kanban Board */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => {
            const columnChallenges = getFilteredChallenges(column.status);
            
            return (
              <div key={column.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Column Header */}
                <div className={`${column.headerColor} px-4 py-3 rounded-t-lg`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">{column.title}</h3>
                    <span className="bg-white text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                      {columnChallenges.length}
                    </span>
                  </div>
                </div>

                {/* Column Content */}
                <div className={`${column.color} min-h-[500px] p-3 space-y-3`}>
                  {columnChallenges.map(challenge => {
                    const userStatus = getChallengeStatus(challenge);
                    const userProgress = getUserProgress(challenge);
                    
                    return (
                      <div
                        key={challenge._id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedChallenge(challenge)}
                      >
                        {/* Challenge Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCategoryIcon(challenge.category)}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(challenge.priority || 'medium')}`}>
                              {getPriorityIcon(challenge.priority || 'medium')}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            #{challenge._id.slice(-6)}
                          </span>
                        </div>

                        {/* Challenge Title */}
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {challenge.title}
                        </h4>

                        {/* Challenge Description */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {challenge.description}
                        </p>

                        {/* Progress Bar (if user joined) */}
                        {userStatus !== 'not_joined' && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>Tiến độ</span>
                              <span>{userProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${userProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Challenge Footer */}
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>👥 {challenge.stats.totalParticipants}</span>
                            <span>🏆 {challenge.pointsReward}</span>
                          </div>
                          <span>📅 {formatDate(challenge.endDate)}</span>
                        </div>

                        {/* Tags */}
                        {challenge.tags && challenge.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {challenge.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                            {challenge.tags.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{challenge.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          {!user ? (
                            <Link 
                              to="/login"
                              className="w-full bg-gray-100 text-gray-600 px-3 py-2 rounded text-center text-sm hover:bg-gray-200 transition-colors block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Đăng nhập
                            </Link>
                          ) : userStatus === 'not_joined' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinChallenge(challenge._id);
                              }}
                              disabled={challenge.status !== 'active'}
                              className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                              Tham gia
                            </button>
                          ) : userStatus === 'joined' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openProgressModal(challenge);
                              }}
                              className="w-full bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 transition-colors"
                            >
                              Cập nhật tiến độ
                            </button>
                          ) : userStatus === 'completed' ? (
                            <div className="w-full bg-green-100 text-green-800 px-3 py-2 rounded text-center text-sm">
                              ✅ Đã hoàn thành
                            </div>
                          ) : (
                            <div className="w-full bg-red-100 text-red-800 px-3 py-2 rounded text-center text-sm">
                              ❌ Thất bại
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty State */}
                  {columnChallenges.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-4xl mb-2">📋</div>
                      <p className="text-sm">Không có thử thách</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        ) : (
          /* Leaderboard */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Leaderboard Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">🏆 Bảng Xếp Hạng</h2>
                <select
                  value={leaderboardPeriod}
                  onChange={(e) => setLeaderboardPeriod(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="month">Tháng này</option>
                  <option value="week">Tuần này</option>
                </select>
              </div>
            </div>

            {/* Leaderboard Content */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dữ liệu xếp hạng</h3>
                  <p className="text-gray-500">Hãy hoàn thành thử thách để xuất hiện trên bảng xếp hạng!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
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
        )}
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallenge && !showProgressModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 pt-20 z-[60] modal-overlay" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={() => setSelectedChallenge(null)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header with Back Button */}
              <div className="flex justify-between items-start mb-6">
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Quay lại</span>
                </button>
                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Challenge Info */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{getCategoryIcon(selectedChallenge.category)}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedChallenge.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">#{selectedChallenge._id.slice(-6)}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(selectedChallenge.priority || 'medium')}`}>
                      {getPriorityIcon(selectedChallenge.priority || 'medium')} 
                      {selectedChallenge.priority || 'medium'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
                  <p className="text-gray-600">{selectedChallenge.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Yêu cầu hoàn thành</h3>
                  <p className="text-gray-600 bg-blue-50 p-3 rounded">{selectedChallenge.requirements}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Điểm thưởng</h4>
                    <p className="text-lg font-bold text-green-600">🏆 {selectedChallenge.pointsReward}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Ngày kết thúc</h4>
                    <p className="text-gray-600">📅 {formatDate(selectedChallenge.endDate)}</p>
                  </div>
                </div>

                {selectedChallenge.tags && selectedChallenge.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedChallenge.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Thống kê</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-xl font-bold text-blue-600">{selectedChallenge.stats.totalParticipants}</div>
                      <div className="text-xs text-blue-600">Tham gia</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-xl font-bold text-green-600">{selectedChallenge.stats.completedCount}</div>
                      <div className="text-xs text-green-600">Hoàn thành</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded">
                      <div className="text-xl font-bold text-purple-600">{selectedChallenge.stats.successRate.toFixed(1)}%</div>
                      <div className="text-xs text-purple-600">Tỷ lệ thành công</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {user && (
                  <div className="flex gap-3 pt-4 border-t">
                    {getChallengeStatus(selectedChallenge) === 'not_joined' && selectedChallenge.status === 'active' && (
                      <button
                        onClick={() => {
                          handleJoinChallenge(selectedChallenge._id);
                          setSelectedChallenge(null);
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Tham gia Thử Thách
                      </button>
                    )}
                    {getChallengeStatus(selectedChallenge) === 'joined' && (
                      <button
                        onClick={() => {
                          setShowProgressModal(true);
                          setProgressValue(getUserProgress(selectedChallenge));
                        }}
                        className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Cập nhật tiến độ
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 pt-20 z-[60] modal-overlay" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header with Back Button */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">Quay lại</span>
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">Tạo Thử Thách Mới</h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateChallenge} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    required
                    value={newChallenge.title}
                    onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tiêu đề thử thách"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={newChallenge.description}
                    onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết về thử thách"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yêu cầu hoàn thành *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newChallenge.requirements}
                    onChange={(e) => setNewChallenge({...newChallenge, requirements: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Điều kiện để hoàn thành thử thách"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại thử thách
                    </label>
                    <select
                      value={newChallenge.category}
                      onChange={(e) => setNewChallenge({...newChallenge, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="daily">📅 Hàng ngày</option>
                      <option value="weekly">📊 Hàng tuần</option>
                      <option value="monthly">📈 Hàng tháng</option>
                      <option value="special">⭐ Đặc biệt</option>
                      <option value="community">👥 Cộng đồng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Độ ưu tiên
                    </label>
                    <select
                      value={newChallenge.priority}
                      onChange={(e) => setNewChallenge({...newChallenge, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="lowest">⚪ Thấp nhất</option>
                      <option value="low">🔵 Thấp</option>
                      <option value="medium">🟡 Trung bình</option>
                      <option value="high">🟠 Cao</option>
                      <option value="highest">🔴 Cao nhất</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điểm thưởng
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newChallenge.pointsReward}
                      onChange={(e) => setNewChallenge({...newChallenge, pointsReward: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày kết thúc *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={newChallenge.endDate}
                      onChange={(e) => setNewChallenge({...newChallenge, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={newChallenge.tags}
                    onChange={(e) => setNewChallenge({...newChallenge, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="fitness, health, daily"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tạo Thử Thách
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {showProgressModal && selectedChallenge && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 pt-20 z-[60] modal-overlay" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={() => setShowProgressModal(false)}
        >
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl border border-gray-200 modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header with Back Button */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowProgressModal(false)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-sm font-medium">Quay lại</span>
                  </button>
                  <h3 className="text-lg font-bold text-gray-900">Cập nhật tiến độ</h3>
                </div>
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Challenge Info */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedChallenge.title}</h4>
                <p className="text-sm text-gray-600">{selectedChallenge.description}</p>
              </div>

              {/* Progress Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Tiến độ hoàn thành</label>
                  <span className="text-lg font-bold text-blue-600">{progressValue}%</span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressValue}
                  onChange={(e) => setProgressValue(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressValue}%, #e5e7eb ${progressValue}%, #e5e7eb 100%)`
                  }}
                />
                
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Progress Bar Visual */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressValue}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProgressModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleUpdateProgress(selectedChallenge._id, progressValue)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {progressValue === 100 ? 'Hoàn thành Thử Thách' : 'Cập nhật tiến độ'}
                </button>
              </div>

              {progressValue === 100 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">🎉</span>
                    <span className="text-sm text-green-800 font-medium">
                      Chúc mừng! Bạn sẽ nhận được {selectedChallenge.pointsReward} điểm khi hoàn thành.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengesKanban;