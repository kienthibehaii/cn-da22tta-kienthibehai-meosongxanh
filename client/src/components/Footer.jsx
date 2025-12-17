import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Cột 1: Thông tin chung */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">🌿</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">EcoLife</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Nền tảng kết nối cộng đồng yêu môi trường. Cùng nhau chia sẻ kiến thức, lan tỏa lối sống xanh và bảo vệ hành tinh của chúng ta.
            </p>
            <div className="flex gap-4">
              {/* Social Icons (SVG) */}
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-white transition-all duration-300">
                <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all duration-300">
                <svg fill="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all duration-300">
                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="w-5 h-5" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01"></path></svg>
              </a>
            </div>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div>
            <h3 className="text-gray-800 font-bold mb-6 text-lg">Khám phá</h3>
            <ul className="space-y-4 text-gray-500">
              <li><Link to="/news" className="hover:text-emerald-600 transition-colors flex items-center gap-2"><span>newspaper</span> Tin tức môi trường</Link></li>
              <li><Link to="/articles" className="hover:text-emerald-600 transition-colors flex items-center gap-2"><span>book</span> Kiến thức xanh</Link></li>
              <li><Link to="/forum" className="hover:text-emerald-600 transition-colors flex items-center gap-2"><span>chat</span> Diễn đàn thảo luận</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-600 transition-colors flex items-center gap-2"><span>user</span> Hồ sơ cá nhân</Link></li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div>
            <h3 className="text-gray-800 font-bold mb-6 text-lg">Hỗ trợ</h3>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-emerald-600 transition-colors">Báo cáo vi phạm</a></li>
            </ul>
          </div>

          {/* Cột 4: Liên hệ */}
          <div>
            <h3 className="text-gray-800 font-bold mb-6 text-lg">Liên hệ</h3>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-emerald-600 mt-1">📍</span>
                <span>Tòa nhà Innovation, Khu Công Nghệ Cao, TP. Thủ Đức, Việt Nam</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-600">📧</span>
                <a href="mailto:contact@ecolife.vn" className="hover:text-emerald-600">contact@ecolife.vn</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-emerald-600">📞</span>
                <a href="tel:+84901234567" className="hover:text-emerald-600">(+84) 90 123 4567</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Dòng bản quyền dưới cùng */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} EcoLife Project. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-emerald-600">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;