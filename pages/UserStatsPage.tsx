
import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Image as PhotoLibrary, 
  Heart as Favorite, 
  Users as Groups, 
  TrendingUp, 
  Sparkles as AutoAwesome, 
  Calendar as CalendarToday
} from 'lucide-react';
import { User, UserAnalytics } from '../types';

const API_BASE_URL = 'http://localhost/DoAn2/api';

const UserStatsPage: React.FC<{ user: User }> = ({ user }) => {
  const [data, setData] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/get_user_stats.php?user_id=${user.id}`);
        const result = await res.json();
        if (result.status === 'success') setData(result.data);
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchUserStats();
  }, [user.id]);

  if (loading) return <div className="flex-1 flex items-center justify-center"><RefreshCw className="animate-spin text-primary w-10 h-10" /></div>;
  if (!data) return <div className="flex-1 flex items-center justify-center">Không thể tải dữ liệu phân tích.</div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 scrollbar-hide">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Phân Tích Cá Nhân</h1>
          <p className="text-slate-500 text-base max-w-2xl">Theo dõi tương tác, sự tăng trưởng và ảnh hưởng cộng đồng của bạn một cách chi tiết.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Tổng Bài viết', value: data.overview.posts, icon: PhotoLibrary, color: 'blue' },
            { label: 'Tổng Lượt thích', value: data.overview.likes, icon: Favorite, color: 'rose' },
            { label: 'Người theo dõi', value: data.overview.followers, icon: Groups, color: 'emerald' },
            { label: 'Thích Trung bình', value: data.overview.avgLikes, icon: TrendingUp, color: 'amber' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-card-dark p-6 md:p-8 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-2.5 w-fit rounded-2xl bg-${s.color}-500/10 text-${s.color}-500 mb-4`}>
                <s.icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-[11px] font-semibold text-slate-400 uppercase mt-4 tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white dark:bg-card-dark p-8 md:p-10 rounded-[48px] border border-slate-200 dark:border-white/5 shadow-xl">
             <h3 className="font-bold text-lg mb-8 flex items-center gap-2 dark:text-white">
                <AutoAwesome className="text-primary w-5 h-5" />
                Đỉnh cao Tương tác
             </h3>
             {data.topPost ? (
                <div className="space-y-6">
                  <div className="aspect-video rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-white/5">
                    <img src={data.topPost.image} className="w-full h-full object-cover transition-transform hover:scale-105 duration-700" alt="" referrerPolicy="no-referrer" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-base dark:text-white line-clamp-2 leading-relaxed">{data.topPost.caption}</p>
                    <div className="flex items-center gap-6 pt-2">
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs font-bold">
                          <Favorite className="w-3.5 h-3.5 fill-current" /> {data.topPost.likes}
                       </div>
                       <span className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                          <CalendarToday className="w-4 h-4" /> {data.topPost.time}
                       </span>
                    </div>
                  </div>
                </div>
             ) : (
               <div className="py-20 text-center bg-slate-50 dark:bg-white/5 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10">
                 <p className="text-slate-400 italic">Chưa có bài viết nào để phân tích.</p>
               </div>
             )}
          </div>

          <div className="bg-white dark:bg-card-dark p-8 md:p-10 rounded-[48px] border border-slate-200 dark:border-white/5 shadow-xl">
             <h3 className="font-bold text-lg mb-8 flex items-center gap-2 dark:text-white">
                <TrendingUp className="text-emerald-500 w-5 h-5" />
                Hiệu suất Hàng tuần
             </h3>
             <div className="space-y-4">
                {data.recentActivity.length > 0 ? data.recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-transparent hover:border-emerald-500/20 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
                          <CalendarToday className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-sm font-bold dark:text-white">{new Date(a.date).toLocaleDateString('vi-VN', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                           <p className="text-[11px] text-slate-500 font-medium">{a.count} bài viết đã đăng</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-emerald-500 font-bold text-lg">+{a.likes}</span>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold leading-none">Lượt thích</p>
                     </div>
                  </div>
                )) : (
                  <div className="py-20 text-center bg-slate-50 dark:bg-white/5 rounded-[32px] border border-dashed border-slate-200 dark:border-white/10">
                    <p className="text-slate-400 italic">Không có hoạt động nào trong 7 ngày qua.</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatsPage;
