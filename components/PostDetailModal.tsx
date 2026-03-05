
import React, { useState, useEffect } from 'react';
import { 
  Heart as Favorite, 
  MessageCircle as ChatBubble, 
  Send, 
  Bookmark as SavedIcon, 
  Trash2,
  MapPin as LocationOn,
  Sparkles as AutoAwesome
} from 'lucide-react';
import { Post, User } from '../types';

const API_BASE_URL = 'http://localhost/DoAn2/api';

interface PostDetailModalProps {
  post: Post;
  user: User | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onShare: (post: Post) => void;
  onComment: (id: string, content: string) => void;
  onFollow: (id: string) => void;
  onDelete?: (id: string) => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, user, onClose, onLike, onBookmark, onShare, onComment, onFollow, onDelete }) => {
  const [comment, setComment] = useState('');
  const [commentsList, setCommentsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/get_comments.php?post_id=${post.id}`);
        const data = await res.json();
        setCommentsList(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); }
    };
    fetchComments();
  }, [post.id]);

  const handleSendComment = () => {
    if (!comment.trim()) return;
    onComment(post.id, comment);
    setCommentsList([{ user_id: user?.id, name: user?.username, avatar: user?.avatar, content: comment, created_at: 'Vừa xong' }, ...commentsList]);
    setComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-10">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose}></div>
      <div className="w-full h-full max-w-6xl bg-white dark:bg-background-dark md:rounded-[40px] shadow-2xl z-10 overflow-hidden flex flex-col md:flex-row">
        {/* Left: Image */}
        <div className="flex-1 bg-black flex items-center justify-center relative group min-h-[300px] md:min-h-0">
          <img src={post.image} alt={post.caption} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-10 pointer-events-none">
            <div className="text-white space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
                <AutoAwesome className="w-4 h-4" /> Phân tích bởi VietFood AI
              </div>
              <h2 className="text-3xl font-black leading-tight">{post.caption}</h2>
            </div>
          </div>
        </div>

        {/* Right: Info & Interaction */}
        <div className="w-full md:w-[450px] flex flex-col h-full border-l border-slate-100 dark:border-white/5 bg-white dark:bg-card-dark">
          {/* Author info */}
          <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-card-dark/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border-2 border-primary/20 p-0.5 shrink-0">
                <div className="h-full w-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${post.user.avatar})` }}></div>
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-slate-900 dark:text-white truncate flex items-center gap-1.5 leading-none mb-1">
                  {post.user.handle}
                  {post.user.followers > 10 && <div className="w-3 h-3 bg-blue-500 text-white rounded-full flex items-center justify-center text-[6px] shrink-0 font-black">✓</div>}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-tight">
                  <LocationOn className="w-3 h-3 text-primary" /> {post.user.location}
                </div>
              </div>
            </div>
            {user?.id !== post.user.id && (
              <button 
                onClick={() => onFollow(post.user.id)}
                className={`text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all ${post.user.isFollowing ? 'bg-slate-100 dark:bg-white/5 text-slate-400' : 'bg-primary text-white shadow-lg shadow-primary/20'}`}
              >
                {post.user.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </button>
            )}
            {user?.id === post.user.id && (
              <button onClick={() => onDelete && onDelete(post.id)} className="text-slate-400 hover:text-red-500" title="Xóa bài viết"><Trash2 className="w-5 h-5" /></button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {/* Description */}
            <div className="space-y-4">
              <p className="text-slate-700 dark:text-gray-100 leading-relaxed font-bold text-lg">{post.caption}</p>
              {post.aiAnalysis && (
                <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 relative overflow-hidden group">
                  <AutoAwesome className="absolute -right-4 -top-4 w-24 h-24 text-primary/5 transition-transform group-hover:scale-110 duration-700" />
                  <p className="text-sm dark:text-text-secondary leading-relaxed relative z-10 italic">
                    <span className="text-primary font-black mr-1 uppercase text-xs not-italic tracking-widest">Phân tích AI:</span> 
                    {post.aiAnalysis}
                  </p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full text-xs font-black text-primary border border-transparent hover:border-primary/20 transition-all cursor-pointer">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-white/5">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ChatBubble className="w-3 h-3" /> Bình luận cộng đồng
              </h4>
              <div className="space-y-6">
                {commentsList.map((c, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center border-2 border-slate-200 dark:border-white/5" style={{ backgroundImage: `url(${c.avatar})` }}></div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black dark:text-white uppercase tracking-tighter">{c.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.created_at}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-text-secondary leading-normal">{c.content}</p>
                    </div>
                  </div>
                ))}
                {!commentsList.length && (
                  <div className="py-10 text-center">
                    <p className="text-slate-400 italic text-sm font-medium">Bạn hãy là người đầu tiên chia sẻ cảm nghĩ!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interactions */}
          <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-card-dark/50 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => onLike(post.id)}
                  className={`flex items-center gap-2 transition-transform active:scale-90 ${post.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                >
                  <Favorite className={`w-7 h-7 ${post.isLiked ? 'fill-current' : ''}`} />
                  <span className="font-black text-sm">{post.likes}</span>
                </button>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-transform active:scale-90" onClick={() => document.getElementById('comment-input')?.focus()}>
                  <ChatBubble className="w-7 h-7" />
                  <span className="font-black text-sm sr-only">Bình luận</span>
                </button>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-transform active:scale-90" onClick={() => onShare(post)}>
                  <Send className="w-7 h-7" />
                </button>
              </div>
              <button 
                onClick={() => onBookmark(post.id)}
                className={`${post.isBookmarked ? 'text-primary' : 'text-slate-400 hover:text-primary'} transition-transform active:scale-90`}
              >
                <SavedIcon className={`w-7 h-7 ${post.isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            <div className="relative">
              <input 
                id="comment-input"
                className="w-full pl-6 pr-14 py-4 bg-white dark:bg-background-dark border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm" 
                placeholder="Chia sẻ suy nghĩ của bạn..." 
                type="text"
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendComment()}
              />
              <button 
                onClick={handleSendComment}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-30 disabled:grayscale"
                disabled={!comment.trim()}
              >
                Đăng
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        onClick={onClose}
        className="fixed top-6 right-6 text-white/50 hover:text-white hover:scale-110 transition-all z-50 p-2"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

export default PostDetailModal;
