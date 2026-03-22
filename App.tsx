
import React, { useState, useEffect } from 'react';

import { User, UserRole, DishAnalysis, Language, CommunityPost, PaginatedResponse } from './types';
import { Navbar } from './components/Navbar';
import { AuthForm } from './components/AuthForm';
import { ScanTab } from './components/ScanTab';
import { HistoryTab } from './components/HistoryTab';
import { CommunityTab } from './components/CommunityTab';
import { StatsTab } from './components/StatsTab';
import { AdminTab } from './components/AdminTab';



const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('scan');
  const [history, setHistory] = useState<DishAnalysis[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [communityPage, setCommunityPage] = useState(1);
  const [communityTotalPages, setCommunityTotalPages] = useState(1);

  // Auth state
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  // Community state
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Other state
  const [searchQuery, setSearchQuery] = useState('');
  const [adminStats, setAdminStats] = useState<any>(null);



  // Effect 1: Run ONCE on mount — restore session from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('vietfood_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        fetchHistory(parsedUser, 1, '');
        // Pass parsedUser directly to avoid stale closure (user state not yet updated)
        if (parsedUser.role === UserRole.ADMIN) {
          fetchAdminStats(parsedUser);
        }
      } catch {
        localStorage.removeItem('vietfood_user'); // corrupted data
      }
    }
    fetchCommunity(1);
  }, []); // empty array = runs only once on mount

  // Effect 2: Reload admin stats when navigating TO the admin tab
  useEffect(() => {
    if (activeTab === 'admin' && user?.role === UserRole.ADMIN) {
      fetchAdminStats(user);
    }
  }, [activeTab]); // only triggers on tab change, and only if admin

  // fetchAdminStats accepts the user explicitly to avoid stale closure bugs
  const fetchAdminStats = async (u: User) => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${u.token || ''}` }
      });
      if (res.ok) setAdminStats(await res.json());
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    }
  };

  const deleteCommunityPost = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này khỏi cộng đồng?')) return;
    try {
      const res = await fetch(`/api/admin/community/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token || ''}` }
      });
      if (res.ok) {
        setCommunityPosts(prev => prev.filter(p => p.id !== id));
        if (user) fetchAdminStats(user); // Refresh stats with explicit user arg
      }
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  const fetchHistory = async (u: User, page: number, q: string) => {
    try {
      const res = await fetch(`/api/history?page=${page}&q=${encodeURIComponent(q)}`, {
        headers: { 'Authorization': `Bearer ${u.token || ''}` }
      });
      if (res.ok) {
        const data = await res.json();
        const items = data.data || (Array.isArray(data) ? data : []);
        setHistory(items);
        setHistoryTotal(data.total || items.length);
        setHistoryPage(data.page || 1);
        setHistoryTotalPages(data.totalPages || 1);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  const fetchCommunity = async (page: number) => {
    try {
      const res = await fetch(`/api/community?page=${page}`);
      if (res.ok) {
        const data = await res.json();
        const items = data.data || (Array.isArray(data) ? data : []);
        setCommunityPosts(items);
        setCommunityPage(data.page || 1);
        setCommunityTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch community", err);
    }
  };

  const authHeaders = (u: User) => ({
    'Authorization': `Bearer ${u?.token || ''}`,
    'Content-Type': 'application/json'
  });

  const uploadImage = async (file: File, u: User): Promise<{ imageUrl: string; base64: string }> => {
    // Get base64 for Gemini
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });

    // Upload file to server (saves to disk)
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${u.token || ''}` },
      body: formData
    });
    if (res.status === 401) {
      handleLogout();
      throw new Error('Unauthorized');
    }
    if (!res.ok) throw new Error('Upload failed');
    const { imageUrl } = await res.json();
    return { imageUrl, base64 };
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem('vietfood_user', JSON.stringify(userData));
        fetchHistory(userData, 1, '');
      } else {
        const err = await res.json();
        setAuthError(err.error || 'Có lỗi xảy ra.');
      }
    } catch (err) {
      setAuthError('Không thể kết nối đến máy chủ.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setHistory([]);
    setSearchQuery('');
    setHistoryPage(1);
    localStorage.removeItem('vietfood_user');
  };

  const handleCommentSubmit = async (postId: string) => {
    const text = commentText[postId];
    if (!text || text.trim() === '') return;
    
    try {
      const res = await fetch(`/api/community/comment/${postId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token || ''}`
        },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setCommunityPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
        setCommentText(prev => ({ ...prev, [postId]: '' })); // Clear input
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };



  const likePost = async (postId: string) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/community/like/${postId}`, { 
        method: 'POST',
        headers: authHeaders(user)
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setCommunityPosts(communityPosts.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };



  const deleteHistoryItem = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục này?')) {
      try {
        const res = await fetch(`/api/history/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${user!.token || ''}` }
        });
        if (res.ok) {
          fetchHistory(user!, historyPage, searchQuery);
        }
      } catch (err) {
        alert('Không thể xóa.');
      }
    }
  };

  if (!user) {
    return (
      <AuthForm 
        isRegistering={isRegistering}
        setIsRegistering={setIsRegistering}
        authError={authError}
        setAuthError={setAuthError}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleAuth={handleAuth}
      />
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8 max-w-5xl mx-auto px-4">
      <Navbar user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="mt-8">
        {activeTab === 'admin' && user?.role === UserRole.ADMIN && (
          <AdminTab 
            adminStats={adminStats}
            communityPosts={communityPosts}
            fetchCommunity={fetchCommunity}
            deleteCommunityPost={deleteCommunityPost}
          />
        )}

        <ScanTab 
          user={user}
          activeTab={activeTab}
          handleLogout={handleLogout}
          authHeaders={authHeaders}
          uploadImage={uploadImage}
          fetchHistory={fetchHistory}
        />

        {activeTab === 'history' && (
          <HistoryTab 
            user={user}
            history={history}
            historyTotal={historyTotal}
            historyPage={historyPage}
            historyTotalPages={historyTotalPages}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            fetchHistory={fetchHistory}
            setActiveTab={setActiveTab}
            deleteHistoryItem={deleteHistoryItem}
          />
        )}

        {activeTab === 'community' && (
          <CommunityTab
            user={user}
            communityPosts={communityPosts}
            communityPage={communityPage}
            communityTotalPages={communityTotalPages}
            expandedPostId={expandedPostId}
            commentText={commentText}
            setExpandedPostId={setExpandedPostId}
            setCommentText={setCommentText}
            fetchCommunity={fetchCommunity}
            likePost={likePost}
            handleCommentSubmit={handleCommentSubmit}
            setCurrentResult={() => {}} // Remove implementation if unused or find a way to handle it elsewhere
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'stats' && (
          <StatsTab user={user} history={history} />
        )}
      </main>
    </div>
  );
};

export default App;
