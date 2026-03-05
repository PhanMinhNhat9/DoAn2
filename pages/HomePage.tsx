
import React from 'react';
import { Plus as Add } from 'lucide-react';
import { Post, User } from '../types';
import PostCard from '../components/PostCard';

interface HomePageProps { 
  onPostClick: (post: Post) => void;
  posts: Post[];
  user: User | null;
  trending: any[];
  stories: any[];
  onPostStory: (img: string) => void;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  onShare: (post: Post) => void;
  onDelete?: (id: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onPostClick, posts, user, trending, stories, onPostStory, onLike, onBookmark, onShare, onDelete }) => (
  <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 scroll-smooth scrollbar-hide">
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      <div 
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.onchange = (e: any) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (re: any) => onPostStory(re.target.result);
            reader.readAsDataURL(file);
          };
          input.click();
        }}
        className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group"
      >
        <div className="w-16 h-16 rounded-full bg-surface-dark border-2 border-dashed border-primary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
          <Add className="text-primary w-6 h-6" />
        </div>
        <span className="text-xs font-medium truncate w-full text-center dark:text-white">Thêm tin</span>
      </div>
      {stories.map(story => (
        <div key={story.id} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer">
          <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 to-primary animate-pulse">
            <div className="w-full h-full rounded-full border-2 border-background-dark bg-cover bg-center" style={{ backgroundImage: `url(${story.image_url})` }}></div>
          </div>
          <span className="text-xs font-medium truncate w-full text-center dark:text-white">{story.username}</span>
        </div>
      ))}
      {!stories.length && trending.slice(0, 5).map(food => (
        <div key={food.id} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer">
          <div className="w-16 h-16 rounded-full p-[2px] bg-slate-200 dark:bg-white/10">
            <div className="w-full h-full rounded-full border-2 border-background-dark bg-cover bg-center" style={{ backgroundImage: `url(${food.image})` }}></div>
          </div>
          <span className="text-xs font-medium truncate w-full text-center dark:text-white">{food.name}</span>
        </div>
      ))}
    </div>
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {posts.length > 0 ? (
        posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            user={user}
            onClick={() => onPostClick(post)}
            onLike={onLike}
            onBookmark={onBookmark}
            onShare={onShare}
            onDelete={onDelete}
          />
        ))
      ) : (
        <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
          <p className="text-slate-500">Chưa có bài viết nào. Hãy thử tìm kiếm hoặc lọc bài viết khác!</p>
        </div>
      )}
    </div>
  </div>
);

export default HomePage;
