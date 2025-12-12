const User = require('../models/User');
const Post = require('../models/Post');

// Lấy hồ sơ (SỬA LỖI KHÔNG HIỆN BÀI ĐÃ LƯU)
exports.getProfile = async (req, res) => {
  try {
    let targetId = req.userId;
    if (req.params.id && req.userRole === 'admin') {
        targetId = req.params.id;
    }

    const user = await User.findById(targetId).populate('savedPosts');
    if (!user) return res.status(404).json({ message: "User not found" });

    // --- FIX LỖI MÀN HÌNH TRẮNG ---
    // Lọc bỏ những bài viết đã bị xóa (null) khỏi danh sách đã lưu
    const validSavedPosts = (user.savedPosts || []).filter(post => post !== null);

    const myPosts = await Post.find({ author: targetId }).sort({ createdAt: -1 });
    const likedPosts = await Post.find({ likes: targetId }).sort({ createdAt: -1 });

    const totalViews = myPosts.reduce((acc, curr) => acc + curr.views, 0);
    const totalLikesReceived = myPosts.reduce((acc, curr) => acc + curr.likes.length, 0);

    const postsData = {
      approved: myPosts.filter(p => p.status === 'approved'),
      pending: myPosts.filter(p => p.status === 'pending'),
      saved: validSavedPosts, // Dùng danh sách đã lọc sạch
      liked: likedPosts
    };

    const userInfo = user.toObject();
    delete userInfo.password;

    res.json({
      user: userInfo,
      stats: { views: totalViews, likesReceived: totalLikesReceived, postCount: myPosts.length },
      posts: postsData
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Cập nhật hồ sơ
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, email } = req.body;
    const updateData = { fullName, bio, email };
    if (req.file) {
      updateData.avatar = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }
    const updatedUser = await User.findByIdAndUpdate(req.userId, updateData, { new: true });
    res.json(updatedUser);
  } catch (e) { res.status(500).json({ message: e.message }); }
};