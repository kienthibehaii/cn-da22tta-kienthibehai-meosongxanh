const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

// --- 1. TẠO BÀI VIẾT (QUAN TRỌNG NHẤT) ---
exports.createPost = async (req, res) => {
  try {
    const { title, content, type, selectedId, category } = req.body;
    
    const imagePath = req.file ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}` : null;
    
    // --- LOGIC TRẠNG THÁI ---
    let status = 'pending';
    if (req.userRole === 'admin') {
        status = 'approved';
    } else {
        // Diễn đàn lên luôn, Bài viết (article) phải chờ
        status = (type === 'forum') ? 'approved' : 'pending';
    }

    // --- FIX LỖI "Cast to ObjectId failed" ---
    // Nếu selectedId là chuỗi rỗng "", ta gán null
    const validSelectedId = selectedId && selectedId !== "" ? selectedId : null;

    const newPost = new Post({
      title,
      content,
      type,
      status,
      image: imagePath,
      author: req.userId,
      category: category || 'Chung', // Text hiển thị
      
      // Lưu đúng trường dữ liệu
      forumTopic: (type === 'forum') ? validSelectedId : null,
      newsCategory: (type !== 'forum') ? validSelectedId : null 
    });

    await newPost.save();
    res.json(newPost);

  } catch (e) { 
    console.error("Lỗi tạo bài:", e);
    res.status(500).json({ message: "Lỗi: " + e.message }); 
  }
};

// --- 2. LẤY DANH SÁCH BÀI VIẾT ---
exports.getPosts = async (req, res) => {
  try {
    const { type, status, category, topic, search } = req.query;
    let query = {};
    
    // Lọc theo trạng thái và loại
    if (status) query.status = status; else query.status = 'approved';
    if (type) query.type = type;
    
    // --- SỬA LỖI BỘ LỌC ---
    // Nếu là Tin tức/Bài viết -> Lọc theo ID danh mục (newsCategory)
    if (category) query.newsCategory = category;
    
    // Nếu là Diễn đàn -> Lọc theo Tên chủ đề (forumTopic)
    if (topic) query.forumTopic = topic;
    // ----------------------

    if (search) {
        query.title = { $regex: search, $options: 'i' };
    }
  
    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar')
      .populate('newsCategory', 'name') // Populate tên danh mục nếu cần
      .sort({ isPinned: -1, createdAt: -1 });
      
    res.json(posts);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// --- 3. CÁC HÀM PHỤ TRỢ (Like, Comment, Detail...) ---
// Bạn CẦN PHẢI GIỮ các hàm này để không bị lỗi thiếu hàm
exports.getTopPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'approved' }).sort({ views: -1 }).limit(3).populate('author', 'fullName avatar');
    res.json(posts);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.getPostDetail = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).populate('author', 'fullName avatar');
    const comments = await Comment.find({ post: req.params.id }).populate('user', 'fullName avatar').sort({ createdAt: 1 });
    res.json({ post, comments });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.addComment = async (req, res) => {
  try {
    const newComment = new Comment({ user: req.userId, post: req.params.id, content: req.body.content, parentComment: req.body.parentComment });
    await newComment.save();
    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
    res.json(newComment);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const index = post.likes.indexOf(req.userId);
        if (index === -1) post.likes.push(req.userId); else post.likes.splice(index, 1);
        await post.save();
        res.json(post.likes);
    } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.savePost = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const index = user.savedPosts.indexOf(req.params.id);
    if (index === -1) user.savedPosts.push(req.params.id); else user.savedPosts.splice(index, 1);
    await user.save();
    res.json(user.savedPosts);
  } catch (e) { res.status(500).json({ message: e.message }); }
};

exports.reportPost = async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $addToSet: { reports: req.userId } });
    res.json({ message: "Đã báo cáo!" });
  } catch (e) { res.status(500).json({ message: e.message }); }
};

// Các hàm cho Admin (Update, Delete, Comment Action)
exports.updatePost = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) updateData.image = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        const updated = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch(e) { res.status(500).json({message: e.message}); }
};

exports.deletePost = async (req, res) => {
    try { await Post.findByIdAndDelete(req.params.id); res.json({message: "Deleted"}); } catch(e) { res.status(500).json({message: e.message}); }
};

exports.deleteComment = async (req, res) => { try { await Comment.findByIdAndDelete(req.params.id); res.json({message:"Deleted"}); } catch(e){} };
exports.likeComment = async (req, res) => { /* Logic like comment */ res.json({message:"Liked"}); };
exports.reportComment = async (req, res) => { /* Logic report comment */ res.json({message:"Reported"}); };