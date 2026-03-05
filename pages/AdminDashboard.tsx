
import React from 'react';
import { 
  Trash2, 
  BarChart2 as StatsIcon, 
  Users as Groups, 
  Image as PhotoLibrary
} from 'lucide-react';
import { Post } from '../types';

interface AdminDashboardProps {
  posts: Post[];
  onPostDelete: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ posts, onPostDelete }) => (
  <div className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-12 scrollbar-hide">
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
            Quản trị viên Hệ thống
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Kiểm duyệt Nội dung</h1>
          <p className="text-slate-500 text-base max-w-xl">Giám sát các hoạt động trên nền tảng, quản lý bài viết và đảm bảo các nguyên tắc cộng đồng.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white dark:bg-surface-dark p-4 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm text-center min-w-[120px]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bài viết Trực tiếp</p>
              <p className="text-2xl font-bold text-primary">{posts.length}</p>
           </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-[32px] border border-slate-200 dark:border-white/5 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/5">
                <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">Chi tiết Bài viết</th>
                <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">Tác giả</th>
                <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">Thống kê</th>
                <th className="px-8 py-6 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-background-dark ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm">
                        <img src={post.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                      </div>
                      <div className="max-w-[200px]">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{post.caption}</p>
                        <p className="text-xs text-slate-500 font-medium">ID: {post.id} • {post.time}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cover bg-center ring-2 ring-primary/20" style={{ backgroundImage: `url(${post.user.avatar})` }}></div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{post.user.handle}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase border border-emerald-500/20">
                       <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                       {post.privacy === 'public' ? 'Công khai' : 'Riêng tư'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4 text-slate-500 font-medium text-sm">
                      <span className="flex items-center gap-1.5"><PhotoLibrary className="w-3.5 h-3.5" />{post.likes}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => onPostDelete(post.id)}
                      className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                      title="Xóa bài viết vi phạm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
