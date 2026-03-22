import React from 'react';
import { Users, Heart, MessageSquare, ChevronRight, Send } from 'lucide-react';
import { CommunityPost, User } from '../types';

interface CommunityTabProps {
  user: User;
  communityPosts: CommunityPost[];
  communityPage: number;
  communityTotalPages: number;
  expandedPostId: string | null;
  commentText: { [postId: string]: string };
  setExpandedPostId: (id: string | null) => void;
  setCommentText: (text: { [postId: string]: string }) => void;
  fetchCommunity: (page: number) => void;
  likePost: (postId: string) => void;
  handleCommentSubmit: (postId: string) => void;
  setCurrentResult: (post: any) => void;
  setActiveTab: (tab: string) => void;
}

export const CommunityTab: React.FC<CommunityTabProps> = ({
  user,
  communityPosts,
  communityPage,
  communityTotalPages,
  expandedPostId,
  commentText,
  setExpandedPostId,
  setCommentText,
  fetchCommunity,
  likePost,
  handleCommentSubmit,
  setCurrentResult,
  setActiveTab
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Bảng tin cộng đồng</h2>
          <p className="text-slate-500">Khám phá những món ăn được chia sẻ bởi mọi người</p>
        </div>
        <button 
          onClick={() => fetchCommunity(1)}
          className="flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700"
        >
          Làm mới bảng tin
        </button>
      </div>

      {communityPosts.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-100 p-4 rounded-full text-slate-400 mb-4">
            <Users size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Chưa có bài đăng nào</h3>
          <p className="text-slate-500 mt-2">Hãy là người đầu tiên chia sẻ món ăn của bạn!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {communityPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-all">
              <div className="h-64 overflow-hidden relative">
                <img src={post.imageUrl} alt={post.dishName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-orange-600 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-xs">
                      {post.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{post.username}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-xl font-bold text-slate-900">{post.dishName}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2 mt-1">{post.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => likePost(post.id)}
                      className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors group"
                    >
                      <Heart size={20} className="group-active:scale-125 transition-transform" />
                      <span className="text-sm font-bold">{post.likes}</span>
                    </button>
                    <button 
                      onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                      className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors"
                    >
                      <MessageSquare size={20} />
                      <span className="text-sm font-bold">{post.comments?.length || 0}</span>
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentResult(post);
                      setActiveTab('scan');
                    }}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    Xem chi tiết <ChevronRight size={14} />
                  </button>
                </div>

                {expandedPostId === post.id && (
                  <div className="pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                    <h5 className="text-sm font-bold text-slate-800 mb-3">Bình luận</h5>
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="bg-slate-50 rounded-xl p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-slate-700">{comment.username}</span>
                              <span className="text-[10px] text-slate-400">{new Date(comment.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-sm text-slate-600">{comment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic mb-4">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                    )}
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={commentText[post.id] || ''}
                        onChange={e => setCommentText({...commentText, [post.id]: e.target.value})}
                        placeholder="Viết bình luận..."
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                        onKeyDown={e => e.key === 'Enter' && handleCommentSubmit(post.id)}
                      />
                      <button 
                        onClick={() => handleCommentSubmit(post.id)}
                        disabled={!commentText[post.id]?.trim()}
                        className="p-2 bg-orange-600 text-white rounded-xl disabled:opacity-50 hover:bg-orange-700 transition-colors"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {communityTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => { const p = communityPage - 1; fetchCommunity(p); }}
            disabled={communityPage === 1}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-40 hover:border-orange-400 transition-all"
          >← Trước</button>
          <span className="text-sm text-slate-500">Trang {communityPage} / {communityTotalPages}</span>
          <button
            onClick={() => { const p = communityPage + 1; fetchCommunity(p); }}
            disabled={communityPage === communityTotalPages}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-40 hover:border-orange-400 transition-all"
          >Sau →</button>
        </div>
      )}
    </div>
  );
};
