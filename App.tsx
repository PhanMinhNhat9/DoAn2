
import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  History, 
  LogOut, 
  MapPin, 
  PieChart, 
  Upload, 
  ChefHat,
  Search,
  Trash2,
  ChevronRight,
  Navigation,
  ExternalLink,
  AlertCircle,
  UserPlus,
  LogIn,
  Users,
  Heart,
  Share2,
  MessageSquare,
  Send,
  Shield
} from 'lucide-react';
import { User, UserRole, DishAnalysis, Language, CommunityPost, PaginatedResponse } from './types';
import { analyzeDish, findNearbyRestaurants } from './services/geminiService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RPieChart,
  Pie
} from 'recharts';

// --- Components ---

const Navbar: React.FC<{ 
  user: User; 
  onLogout: () => void; 
  activeTab: string; 
  setActiveTab: (t: string) => void;
}> = ({ user, onLogout, activeTab, setActiveTab }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
    <div className="hidden md:flex items-center gap-2 font-bold text-orange-600 text-xl">
      <ChefHat /> <span>VietFood</span>
    </div>
    <div className="flex gap-8 items-center flex-1 justify-around md:justify-end">
      <button 
        onClick={() => setActiveTab('scan')}
        className={`flex flex-col md:flex-row items-center gap-1 transition-colors ${activeTab === 'scan' ? 'text-orange-600' : 'text-slate-500 hover:text-orange-400'}`}
      >
        <Camera size={20} /> <span className="text-xs md:text-sm font-medium">Quét</span>
      </button>
      <button 
        onClick={() => setActiveTab('history')}
        className={`flex flex-col md:flex-row items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-orange-600' : 'text-slate-500 hover:text-orange-400'}`}
      >
        <History size={20} /> <span className="text-xs md:text-sm font-medium">Lịch sử</span>
      </button>
      <button 
        onClick={() => setActiveTab('community')}
        className={`flex flex-col md:flex-row items-center gap-1 transition-colors ${activeTab === 'community' ? 'text-orange-600' : 'text-slate-500 hover:text-orange-400'}`}
      >
        <Users size={20} /> <span className="text-xs md:text-sm font-medium">Cộng đồng</span>
      </button>
      <button 
        onClick={() => setActiveTab('stats')}
        className={`flex flex-col md:flex-row items-center gap-1 transition-colors ${activeTab === 'stats' ? 'text-orange-600' : 'text-slate-500 hover:text-orange-400'}`}
      >
        <PieChart size={20} /> <span className="text-xs md:text-sm font-medium">Thống kê</span>
      </button>
      {user?.role === UserRole.ADMIN && (
        <button 
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col md:flex-row items-center gap-1 transition-colors ${activeTab === 'admin' ? 'text-red-600' : 'text-slate-500 hover:text-red-500'}`}
        >
          <Shield size={20} /> <span className="text-xs md:text-sm font-medium">Quản trị</span>
        </button>
      )}
      <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
      <div className="hidden md:flex items-center gap-3">
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-700">{user.username}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{user.role === UserRole.ADMIN ? 'Quản trị' : 'Thành viên'}</span>
        </div>
        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  </nav>
);

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
  const [isScanning, setIsScanning] = useState(false);
  const [language, setLanguage] = useState<Language>(Language.VIETNAMESE);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth state
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const [currentResult, setCurrentResult] = useState<DishAnalysis | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<{ text: string, links: any[] } | null>(null);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // Admin state
  const [adminStats, setAdminStats] = useState<{ totalUsers: number, totalHistoryItems: number, totalCommunityPosts: number } | null>(null);

  // Helper: auth headers
  const authHeaders = (u: User) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${u.token || ''}`
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('vietfood_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchHistory(parsedUser, 1, '');
    }
    fetchCommunity(1);
    if (user?.role === UserRole.ADMIN) {
      fetchAdminStats();
    }
  }, [activeTab]);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${user?.token || ''}` }
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
        fetchAdminStats(); // Refresh stats
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
    setCurrentResult(null);
    setNearbyPlaces(null);
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

  const shareToCommunity = async (dishId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/community/share', {
        method: 'POST',
        headers: authHeaders(user),
        body: JSON.stringify({ dishId, username: user.username })
      });
      if (res.ok) {
        alert('Đã chia sẻ thành công lên cộng đồng!');
        fetchCommunity(communityPage);
        setHistory(history.map(h => h.id === dishId ? { ...h, isPublic: true } : h));
        if (currentResult?.id === dishId) {
            setCurrentResult({ ...currentResult, isPublic: true });
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Không thể chia sẻ.');
      }
    } catch (err) {
      alert('Lỗi kết nối.');
    }
  };

  const likePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/community/like/${postId}`, { method: 'POST' });
      if (res.ok) {
        const updatedPost = await res.json();
        setCommunityPosts(communityPosts.map(p => p.id === postId ? updatedPost : p));
      }
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  // Phase 2: Upload image to server, get back URL, then analyze
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng tải lên tệp hình ảnh');
      return;
    }

    setIsScanning(true);
    setCurrentResult(null);
    setNearbyPlaces(null);

    try {
      // Phase 2: upload to disk first, get URL back
      const { imageUrl, base64 } = await uploadImage(file, user!);

      const result = await analyzeDish(base64, language);
      const newEntry: DishAnalysis = {
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        userId: user!.id,
        timestamp: Date.now(),
        imageUrl,  // now a server URL, not base64
        language
      };
      
      await fetch('/api/history', {
        method: 'POST',
        headers: authHeaders(user!),
        body: JSON.stringify(newEntry)
      });

      setCurrentResult(newEntry);
      fetchHistory(user!, 1, searchQuery);
    } catch (error) {
      alert('Không thể phân tích hình ảnh. Vui lòng thử lại.');
    } finally {
      setIsScanning(false);
    }
  };

  const findNearby = async () => {
    if (!currentResult) return;
    setIsSearchingPlaces(true);
    
    try {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const result = await findNearbyRestaurants(currentResult.dishName, { latitude, longitude });
        setNearbyPlaces(result);
        setIsSearchingPlaces(false);
        setTimeout(() => {
            document.getElementById('nearby-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }, async (err) => {
        alert("Quyền truy cập vị trí bị từ chối. Sử dụng tìm kiếm chung tại Hà Nội.");
        const result = await findNearbyRestaurants(currentResult.dishName, { latitude: 21.0285, longitude: 105.8542 });
        setNearbyPlaces(result);
        setIsSearchingPlaces(false);
      });
    } catch (error) {
      setIsSearchingPlaces(false);
      alert('Không thể tìm kiếm nhà hàng.');
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
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-orange-100">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-orange-600 p-4 rounded-2xl text-white mb-4 shadow-lg shadow-orange-200">
              <ChefHat size={48} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">VietFood</h1>
            <p className="text-slate-500 mt-2">Khám phá ẩm thực Việt</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button 
              onClick={() => { setIsRegistering(false); setAuthError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${!isRegistering ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LogIn size={18} /> Đăng Nhập
            </button>
            <button 
              onClick={() => { setIsRegistering(true); setAuthError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${isRegistering ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserPlus size={18} /> Đăng Ký
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm flex items-center gap-2 border border-red-100 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={18} />
                <span>{authError}</span>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tên đăng nhập</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-300"
                placeholder={isRegistering ? "Tên bạn muốn dùng" : "Nhập tên đăng nhập"}
                value={loginForm.username}
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mật khẩu</label>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-300"
                placeholder="Nhập mật khẩu"
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 mt-2"
            >
              {isRegistering ? 'Tạo Tài Khoản' : 'Vào Ứng Dụng'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8 max-w-5xl mx-auto px-4">
      <Navbar user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="mt-8">
        {activeTab === 'admin' && user?.role === UserRole.ADMIN && (
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
        )}

        {activeTab === 'scan' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Quét món ăn mới</h2>
                  <p className="text-slate-500">Tải ảnh món ăn Việt Nam lên để nhận mô tả chi tiết</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setLanguage(Language.VIETNAMESE)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === Language.VIETNAMESE ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Tiếng Việt
                  </button>
                  <button 
                    onClick={() => setLanguage(Language.ENGLISH)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${language === Language.ENGLISH ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isScanning}
                />
                <div className={`
                  border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all
                  ${isScanning ? 'bg-slate-50 border-orange-200' : 'bg-orange-50 border-orange-200 group-hover:bg-orange-100 group-hover:border-orange-300'}
                `}>
                  {isScanning ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-orange-600 font-semibold animate-pulse">Đang phân tích món ăn...</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-orange-600 p-5 rounded-2xl text-white mb-4 shadow-lg shadow-orange-200">
                        <Upload size={32} />
                      </div>
                      <p className="text-xl font-bold text-slate-900">Nhấn để tải ảnh hoặc Kéo thả</p>
                      <p className="text-slate-500 mt-2">Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {currentResult && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-500">
                  <div className="grid md:grid-cols-2">
                    <div className="h-64 md:h-auto overflow-hidden">
                      <img src={currentResult.imageUrl} alt="Dish" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-8 space-y-6 flex flex-col justify-between">
                      <div className="space-y-6">
                        <div>
                          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
                            {currentResult.category}
                          </span>
                          <h3 className="text-3xl font-bold text-slate-900">{currentResult.dishName}</h3>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Mô tả</h4>
                            <p className="text-slate-700 leading-relaxed">{currentResult.description}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Lịch sử & Nguồn gốc</h4>
                            <p className="text-slate-700 leading-relaxed italic">{currentResult.history}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Thành phần chính</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {currentResult.ingredients.map((ing, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-sm">
                                  {ing}
                                </span>
                              ))}
                            </div>
                          </div>
                          {currentResult.nutrition && (
                            <div className="pt-4 border-t border-slate-100">
                              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Dinh dưỡng tham khảo / khẩu phần</h4>
                              <div className="grid grid-cols-4 gap-2">
                                <div className="bg-orange-50 rounded-xl p-3 text-center">
                                  <div className="text-xl font-bold text-orange-600">{currentResult.nutrition.calories}</div>
                                  <div className="text-[10px] text-orange-400 uppercase font-bold mt-1">Calo</div>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-3 text-center">
                                  <div className="text-xl font-bold text-blue-600">{currentResult.nutrition.protein}g</div>
                                  <div className="text-[10px] text-blue-400 uppercase font-bold mt-1">Đạm</div>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                                  <div className="text-xl font-bold text-emerald-600">{currentResult.nutrition.carbs}g</div>
                                  <div className="text-[10px] text-emerald-400 uppercase font-bold mt-1">Carb</div>
                                </div>
                                <div className="bg-rose-50 rounded-xl p-3 text-center">
                                  <div className="text-xl font-bold text-rose-600">{currentResult.nutrition.fat}g</div>
                                  <div className="text-[10px] text-rose-400 uppercase font-bold mt-1">Béo</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex gap-3">
                        <button 
                          onClick={findNearby}
                          disabled={isSearchingPlaces}
                          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                          {isSearchingPlaces ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <MapPin size={20} />
                          )}
                          Tìm nhà hàng
                        </button>
                        <button 
                          onClick={() => shareToCommunity(currentResult.id)}
                          disabled={currentResult.isPublic}
                          className={`flex-1 flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all ${currentResult.isPublic ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-100'}`}
                        >
                          {currentResult.isPublic ? (
                            <>Đã chia sẻ</>
                          ) : (
                            <><Share2 size={20} /> Chia sẻ</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {nearbyPlaces && (
                  <div id="nearby-results" className="bg-white rounded-3xl shadow-lg border border-orange-100 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                        <Navigation size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Địa điểm gợi ý</h3>
                        <p className="text-sm text-slate-500">Dựa trên vị trí hiện tại và món ăn của bạn</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 text-sm uppercase tracking-widest px-1">Kết quả hàng đầu từ Google Maps</h4>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {nearbyPlaces.links.map((link, i) => (
                            <a 
                              key={i}
                              href={link.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="flex flex-col justify-between bg-white p-5 rounded-2xl border border-slate-100 hover:border-orange-400 hover:shadow-md transition-all group relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 group-hover:text-orange-600 transition-opacity">
                                  <ExternalLink size={16} />
                              </div>
                              <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nhà hàng {i + 1}</span>
                                  <span className="text-base font-bold text-slate-900 leading-tight block pr-4">{link.title}</span>
                              </div>
                              <div className="mt-4 flex items-center text-xs font-bold text-orange-600 gap-1 uppercase tracking-wider">
                                  Chỉ đường <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </div>
                            </a>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Lịch sử quét <span className="text-base text-slate-400 font-normal">({historyTotal} món)</span></h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm món ăn..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setHistoryPage(1);
                    fetchHistory(user!, 1, e.target.value);
                  }}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
            </div>

            {history.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
                <div className="bg-slate-100 p-4 rounded-full text-slate-400 mb-4">
                  <History size={48} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có lịch sử'}</h3>
                <p className="text-slate-500 mt-2">{searchQuery ? `Không có món nào khớp với "${searchQuery}"` : 'Hành trình khám phá ẩm thực của bạn bắt đầu từ đây!'}</p>
                {!searchQuery && (
                  <button 
                    onClick={() => setActiveTab('scan')}
                    className="mt-6 px-6 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-100"
                  >
                    Bắt đầu quét ngay
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  {history.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex h-40 group hover:shadow-md transition-shadow">
                      <div className="w-1/3 h-full overflow-hidden">
                        <img src={item.imageUrl} alt={item.dishName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 mt-1">{item.dishName}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => {
                              setCurrentResult(item);
                              setActiveTab('scan');
                            }}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                          >
                            Xem chi tiết <ChevronRight size={14} />
                          </button>
                          <button 
                            onClick={() => deleteHistoryItem(item.id)}
                            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {historyTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => { const p = historyPage - 1; setHistoryPage(p); fetchHistory(user!, p, searchQuery); }}
                      disabled={historyPage === 1}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-40 hover:border-orange-400 transition-all"
                    >← Trước</button>
                    <span className="text-sm text-slate-500">Trang {historyPage} / {historyTotalPages}</span>
                    <button
                      onClick={() => { const p = historyPage + 1; setHistoryPage(p); fetchHistory(user!, p, searchQuery); }}
                      disabled={historyPage === historyTotalPages}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold disabled:opacity-40 hover:border-orange-400 transition-all"
                    >Sau →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'community' && (
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
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8 pb-12">
            <h2 className="text-2xl font-bold text-slate-900">Số liệu ẩm thực của bạn</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Phân loại món ăn</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(() => {
                      const counts: any = {};
                      history.forEach(item => {
                        counts[item.category] = (counts[item.category] || 0) + 1;
                      });
                      return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {history.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={['#ea580c', '#f97316', '#fb923c', '#fdba74'][index % 4]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Hoạt động quét</h3>
                <div className="h-[300px] w-full flex items-center justify-center">
                  {history.length === 0 ? (
                    <p className="text-slate-400 italic">Chưa có dữ liệu thống kê</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <RPieChart>
                        <Pie
                          data={(() => {
                            const counts: any = {};
                            history.forEach(item => {
                              const date = new Date(item.timestamp).toLocaleDateString();
                              counts[date] = (counts[date] || 0) + 1;
                            });
                            return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
                          })()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {history.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#ea580c', '#0f172a', '#64748b'][index % 3]} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </RPieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-600 text-white p-6 rounded-2xl">
                <p className="text-sm font-medium opacity-80">Tổng lượt quét</p>
                <h4 className="text-3xl font-bold mt-1">{history.length}</h4>
              </div>
              <div className="bg-slate-900 text-white p-6 rounded-2xl">
                <p className="text-sm font-medium opacity-80">Số danh mục</p>
                <h4 className="text-3xl font-bold mt-1">
                  {new Set(history.map(h => h.category)).size}
                </h4>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                <p className="text-sm font-medium text-slate-500">Món quét nhiều nhất</p>
                <h4 className="text-xl font-bold text-slate-900 mt-1 truncate">
                  {(() => {
                    const counts: any = {};
                    history.forEach(item => {
                      counts[item.dishName] = (counts[item.dishName] || 0) + 1;
                    });
                    return Object.entries(counts).sort((a:any, b:any) => b[1] - a[1])[0]?.[0] || 'N/A';
                  })()}
                </h4>
              </div>
              <div className="bg-white border border-slate-200 p-6 rounded-2xl">
                <p className="text-sm font-medium text-slate-500">Loại tài khoản</p>
                <h4 className="text-xl font-bold text-slate-900 mt-1 uppercase">
                  {user.role === UserRole.ADMIN ? 'Quản trị' : 'Thành viên'}
                </h4>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
