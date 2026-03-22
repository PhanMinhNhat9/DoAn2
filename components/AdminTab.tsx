import React from 'react';
import { Users, History, Share2, Trash2, Heart, MessageSquare } from 'lucide-react';
import { CommunityPost } from '../types';

interface AdminStats {
  totalUsers: number;
  totalHistoryItems: number;
  totalCommunityPosts: number;
}

interface AdminTabProps {
  adminStats: AdminStats | null;
  communityPosts: CommunityPost[];
  fetchCommunity: (page: number) => void;
  deleteCommunityPost: (id: string) => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  adminStats,
  communityPosts,
  fetchCommunity,
  deleteCommunityPost
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Bảng Điều Khiển Quản Trị</h2>
        <p className="text-slate-500">Quản lý nội dung và xem thống kê hệ thống</p>
      </div>
      
      {adminStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">Tổng Người Dùng</h3>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
            </div>
            <p className="text-4xl font-bold text-slate-900">{adminStats.totalUsers}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">Lịch Sử Quét</h3>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl"><History size={24} /></div>
            </div>
            <p className="text-4xl font-bold text-slate-900">{adminStats.totalHistoryItems}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">Bài Cộng Đồng</h3>
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Share2 size={24} /></div>
            </div>
            <p className="text-4xl font-bold text-slate-900">{adminStats.totalCommunityPosts}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Quản lý Cộng Đồng</h3>
          <button onClick={() => fetchCommunity(1)} className="text-sm font-bold text-orange-600">Làm mới</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Người Đăng</th>
                <th className="px-6 py-4">Món Ăn</th>
                <th className="px-6 py-4">Tương Tác</th>
                <th className="px-6 py-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {communityPosts.map(post => (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-semibold text-slate-700">{post.username}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{post.dishName}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{post.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-500"><Heart size={14} /> {post.likes}</span>
                      <span className="flex items-center gap-1 text-slate-500"><MessageSquare size={14} /> {post.comments?.length || 0}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteCommunityPost(post.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa bài viết này khỏi cộng đồng"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {communityPosts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Chưa có bài viết nào trên cộng đồng.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
