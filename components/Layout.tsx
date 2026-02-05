
import React from 'react';
import { User, UserRole } from '../types';

interface LayoutProps {
  user: User | null;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: 'home' | 'history' | 'admin' | 'stats';
  setActiveTab: (tab: 'home' | 'history' | 'admin' | 'stats') => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-orange-500 flex items-center gap-2">
            <span className="text-3xl">🍲</span> VietFood AI
          </h1>
          <p className="text-slate-400 text-xs mt-1">Hệ thống sinh mô tả món ăn</p>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'home' ? 'bg-orange-500 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <span>📸</span> Scan Món Ăn
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'history' ? 'bg-orange-500 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <span>📜</span> Lịch sử
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'stats' ? 'bg-orange-500 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <span>📊</span> Thống kê
          </button>
          {user?.role === UserRole.ADMIN && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition ${activeTab === 'admin' ? 'bg-orange-500 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              <span>🔑</span> Quản trị
            </button>
          )}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              {user?.username[0].toUpperCase()}
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full mt-2 text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-950/30 text-sm transition"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
