
import React from 'react';
import { 
  Settings, 
  MapPin as LocationOn, 
  Grid as GridOn, 
  Bookmark as BookmarkBorder, 
  User as AssignmentInd,
  RefreshCw,
  Heart as Favorite,
  MessageCircle as ChatBubble
} from 'lucide-react';
import { Post, User } from '../types';

interface ProfilePageProps {
  posts: Post[];
  user: User | null;
  profileTab: string;
  onTabChange: (tab: string) => void;
  onEdit: () => void;
  onPostClick: (post: Post) => void;
  loading?: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ posts, user, profileTab, onTabChange, onEdit, onPostClick, loading }) => {
  const displayPosts = posts; 

  return (
    <div className="flex-1 overflow-y-auto py-8 px-4 sm:px-6 scrollbar-hide">
      <div className="w-full max-w-[960px] mx-auto flex flex-col gap-8">
        <section className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start p-4">
          <div className="relative shrink-0">
            <div className="bg-center bg-no-repeat bg-cover rounded-full size-32 md:size-40 border-4 border-white dark:border-surface-dark shadow-xl" style={{ backgroundImage: `url(${user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'})` }}></div>
          </div>
          <div className="flex flex-col flex-1 w-full gap-5">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{(user as any)?.name || (user as any)?.username || 'Người dùng'}</h1>
              <div className="flex gap-3">
                <button onClick={onEdit} className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg text-sm transition-colors shadow-lg shadow-primary/20">Chỉnh sửa hồ sơ</button>
                <button className="bg-slate-200 dark:bg-surface-dark text-slate-700 dark:text-white p-2 rounded-lg hover:bg-slate-300 dark:hover:bg-surface-border transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex justify-center md:justify-start gap-8 md:gap-10 border-y md:border-y-0 border-slate-200 dark:border-surface-border py-4 md:py-0 w-full">
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-lg">{(user as any)?.posts_count || 0}</span>
                <span className="text-slate-500 dark:text-text-secondary text-sm">bài viết</span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-lg">{(user as any)?.received_likes || 0}</span>
                <span className="text-slate-500 dark:text-text-secondary text-sm">lượt thích</span>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-lg">{(user as any)?.followers || 0}</span>
                <span className="text-slate-500 dark:text-text-secondary text-sm">người theo dõi</span>
              </div>
            </div>
            <div className="text-center md:text-left space-y-1">
              <p className="text-slate-800 dark:text-gray-100 font-medium text-base">{(user as any)?.bio || 'Người khám phá ẩm thực Việt 🍜'}</p>
              <div className="flex items-center justify-center md:justify-start gap-1 text-primary text-sm pt-1">
                <LocationOn className="w-4 h-4" />
                <span>{user?.location || 'Việt Nam'}</span>
              </div>
            </div>
          </div>
        </section>
        <div className="border-t border-slate-200 dark:border-surface-border mt-2">
          <div className="flex justify-center gap-12">
            <button 
              onClick={() => onTabChange('posts')}
              className={`flex items-center gap-2 border-t-2 py-4 px-2 -mt-[1px] transition-colors ${profileTab === 'posts' ? 'border-primary text-primary dark:text-white' : 'border-transparent text-slate-400'}`}
            >
              <GridOn className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Bài viết</span>
            </button>
            <button 
              onClick={() => onTabChange('saved')}
              className={`flex items-center gap-2 border-t-2 py-4 px-2 -mt-[1px] transition-colors ${profileTab === 'saved' ? 'border-primary text-primary dark:text-white' : 'border-transparent text-slate-400'}`}
            >
              <BookmarkBorder className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Đã lưu</span>
            </button>
            <button 
              onClick={() => onTabChange('tagged')}
              className={`flex items-center gap-2 border-t-2 py-4 px-2 -mt-[1px] transition-colors ${profileTab === 'tagged' ? 'border-primary text-primary dark:text-white' : 'border-transparent text-slate-400'}`}
            >
              <AssignmentInd className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Gắn thẻ</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-4 pb-12 min-h-[300px]">
          {loading ? (
            <div className="col-span-full py-20 flex justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>
          ) : displayPosts.length > 0 ? displayPosts.map(post => (
            <div key={post.id} onClick={() => onPostClick(post)} className="group relative aspect-square bg-slate-100 dark:bg-surface-dark cursor-pointer overflow-hidden rounded-md md:rounded-lg">
              <img src={post.image} alt={post.caption} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Favorite className="w-5 h-5 fill-current" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-bold">
                  <ChatBubble className="w-5 h-5 fill-current" />
                  <span>{post.comments}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center text-slate-500 italic bg-white dark:bg-surface-dark rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              Không tìm thấy mục {profileTab === 'posts' ? 'bài viết' : profileTab === 'saved' ? 'đã lưu' : 'gắn thẻ'} nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
