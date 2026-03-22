import React from 'react';
import { ChefHat, History, LogOut, ScanLine, Share2, Shield } from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 md:top-0 md:bottom-auto md:border-t-0 md:border-b z-50">
      <div className="max-w-5xl mx-auto px-6 h-20 md:h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-600 font-bold text-xl md:text-2xl hidden md:flex">
          <ChefHat size={28} />
          <span>VietFood</span>
        </div>
        
        <div className="flex justify-between w-full md:w-auto md:gap-8 lg:gap-12 px-4 md:px-0">
          <button 
            onClick={() => setActiveTab('scan')}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${activeTab === 'scan' ? 'text-orange-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ScanLine size={24} strokeWidth={activeTab === 'scan' ? 2.5 : 2} />
            <span className="text-[10px] md:text-xs font-bold tracking-wide">Quét</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${activeTab === 'history' ? 'text-orange-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <History size={24} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
            <span className="text-[10px] md:text-xs font-bold tracking-wide">Lịch sử</span>
          </button>

          <button 
            onClick={() => setActiveTab('community')}
            className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${activeTab === 'community' ? 'text-orange-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Share2 size={24} strokeWidth={activeTab === 'community' ? 2.5 : 2} />
            <span className="text-[10px] md:text-xs font-bold tracking-wide">Cộng đồng</span>
          </button>

          {user?.role === UserRole.ADMIN && (
            <button 
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center gap-1.5 p-2 transition-all duration-300 ${activeTab === 'admin' ? 'text-orange-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Shield size={24} strokeWidth={activeTab === 'admin' ? 2.5 : 2} />
              <span className="text-[10px] md:text-xs font-bold tracking-wide">Quản trị</span>
            </button>
          )}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{user?.username || 'Khách'}</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{user?.role === UserRole.ADMIN ? 'Quản trị viên' : 'Thành viên'}</p>
          </div>
          <button 
            onClick={onLogout}
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Đăng xuất"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};
