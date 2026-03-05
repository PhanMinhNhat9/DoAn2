
import React from 'react';
import { 
  Heart as Favorite,
  MessageCircle as ChatBubble,
  Send,
  ArrowRight as ArrowForward,
  Bookmark as SavedIcon,
  Trash2,
  MoreVertical,
  Sparkles as AutoAwesome
} from 'lucide-react';
import { Post, User } from '../types';

interface PostCardProps { 
  post: Post;
  user: User | null;
  onClick: () => void;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onShare: (post: Post) => void;
  onDelete?: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, user, onClick, onLike, onBookmark, onShare, onDelete }) => (
  <article className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden">
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${post.user.avatar})` }}></div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{post.user.handle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{post.user.location} • {post.time}</p>
        </div>
      </div>
      {(user?.role === 'ADMIN' || user?.id === post.user.id) ? (
        <button onClick={() => onDelete && onDelete(post.id)} className="text-slate-400 hover:text-red-500 transition-colors" title="Xóa bài viết">
          <Trash2 className="w-5 h-5" />
        </button>
      ) : (
        <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      )}
    </div>
    <div className="relative aspect-video w-full bg-slate-900 cursor-pointer" onClick={onClick}>
      <img src={post.image} alt={post.caption} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1">
        <AutoAwesome className="w-3 h-3 text-primary" />
        Mô tả AI
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onLike(post.id)}
            className={`group flex items-center gap-1.5 transition-colors ${post.isLiked ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300 hover:text-rose-500'}`}
          >
            <Favorite className={`w-5 h-5 ${post.isLiked ? 'fill-current' : 'group-hover:fill-current'}`} />
            <span className="text-sm font-medium">{post.likes}</span>
          </button>
          <button onClick={onClick} className="group flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
            <ChatBubble className="w-5 h-5" />
            <span className="text-sm font-medium">{post.comments}</span>
          </button>
          <button onClick={() => onShare(post)} className="group flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={() => onBookmark(post.id)}
          className={`${post.isBookmarked ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary'} transition-colors`}
        >
          <SavedIcon className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="mb-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{post.caption}</h2>
      </div>
      {post.aiAnalysis && (
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            <span className="text-primary italic">Phân tích chuyên sâu:</span> {post.aiAnalysis}
        </p>
      )}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map(tag => (
          <span key={tag} className="text-xs font-medium text-primary hover:underline cursor-pointer">{tag}</span>
        ))}
      </div>
      <button 
        onClick={onClick}
        className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
      >
        <span>Xem chi tiết công thức</span>
        <ArrowForward className="w-4 h-4" />
      </button>
    </div>
  </article>
);

export default PostCard;
