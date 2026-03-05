
import React, { useState } from 'react';
import { 
  Lock, 
  Sparkles as AutoAwesome, 
  Utensils as RestaurantMenu,
  CheckCircle,
  ArrowRight as ArrowForward
} from 'lucide-react';
import { User } from '../types';

const API_BASE_URL = 'http://localhost/DoAn2/api';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? 'login.php' : 'register.php';
      const body = isLogin 
        ? { username, password } 
        : { username, password, handle: handle || `@${username}` };

      const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        if (isLogin) {
          onLogin(data.user);
        } else {
          setIsLogin(true);
          setError('Tài khoản đã được tạo! Vui lòng đăng nhập.');
        }
      } else {
        setError(data.message || 'Đã xảy ra lỗi');
      }
    } catch (err) {
      setError('Lỗi kết nối. XAMPP đã chạy chưa?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-screen bg-slate-50 dark:bg-background-dark">
      {/* Branding Section */}
      <div className="lg:w-1/2 bg-primary relative overflow-hidden flex flex-col p-12 lg:p-24 justify-between text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
            <RestaurantMenu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">VietFood AI</h1>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
            Câu Chuyện <br />
            <span className="text-white/60 italic font-medium">Ẩm Thực Thông Minh.</span>
          </h2>
          <p className="text-xl lg:text-2xl text-white/80 max-w-md font-medium leading-relaxed">
            Cộng đồng chia sẻ trải nghiệm ẩm thực Việt Nam với sự hỗ trợ từ công nghệ Gemini AI.
          </p>
          <div className="flex flex-col gap-4 pt-8">
            {[
              "Tự động tạo mô tả bằng AI",
              "Kết nối với những người sành ăn",
              "Lưu giữ công thức nấu ăn yêu thích",
              "Theo dõi sức ảnh hưởng ẩm thực của bạn"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 font-bold text-white/90">
                <div className="bg-white/20 p-1 rounded-full"><CheckCircle className="w-5 h-5" /></div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm font-bold opacity-60">
          <span>© 2024 Nền tảng VietFood AI</span>
          <span className="w-1 h-1 bg-white rounded-full"></span>
          <span>Điều khoản</span>
          <span className="w-1 h-1 bg-white rounded-full"></span>
          <span>Bảo mật</span>
        </div>
      </div>

      {/* Form Section */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white dark:bg-background-dark">
        <div className="w-full max-w-md space-y-10">
          <div className="space-y-2">
            <h3 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isLogin ? 'Chào mừng trở lại' : 'Gia nhập Cộng đồng'}
            </h3>
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Nhập thông tin để khám phá thế giới ẩm thực.' : 'Bắt đầu hành trình khám phá ẩm thực Việt ngay hôm nay.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Tên người dùng</label>
                <input 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-100 dark:bg-surface-dark border-none rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white transition-all font-medium" 
                  placeholder="name@example.com"
                />
              </div>
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Định danh công khai</label>
                  <input 
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-100 dark:bg-surface-dark border-none rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white transition-all font-medium" 
                    placeholder="@username"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Mật khẩu</label>
                  {isLogin && <button type="button" className="text-xs font-bold text-primary hover:underline">Quên mật khẩu?</button>}
                </div>
                <input 
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-100 dark:bg-surface-dark border-none rounded-2xl focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white transition-all font-medium" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold rounded-2xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></div>
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-5 bg-slate-900 dark:bg-primary text-white font-bold rounded-2xl shadow-xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              <Lock className="w-5 h-5 group-hover:animate-bounce" />
              <span>{loading ? 'Đang xử lý...' : (isLogin ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản')}</span>
              {!loading && <ArrowForward className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="flex flex-col gap-6 items-center">
             <div className="flex items-center gap-4 w-full text-slate-300">
                <div className="h-[1px] bg-slate-200 dark:bg-white/10 flex-1"></div>
                <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Hoặc thử chế độ Demo</span>
                <div className="h-[1px] bg-slate-200 dark:bg-white/10 flex-1"></div>
             </div>
             
             <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-slate-500 font-bold transition-colors hover:text-primary flex items-center gap-2"
              >
                {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
                <span className="text-primary font-black underline decoration-2 underline-offset-4">
                  {isLogin ? 'Đăng ký Miễn phí' : 'Đăng nhập'}
                </span>
              </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default LoginPage;
