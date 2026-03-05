
import React from 'react';
import { 
  Home as HomeIcon, 
  Compass as ExploreIcon, 
  BarChart2 as StatsIcon, 
  User as ProfileIcon,
  PlusCircle,
  LogOut,
  Utensils as RestaurantMenu,
  Lock,
  Bell,
  LayoutDashboard
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user, onLogout }) => (
  <aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-white/10 flex flex-col bg-white dark:bg-background-dark overflow-y-auto hidden lg:flex">
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary/20 p-2 rounded-lg">
          <RestaurantMenu className="text-primary w-8 h-8" />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight dark:text-white">VietFood AI</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Cộng đồng Ẩm thực</p>
        </div>
      </div>
      <nav className="space-y-1">
        {[
          { icon: HomeIcon, label: 'Trang chủ', id: 'home' },
          { icon: ExploreIcon, label: 'Khám phá', id: 'explore' },
          { icon: Bell, label: 'Thông báo', id: 'notifications', badge: 3 },
          { icon: StatsIcon, label: 'Phân tích', id: 'analytics' },
          user?.role === 'ADMIN' ? { icon: LayoutDashboard, label: 'Quản trị hệ thống', id: 'admin' } : null,
          user?.role === 'ADMIN' ? { icon: StatsIcon, label: 'Thống kê sàn', id: 'stats' } : null,
          { icon: ProfileIcon, label: 'Hồ sơ', id: 'profile' },
          { icon: PlusCircle, label: 'Tạo bài đăng', id: 'create' },
        ].filter(Boolean).map((item: any) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-primary/10 text-primary font-bold' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="relative">
              <item.icon className="w-6 h-6" />
              {item.badge && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-background-dark">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
    <div className="mt-auto p-6 flex flex-col gap-4">
      {user ? (
        <>
          <button 
            onClick={() => setActiveTab('create')}
            className="flex w-full items-center justify-center gap-2 rounded-xl h-12 bg-primary text-white font-bold shadow-md hover:bg-primary/90 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Đăng bài mới</span>
          </button>
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-primary" style={{ backgroundImage: `url(${user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'})` }}></div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold dark:text-white truncate">{(user as any)?.name || (user as any)?.username || 'Khách'}</span>
                {user?.role === 'ADMIN' && (
                  <span className="bg-primary/20 text-primary text-[9px] px-1.5 py-0.5 rounded font-bold border border-primary/20">ADMIN</span>
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">{user?.handle}</span>
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors" title="Đăng xuất">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <button 
          onClick={() => setActiveTab('login')}
          className="flex w-full items-center justify-center gap-2 rounded-xl h-12 bg-slate-800 text-white font-bold shadow-md hover:bg-slate-900 transition-all"
        >
          <Lock className="w-5 h-5" />
          <span>Đăng nhập / Đăng ký</span>
        </button>
      )}
    </div>
  </aside>
);

export default Sidebar;
