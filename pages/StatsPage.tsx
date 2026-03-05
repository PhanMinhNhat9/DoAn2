
import React from 'react';
import { 
  Image as PhotoLibrary, 
  Users as Groups, 
  Sparkles as AutoAwesome, 
  Utensils as RestaurantMenu,
  Calendar as CalendarToday
} from 'lucide-react';

interface StatsPageProps {
  stats: any;
  trending: any[];
}

const StatsPage: React.FC<StatsPageProps> = ({ stats, trending }) => (
  <div className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-20 scrollbar-hide">
    <div className="max-w-[1200px] mx-auto">
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex min-w-72 flex-col gap-1">
          <h1 className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">Thống Kê Nền Tảng</h1>
          <p className="text-slate-500 dark:text-text-secondary text-base font-normal leading-normal">Tổng quan hiệu suất của trợ lý AI VietFood.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-text-secondary bg-white dark:bg-card-dark px-3 py-1.5 rounded-lg border border-slate-200 dark:border-border-dark">
          <CalendarToday className="w-4 h-4" />
          <span>Dữ liệu Thời gian thực</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Tổng Ảnh bàn giao', value: stats.totalPhotos?.toLocaleString() || '0', change: 'Trực tiếp', icon: PhotoLibrary, color: 'blue' },
          { label: 'Người đóng góp', value: stats.activeContributors?.toLocaleString() || '0', change: 'Trực tiếp', icon: Groups, color: 'purple' },
          { label: 'Mô tả bởi AI', value: stats.aiCaptions?.toLocaleString() || '0', change: 'Trực tiếp', icon: AutoAwesome, color: 'emerald' },
          { label: 'Món ăn Xu hướng', value: trending[0]?.name || 'N/A', change: 'Số 1', icon: RestaurantMenu, color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`flex items-center px-2 py-0.5 rounded text-xs font-bold ${stat.change.includes('+') ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-500 bg-slate-100 dark:bg-slate-800'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-slate-500 dark:text-text-secondary text-sm font-medium leading-normal mb-1">{stat.label}</p>
              <p className="text-slate-900 dark:text-white tracking-tight text-2xl font-bold leading-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default StatsPage;
