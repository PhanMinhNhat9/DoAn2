import React from 'react';
import { AlertCircle, ChefHat, LogIn, UserPlus } from 'lucide-react';

interface AuthFormProps {
  isRegistering: boolean;
  setIsRegistering: (val: boolean) => void;
  authError: string;
  setAuthError: (val: string) => void;
  loginForm: { username: string; password: string };
  setLoginForm: (val: any) => void;
  handleAuth: (e: React.FormEvent) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  isRegistering,
  setIsRegistering,
  authError,
  setAuthError,
  loginForm,
  setLoginForm,
  handleAuth
}) => {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-orange-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-600 p-4 rounded-2xl text-white mb-4 shadow-lg shadow-orange-200">
            <ChefHat size={48} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">VietFood</h1>
          <p className="text-slate-500 mt-2">Khám phá ẩm thực Việt</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button 
            onClick={() => { setIsRegistering(false); setAuthError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${!isRegistering ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LogIn size={18} /> Đăng Nhập
          </button>
          <button 
            onClick={() => { setIsRegistering(true); setAuthError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${isRegistering ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <UserPlus size={18} /> Đăng Ký
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {authError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              <span>{authError}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tên đăng nhập</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-300"
              placeholder={isRegistering ? "Tên bạn muốn dùng" : "Nhập tên đăng nhập"}
              value={loginForm.username}
              onChange={e => setLoginForm({...loginForm, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-300"
              placeholder="Nhập mật khẩu"
              value={loginForm.password}
              onChange={e => setLoginForm({...loginForm, password: e.target.value})}
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 mt-2"
          >
            {isRegistering ? 'Tạo Tài Khoản' : 'Vào Ứng Dụng'}
          </button>
        </form>
      </div>
    </div>
  );
};
