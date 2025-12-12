import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Hook quan trọng để biết trang trước đó
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  
  // State cho comment
  const [replyTo, setReplyTo] = useState(null); // ID của comment đang được trả lời
  const [inputContent, setInputContent] = useState('');
  const inputRef = useRef(null);

  const token = localStorage.getItem('token');
  const currentUser = localStorage.getItem('user_info') 
    ? JSON.parse(localStorage.getItem('user_info')) 
    : null;
    
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  
  // Kiểm tra xem người dùng có phải đến từ trang Admin Dashboard hay không
  const isFromAdmin = location.state?.from === '/admin';

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
      setPost(res.data.post);
      setComments(res.data.comments);
    } catch (err) { console.error("Lỗi tải bài viết:", err); }
  };

  // --- 1. XỬ LÝ NÚT QUAY LẠI (THÔNG MINH) ---
  const handleBack = () => {
      // Nếu đến từ Admin -> Về Admin (giữ tab cũ nếu có)
      if (isFromAdmin) {
          navigate('/admin', { state: { tab: location.state.tab } });
          return;
      }
      
      // Nếu đến từ Hồ sơ -> Về Hồ sơ
      if (location.state?.from === '/profile') {
          navigate('/profile');
          return;
      }

      // Mặc định: Dựa vào loại bài để về trang danh sách tương ứng
      if (post) {
          if (post.type === 'news') navigate('/news');
          else if (post.type === 'article') navigate('/articles');
          else navigate('/forum');
      } else {
          navigate(-1); // Fallback về trang trước trong lịch sử
      }
  };

  // --- 2. HÀM QUẢN TRỊ (ADMIN/OWNER) ---
  const handleApprove = async () => {
      try {
          await axios.put(`http://localhost:5000/api/admin/posts/${id}/approve`, {}, {headers:{Authorization:token}});
          alert("✅ Đã duyệt bài viết!");
          fetchDetail();
      } catch(e) { alert("Lỗi khi duyệt bài"); }
  };

  const handleDelete = async () => {
      const confirmMsg = isAdmin 
        ? "⚠️ ADMIN: Xóa vĩnh viễn bài này?" 
        : "Bạn chắc chắn muốn xóa bài này?";
      
      if(!confirm(confirmMsg)) return;

      try {
          await axios.delete(`http://localhost:5000/api/posts/${id}`, {headers:{Authorization:token}});
          alert("🗑️ Đã xóa bài viết.");
          // Xóa xong thì quay lại đúng nơi đã đến
          handleBack(); 
      } catch(e) { alert("Lỗi khi xóa bài"); }
  };

  // --- 3. TƯƠNG TÁC BÀI VIẾT ---
  const handleAction = async (action) => {
    if(!token) return alert("Vui lòng đăng nhập!");
    try {
        const url = action === 'like' ? 'like' : 'save';
        await axios.put(`http://localhost:5000/api/posts/${id}/${url}`, {}, {headers:{Authorization:token}});
        fetchDetail();
        if(action === 'save') alert("✅ Đã cập nhật danh sách đã lưu!");
    } catch(e) { alert("Lỗi kết nối"); }
  };

  // --- 4. XỬ LÝ BÌNH LUẬN ---
  const submitComment = async () => {
    if (!token) return alert("Vui lòng đăng nhập!");
    if (!inputContent.trim()) return;

    try {
        await axios.post(`http://localhost:5000/api/posts/${id}/comments`, 
            { content: inputContent, parentComment: replyTo }, 
            { headers: { Authorization: token } }
        );
        setInputContent('');
        setReplyTo(null);
        fetchDetail();
    } catch (e) { alert("Lỗi gửi bình luận"); }
  };

  const handleReplyClick = (commentId, username) => {
      setReplyTo(commentId);
      setInputContent(`@${username} `);
      inputRef.current?.focus(); // Cuộn lên ô nhập liệu
  };

  const handleCommentAction = async (commentId, action) => {
      if(!token) return alert("Cần đăng nhập!");
      try {
          if (action === 'delete') {
              if(!confirm("Xóa bình luận này?")) return;
              await axios.delete(`http://localhost:5000/api/posts/comments/${commentId}`, {headers:{Authorization:token}});
          } else if (action === 'like') {
              await axios.put(`http://localhost:5000/api/posts/comments/${commentId}/like`, {}, {headers:{Authorization:token}});
          } else if (action === 'report') {
              if(!confirm("Báo cáo bình luận này?")) return;
              await axios.put(`http://localhost:5000/api/posts/comments/${commentId}/report`, {}, {headers:{Authorization:token}});
              alert("Đã gửi báo cáo!"); return; 
          }
          fetchDetail(); 
      } catch(e) { alert("Lỗi thao tác"); }
  };

  // --- 5. COMPONENT ĐỆ QUY HIỂN THỊ BÌNH LUẬN ---
  // Component này giúp hiển thị comment con, cháu, chắt... vô tận
  const CommentItem = ({ comment, allComments, level = 0 }) => {
      // Tìm các con của comment này
      const childComments = allComments.filter(c => c.parentComment === comment._id);
      const isLiked = comment.likes?.includes(currentUser?.id);

      return (
          <div style={{
              marginLeft: level > 0 ? '40px' : '0', 
              marginTop: '15px', 
              borderLeft: level > 0 ? '3px solid #e5e7eb' : 'none', 
              paddingLeft: level > 0 ? '15px' : '0'
          }}>
              <div style={{background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #f3f4f6'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                      <Link to={`/profile/${comment.user?._id}`} style={{color: '#10b981', fontWeight:'bold', textDecoration:'none'}}>
                          {comment.user?.fullName}
                      </Link>
                      <small style={{color:'#9ca3af'}}>{new Date(comment.createdAt).toLocaleDateString()}</small>
                  </div>
                  
                  <p style={{margin: '8px 0', color:'#374151', lineHeight:'1.5'}}>{comment.content}</p>
                  
                  {/* Action Bar của Comment */}
                  <div style={{fontSize:'0.85rem', display:'flex', gap:'15px', color:'#6b7280'}}>
                      <button onClick={() => handleReplyClick(comment._id, comment.user?.fullName)} style={{background:'none', border:'none', color:'#3b82f6', cursor:'pointer', padding:0, fontWeight:'600'}}>Trả lời</button>
                      
                      <button onClick={()=>handleCommentAction(comment._id, 'like')} style={{background:'none', border:'none', cursor:'pointer', padding:0, color: isLiked ? '#ef4444' : 'inherit'}}>
                          ❤️ {comment.likes?.length || 0}
                      </button>

                      <button onClick={()=>handleCommentAction(comment._id, 'report')} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer', padding:0}}>Báo cáo</button>
                      
                      {/* Chỉ hiện nút xóa nếu là Admin từ trang Admin */}
                      {isAdmin && isFromAdmin && (
                          <button onClick={()=>handleCommentAction(comment._id, 'delete')} style={{background:'none', border:'none', color:'red', cursor:'pointer', padding:0, fontWeight:'bold'}}>Xóa</button>
                      )}
                  </div>
              </div>

              {/* Đệ quy: Gọi lại chính nó để render con */}
              {childComments.map(child => (
                  <CommentItem key={child._id} comment={child} allComments={allComments} level={level + 1} />
              ))}
          </div>
      );
  };

  if (!post) return <div style={{padding:'40px', textAlign:'center', color:'#666'}}>⏳ Đang tải bài viết...</div>;
  
  const isOwner = currentUser?.id === post.author?._id;
  const safeLikes = post.likes || [];
  const isLiked = currentUser && safeLikes.includes(currentUser?.id);

  // Điều kiện hiện thanh quản trị:
  // 1. Là Tác giả bài viết
  // 2. HOẶC là Admin ĐANG TRUY CẬP TỪ TRANG ADMIN (isFromAdmin = true)
  const showAdminToolbar = isOwner || (isAdmin && isFromAdmin);

  return (
    <div className="post-detail-page" style={{maxWidth: '900px', margin: '30px auto', padding: '0 20px'}}>
      
      {/* NÚT QUAY LẠI */}
      <button onClick={handleBack} style={{marginBottom:'20px', background:'#f3f4f6', color:'#374151', border:'1px solid #d1d5db', padding:'8px 16px', borderRadius:'6px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontWeight:'600', transition:'all 0.2s'}}>
          ⬅️ Quay lại {isFromAdmin ? 'Quản Trị' : (location.state?.from === '/profile' ? 'Hồ Sơ' : 'Danh Sách')}
      </button>

      {/* THANH CÔNG CỤ QUẢN TRỊ (Hiển thị theo ngữ cảnh) */}
      {showAdminToolbar && (
          <div style={{background: '#fff7ed', border: '1px solid #fdba74', padding: '15px', borderRadius: '8px', marginBottom: '25px', display: 'flex', justifyContent:'space-between', alignItems:'center'}}>
              <strong style={{color:'#c2410c'}}>⚙️ Chế độ: {isOwner ? "Tác giả" : "Quản trị viên"}</strong>
              <div style={{display:'flex', gap:'10px'}}>
                  {isAdmin && post.status === 'pending' && (
                      <button onClick={handleApprove} style={{background:'#16a34a', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>✅ Duyệt Ngay</button>
                  )}
                  <Link to={`/edit-post/${post._id}`} style={{background:'#2563eb', color:'white', padding:'8px 15px', borderRadius:'5px', textDecoration:'none', fontWeight:'bold'}}>✏️ Sửa bài</Link>
                  <button onClick={handleDelete} style={{background:'#dc2626', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>🗑️ Xóa bài</button>
              </div>
          </div>
      )}

      {/* NỘI DUNG CHÍNH */}
      <div className="detail-card" style={{background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'}}>
        
        {/* Category Badge & Status */}
        <div style={{marginBottom:'20px', display:'flex', gap:'10px', alignItems:'center'}}>
            <span style={{background:'#dcfce7', color:'#166534', padding:'4px 12px', borderRadius:'20px', fontSize:'0.85rem', fontWeight:'bold', textTransform:'uppercase'}}>
                {post.category || post.forumTopic || 'Chung'}
            </span>
            {post.status === 'pending' && <span style={{background:'#fef3c7', color:'#d97706', padding:'4px 10px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'bold'}}>⚠️ Chờ duyệt</span>}
            {post.reports && post.reports.length > 0 && <span style={{background:'#fee2e2', color:'red', padding:'4px 10px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'bold'}}>🚩 Bị báo cáo ({post.reports.length})</span>}
        </div>

        <h1 style={{color: '#111827', marginTop: 0, fontSize:'2rem', lineHeight:'1.3'}}>{post.title}</h1>
        
        <div style={{color: '#6b7280', marginBottom: '25px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid #eee', paddingBottom:'20px'}}>
            <img src={post.author?.avatar || "https://via.placeholder.com/40"} style={{width:'45px', height:'45px', borderRadius:'50%', objectFit:'cover'}} />
            <div>
                <Link to={`/profile/${post.author?._id}`} style={{fontWeight:'bold', color: '#374151', textDecoration:'none', fontSize:'1rem'}}>
                    {post.author?.fullName}
                </Link>
                <div style={{fontSize:'0.9rem', marginTop:'2px'}}>
                    {new Date(post.createdAt).toLocaleDateString('vi-VN')} • 👁️ {post.views} lượt xem
                </div>
            </div>
        </div>
        
        {post.image && <img src={post.image} style={{width: '100%', borderRadius: '10px', marginBottom: '30px', maxHeight:'500px', objectFit:'cover'}} alt="Cover" />}
        
        {/* Render HTML Content */}
        <div className="content-body" style={{lineHeight: '1.8', fontSize: '1.1rem', color:'#374151', wordWrap:'break-word'}}>
             <div dangerouslySetInnerHTML={{__html: post.content.replace(/\n/g, '<br/>')}} />
        </div>

        {/* Action Bar */}
        <div style={{marginTop: '40px', borderTop: '1px solid #e5e7eb', paddingTop: '20px', display: 'flex', gap: '20px', alignItems:'center'}}>
            <button onClick={()=>handleAction('like')} style={{background: isLiked ? '#ffe4e6' : '#f3f4f6', border:'none', borderRadius:'30px', padding:'10px 20px', cursor:'pointer', fontSize:'1rem', color: isLiked ? '#e11d48' : '#374151', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s'}}>
                {isLiked ? '❤️' : '🤍'} <b>{safeLikes.length}</b> Thích
            </button>
            <span style={{color:'#6b7280', fontSize:'1rem'}}>💬 <b>{comments.length}</b> Bình luận</span>
            <button onClick={()=>handleAction('save')} style={{marginLeft:'auto', background:'#f3f4f6', border:'none', padding:'10px 20px', borderRadius:'30px', cursor:'pointer', color:'#374151', fontWeight:'600'}}>
                💾 Lưu bài
            </button>
        </div>
      </div>

      {/* KHU VỰC BÌNH LUẬN */}
      <div className="comments-section" style={{marginTop: '40px'}}>
        <h3 style={{fontSize:'1.5rem', marginBottom:'20px'}}>💬 Bình luận</h3>
        
        {/* Form nhập liệu */}
        <div className="comment-box" style={{background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
            {replyTo && <div style={{fontSize:'0.9rem', color:'#666', marginBottom:'10px', background:'#f3f4f6', padding:'8px 12px', borderRadius:'6px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>Đang trả lời...</span> 
                <button onClick={()=>{setReplyTo(null); setInputContent('');}} style={{border:'none', background:'none', color:'#ef4444', cursor:'pointer', fontWeight:'bold'}}>✕ Hủy</button>
            </div>}
            
            <textarea 
                ref={inputRef}
                value={inputContent} 
                onChange={e=>setInputContent(e.target.value)} 
                placeholder="Chia sẻ ý kiến của bạn..." 
                style={{width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight:'100px', fontSize:'1rem', resize:'vertical'}}
            />
            <div style={{textAlign:'right', marginTop:'10px'}}>
                <button onClick={submitComment} style={{background: '#3b82f6', color: 'white', padding: '10px 25px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold', fontSize:'1rem', transition:'background 0.2s'}}>Gửi Bình Luận</button>
            </div>
        </div>

        {/* Danh sách bình luận (Sử dụng Component Đệ Quy) */}
        <div className="comments-list">
            {comments.length === 0 ? <p style={{textAlign:'center', color:'#9ca3af'}}>Chưa có bình luận nào. Hãy là người đầu tiên!</p> : null}
            
            {/* Lọc comment gốc (không có cha) để bắt đầu render */}
            {comments.filter(c => !c.parentComment).map(c => (
                <CommentItem key={c._id} comment={c} allComments={comments} />
            ))}
        </div>
      </div>
    </div>
  );
};
export default PostDetail;