const User = require('../models/User');
const Post = require('../models/Post');
const Topic = require('../models/Topic');

// 1. Thống kê Dashboard
exports.getStats = async (req, res) => {
  if (req.userRole !== 'admin' && req.userRole !== 'super_admin') return res.status(403).send('Access Denied');
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    
    const viewsData = await Post.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]);
    const totalViews = viewsData[0]?.total || 0;

    // Đếm tổng số comments (giả sử có field comments trong Post)
    const commentsData = await Post.aggregate([
      { $project: { commentCount: { $size: { $ifNull: ["$comments", []] } } } },
      { $group: { _id: null, total: { $sum: "$commentCount" } } }
    ]);
    const totalComments = commentsData[0]?.total || 0;

    // Dữ liệu biểu đồ: Gom nhóm theo Category
    const chartData = await Post.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Thống kê theo loại bài viết
    const postTypeStats = await Post.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);

    // Thống kê người dùng mới trong 7 ngày qua
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    // Thống kê bài viết mới trong 7 ngày qua
    const newPostsThisWeek = await Post.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    res.json({ 
      totalUsers, 
      totalPosts, 
      totalViews, 
      totalComments,
      chartData,
      postTypeStats,
      newUsersThisWeek,
      newPostsThisWeek
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// 2. Lấy bài viết bị báo cáo (FIX LỖI KHÔNG HIỆN)
exports.getReportedPosts = async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).send('Access Denied');
  try {
    // Tìm bài viết mà mảng reports tồn tại và độ dài lớn hơn 0
    const reportedPosts = await Post.find({ 
        reports: { $exists: true, $not: { $size: 0 } } 
    }).populate('author', 'username fullName');
    
    res.json(reportedPosts);
  } catch (e) { res.status(500).json({ message: e.message }); }
};
// --- 1. QUẢN LÝ NGƯỜI DÙNG ---
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ role: 1 });
        res.json(users);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        await User.findByIdAndUpdate(req.params.id, { role });
        res.json({ message: "Đã cập nhật quyền hạn" });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.toggleBanUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        user.isBanned = !user.isBanned; // Đảo ngược trạng thái
        await user.save();
        res.json({ message: user.isBanned ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản" });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// --- 2. QUẢN LÝ CHỦ ĐỀ (TOPICS) ---
exports.getTopics = async (req, res) => {
    try {
        const topics = await Topic.find();
        res.json(topics);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.createTopic = async (req, res) => {
    try {
        const newTopic = new Topic({ name: req.body.name });
        await newTopic.save();
        res.json(newTopic);
    } catch (e) { res.status(500).json({ message: "Chủ đề đã tồn tại hoặc lỗi server" }); }
};

exports.deleteTopic = async (req, res) => {
    try {
        await Topic.findByIdAndDelete(req.params.id);
        res.json({ message: "Đã xóa chủ đề" });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// --- 3. QUẢN LÝ BÁO CÁO (AN TOÀN) ---
exports.dismissReport = async (req, res) => {
    try {
        // Xóa danh sách người report, giữ lại bài viết
        await Post.findByIdAndUpdate(req.params.id, { reports: [] });
        res.json({ message: "Đã xác nhận bài viết an toàn" });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// --- 4. LẤY BÀI VIẾT THEO LOẠI ---
exports.getPostsByType = async (req, res) => {
    try {
        const { type } = req.query; // 'forum', 'news', 'article'
        const posts = await Post.find({ type }).populate('author', 'username fullName').sort({ createdAt: -1 });
        res.json(posts);
    } catch (e) { res.status(500).json({ message: e.message }); }
};
// 2. Lấy danh sách TẤT CẢ người dùng
exports.getAllUsers = async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).send('Access Denied');
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// 3. Xóa người dùng
exports.deleteUser = async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).send('Access Denied');
    try {
        await User.findByIdAndDelete(req.params.id);
        // Xóa luôn bài viết của user đó để sạch database
        await Post.deleteMany({ author: req.params.id });
        res.json({ message: "Đã xóa người dùng và các bài viết liên quan" });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

// 4. Lấy TẤT CẢ bài viết (Cho quản lý bài viết)
exports.getAllPostsAdmin = async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).send('Access Denied');
    try {
        const posts = await Post.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (e) { res.status(500).json({ message: e.message }); }
};
exports.getAllUsers = async (req, res) => {
    try { const users = await User.find().select('-password').sort({ createdAt: -1 }); res.json(users); } 
    catch (e) { res.status(500).json({ message: e.message }); }
};
// ... (Giữ lại các hàm cũ như getReportedPosts, approvePost nếu cần) ...
// Để code gọn, bạn hãy giữ lại hàm getReportedPosts và approvePost ở phiên bản trước vào đây nhé.
exports.getReportedPosts = async (req, res) => {
  if (req.userRole !== 'admin') return res.status(403).send('Access Denied');
  try {
    // Lấy bài viết có mảng reports độ dài lớn hơn 0
    const reportedPosts = await Post.find({ reports: { $exists: true, $not: { $size: 0 } } })
                                    .populate('author', 'username fullName');
    res.json(reportedPosts);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// --- MỚI: Ghim bài viết (Featured) ---
exports.togglePinPost = async (req, res) => {
    if (req.userRole !== 'admin') return res.status(403).send('Access Denied');
    try {
        const post = await Post.findById(req.params.id);
        post.isPinned = !post.isPinned; // Đảo ngược trạng thái ghim
        await post.save();
        res.json({ message: post.isPinned ? "Đã ghim bài viết" : "Đã bỏ ghim", isPinned: post.isPinned });
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.approvePost = async (req, res) => { 
    await Post.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.json({ message: "Approved" });
};