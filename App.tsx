
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

import { Post, User } from './types';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import PostDetailModal from './components/PostDetailModal';
import EditProfileModal from './components/EditProfileModal';

// Pages
import HomePage from './pages/HomePage';
import CreatePage from './pages/CreatePage';
import ProfilePage from './pages/ProfilePage';
import NotificationPage from './pages/NotificationPage';
import StatsPage from './pages/StatsPage';
import UserStatsPage from './pages/UserStatsPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';

const API_BASE_URL = 'http://localhost/DoAn2/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<{id: number, msg: string}[]>([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState('posts');

  const addToast = (msg: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, {id, msg}]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  // Lấy dữ liệu từ Backend
  const fetchData = async (search = '', filterOverride = null) => {
    setLoading(true);
    try {
      const savedUser = localStorage.getItem('user');
      const currentU = savedUser ? JSON.parse(savedUser) : null;
      if (currentU) setCurrentUser(currentU);

      const userIdParam = currentU ? `&userId=${currentU.id}` : '';
      
      let finalFilter = filterOverride;
      if (!finalFilter) {
        if (activeTab === 'explore') finalFilter = 'explore';
        else if (activeTab === 'profile') {
          finalFilter = profileTab === 'saved' ? 'bookmarks' : 'profile';
        }
      }

      const filterParam = finalFilter ? `&filter=${finalFilter}` : '';
      const targetUserParam = (finalFilter === 'profile' && currentU) ? `&targetUser=${currentU.handle}` : '';
      const searchParam = search ? `&search=${search}` : '';

      // Fetch Posts (with search/filter)
      const postRes = await fetch(`${API_BASE_URL}/get_posts.php?_t=${Date.now()}${userIdParam}${filterParam}${targetUserParam}${searchParam}`);
      const postData = await postRes.json();
      if (Array.isArray(postData)) setPosts(postData);

      // Fetch Trending
      const trendRes = await fetch(`${API_BASE_URL}/get_trending.php`);
      const trendData = await trendRes.json();
      if (Array.isArray(trendData)) setTrending(trendData);

      // Fetch Stories
      const storyRes = await fetch(`${API_BASE_URL}/stories.php`);
      const storyData = await storyRes.json();
      if (Array.isArray(storyData)) setStories(storyData);

      // Fetch Stats
      const statRes = await fetch(`${API_BASE_URL}/get_stats.php`);
      const statData = await statRes.json();
      if (!statData.error) setStats(statData);

    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchQuery);
  }, [activeTab, searchQuery, profileTab]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setActiveTab('home');
    addToast("Đã đăng xuất thành công");
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      try {
        await fetch(`${API_BASE_URL}/delete_post.php?id=${id}&userId=${currentUser?.id}`, { method: 'POST' });
        setPosts(posts.filter(p => p.id !== id));
        addToast("Đã xóa bài viết");
      } catch (err) {
        console.error('Lỗi xóa:', err);
      }
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) { setActiveTab('login'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/interactions.php?action=like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, postId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPosts(prev => prev.map(p => p.id === postId ? {
          ...p, 
          isLiked: data.liked, 
          likes: data.liked ? p.likes + 1 : Math.max(0, p.likes - 1)
        } : p));
        addToast(data.liked ? "Đã thêm vào yêu thích" : "Đã bỏ yêu thích");
      }
    } catch (err) { console.error(err); }
  };

  const handleBookmark = async (postId: string) => {
    if (!currentUser) { setActiveTab('login'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/interactions.php?action=bookmark`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, postId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        if (activeTab === 'profile' && profileTab === 'saved' && !data.bookmarked) {
          setPosts(prev => prev.filter(p => p.id !== postId));
        } else {
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, isBookmarked: data.bookmarked } : p));
        }
        addToast(data.bookmarked ? "Đã lưu bài viết" : "Đã bỏ lưu");
      }
    } catch (err) { console.error(err); }
  };

  const handleComment = async (postId: string, content: string) => {
    if (!currentUser) { setActiveTab('login'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/interactions.php?action=comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, postId, content })
      });
      const data = await res.json();
      if (data.status === 'success') {
        addToast("Đã đăng bình luận");
        fetchData(searchQuery);
      }
    } catch (err) { console.error(err); }
  };

  const handleFollow = async (targetId: string) => {
    if (!currentUser) { setActiveTab('login'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/profile.php?action=follow&userId=${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        addToast(data.followed ? "Đang theo dõi người dùng" : "Đã bỏ theo dõi");
        setPosts(prev => prev.map(p => p.user.id === targetId ? {
          ...p,
          user: { ...p.user, isFollowing: data.followed, followers: data.followed ? p.user.followers + 1 : Math.max(0, p.user.followers - 1) }
        } : p));
        
        if (selectedPost && selectedPost.user.id === targetId) {
          setSelectedPost(prev => prev ? {
            ...prev,
            user: { ...prev.user, isFollowing: data.followed, followers: data.followed ? prev.user.followers + 1 : Math.max(0, prev.user.followers - 1) }
          } : null);
        }
        
        fetchData(searchQuery);
      }
    } catch (err) { console.error(err); }
  };

  const handlePostStory = async (image: string) => {
    if (!currentUser) { setActiveTab('login'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/stories.php?action=post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, image })
      });
      const data = await res.json();
      if (data.status === 'success') {
        addToast("Đã chia sẻ tin!");
        fetchData(searchQuery);
      }
    } catch (err) { console.error(err); }
  };

  const handleShare = (post: Post) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    addToast("Đã sao chép liên kết!");
  };

  const handleEditProfile = async (data: any) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/profile.php?action=update&userId=${currentUser.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.status === 'success') {
        const updatedUser = { ...currentUser, ...data };
        setCurrentUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditProfileOpen(false);
        addToast("Đã cập nhật hồ sơ!");
        fetchData(searchQuery);
      } else {
        addToast(result.message || "Không thể cập nhật hồ sơ");
      }
    } catch (err) { 
      console.error(err);
      addToast("Lỗi kết nối khi cập nhật hồ sơ");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
      case 'explore':
        return <HomePage onPostClick={setSelectedPost} posts={posts} user={currentUser} trending={trending} stories={stories} onPostStory={handlePostStory} onLike={handleLike} onShare={handleShare} onBookmark={handleBookmark} onDelete={handleDeletePost} />;
      case 'create':
        return <CreatePage user={currentUser} onPostCreated={() => { setActiveTab('home'); fetchData(); addToast("Đã chia sẻ bài viết mới!"); }} />;
      case 'profile':
        return <ProfilePage 
          posts={posts} 
          user={currentUser} 
          profileTab={profileTab}
          loading={loading}
          onTabChange={(tab) => {
            if (tab !== profileTab) {
              setPosts([]);
              setProfileTab(tab);
            }
          }}
          onEdit={() => setIsEditProfileOpen(true)} 
          onPostClick={setSelectedPost} 
        />;
      case 'notifications':
        return <NotificationPage user={currentUser} />;
      case 'stats':
        return <StatsPage stats={stats} trending={trending} />;
      case 'analytics':
        return currentUser ? <UserStatsPage user={currentUser} /> : <LoginPage onLogin={(user) => { setCurrentUser(user); setActiveTab('home'); }} />;
      case 'login':
        return <LoginPage onLogin={(user) => { setCurrentUser(user); setActiveTab('home'); addToast(`Chào mừng trở lại, ${user.name}!`); }} />;
      case 'admin':
        return currentUser?.role === 'ADMIN' ? 
          <AdminDashboard posts={posts} onPostDelete={handleDeletePost} /> : 
          <HomePage onPostClick={setSelectedPost} posts={posts} user={currentUser} trending={trending} stories={stories} onPostStory={handlePostStory} onLike={handleLike} onShare={handleShare} onBookmark={handleBookmark} onDelete={handleDeletePost} />;
      default:
        return <HomePage onPostClick={setSelectedPost} posts={posts} user={currentUser} trending={trending} stories={stories} onPostStory={handlePostStory} onLike={handleLike} onShare={handleShare} onBookmark={handleBookmark} onDelete={handleDeletePost} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f8f7] dark:bg-background-dark text-slate-900 transition-colors duration-300">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setPosts([]);
          setActiveTab(tab);
          if (tab === 'profile') setProfileTab('posts');
        }} 
        user={currentUser} 
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header user={currentUser} onSearch={setSearchQuery} />
        <AnimatePresence>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {['home', 'explore', 'notifications', 'stats', 'analytics', 'profile'].includes(activeTab) && (
        <aside className="w-80 flex-shrink-0 border-l border-slate-200 dark:border-white/10 bg-white dark:bg-background-dark hidden xl:block p-6 overflow-y-auto scrollbar-hide">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Xu hướng Món ăn</h3>
              <button className="text-xs font-medium text-primary hover:underline">Xem Tất Cả</button>
            </div>
            <div className="space-y-4">
              {trending.map(food => (
                <div key={food.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="h-12 w-12 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${food.image})` }}></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors dark:text-white">{food.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{food.posts} bài viết</p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
              ))}
            </div>
          </div>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Thống kê Cộng đồng</h3>
            </div>
            <div className="bg-slate-50 dark:bg-surface-dark/50 rounded-2xl p-4 border border-slate-200 dark:border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">Tổng số Ảnh</span>
                  <span className="text-xl font-bold dark:text-white">{stats.totalPhotos || 0}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 dark:text-slate-400 mb-1">Thành viên</span>
                  <span className="text-xl font-bold dark:text-white">{stats.activeContributors || 0}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">Thẻ Xu hướng hàng đầu</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-sm font-medium dark:text-white">{trending[0]?.name || 'Đang cập nhật...'}</span>
                  </div>
                  <span className="text-xs font-bold text-primary">+{(trending[0]?.posts || 0) * 12}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            <a className="hover:underline" href="#">Giới thiệu</a>
            <a className="hover:underline" href="#">Quyền riêng tư</a>
            <a className="hover:underline" href="#">Điều khoản</a>
            <a className="hover:underline" href="#">Nguyên tắc AI</a>
            <span>© 2024 VietFood AI</span>
          </div>
        </aside>
      )}

      {selectedPost && (
        <PostDetailModal 
          post={selectedPost} 
          user={currentUser}
          onClose={() => setSelectedPost(null)} 
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShare={handleShare}
          onComment={handleComment}
          onFollow={handleFollow}
          onDelete={handleDeletePost}
        />
      )}

      {isEditProfileOpen && currentUser && (
        <EditProfileModal 
          user={currentUser} 
          onClose={() => setIsEditProfileOpen(false)} 
          onSave={handleEditProfile} 
          />
      )}

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div 
              key={toast.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/10 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl"
            >
              <CheckCircle className="text-primary w-5 h-5" />
              <span className="text-sm font-bold">{toast.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
