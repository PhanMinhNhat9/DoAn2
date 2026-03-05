
import React from 'react';
import { Search, Menu } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  onMenuClick?: () => void;
  user: User | null;
  onSearch: (q: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, user, onSearch }) => (
  <header className="h-16 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-20 flex items-center px-4 lg:px-8 justify-between gap-4">
    <button className="lg:hidden text-slate-500" onClick={onMenuClick}>
      <Menu className="w-6 h-6" />
    </button>
    <div className="flex-1 max-w-2xl mx-auto w-full">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input 
          onChange={(e) => onSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-slate-100 dark:bg-surface-dark text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all dark:text-white" 
          placeholder="Tìm kiếm món ăn, nguyên liệu hoặc người dùng..." 
          type="text"
        />
      </div>
    </div>
    <div className="flex items-center gap-3 lg:hidden">
      <div className="h-8 w-8 rounded-full bg-cover bg-center border border-primary/20" style={{ backgroundImage: `url(${(user as any)?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'})` }}></div>
    </div>
  </header>
);

export default Header;
