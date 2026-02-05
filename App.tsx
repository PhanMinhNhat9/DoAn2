
import React, { useState, useEffect, useCallback } from 'react';
import { User, FoodCaption, UserRole } from './types';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { generateFoodCaption } from './services/geminiService';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'admin' | 'stats'>('home');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<FoodCaption[]>([]);
  const [currentCaption, setCurrentCaption] = useState<FoodCaption | null>(null);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  
  // Auth Form State
  const [usernameInput, setUsernameInput] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setHistory(storageService.getHistory());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    const loggedInUser = authService.login(usernameInput);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setActiveTab('home');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng tải lên định dạng ảnh.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB.');
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const result = await generateFoodCaption(base64, lang);
        
        const newCaption: FoodCaption = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user?.id || 'guest',
          imageUrl: base64,
          foodName: result.foodName,
          category: result.category,
          description: result.description,
          ingredients: result.ingredients,
          language: lang,
          timestamp: Date.now()
        };

        setCurrentCaption(newCaption);
        storageService.saveCaption(newCaption);
        setHistory(storageService.getHistory());
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi xử lý ảnh. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleRating = (id: string, rating: number) => {
    storageService.updateCaption(id, { rating });
    setHistory(storageService.getHistory());
    if (currentCaption?.id === id) {
      setCurrentCaption(prev => prev ? { ...prev, rating } : null);
    }
  };

  const deleteFromHistory = (id: string) => {
    storageService.deleteCaption(id);
    setHistory(storageService.getHistory());
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">VietFood AI</h1>
            <p className="text-slate-500 mt-2">Đăng nhập để bắt đầu nhận diện món ăn</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập</label>
              <input 
                type="text" 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Nhập tên của bạn (hoặc 'admin')"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition outline-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Vào ứng dụng
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-400">
            Dùng "admin" để vào chế độ quản trị
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'home' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Quét món ăn mới</h2>
              <p className="text-slate-500">Tải ảnh món ăn Việt Nam lên để nhận mô tả chi tiết</p>
            </div>
            <div className="flex bg-slate-200 p-1 rounded-lg self-start">
              <button 
                onClick={() => setLang('vi')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${lang === 'vi' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-600'}`}
              >
                Tiếng Việt
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${lang === 'en' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-600'}`}
              >
                English
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Area */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                  <p className="text-slate-600 font-medium">AI đang phân tích món ăn...</p>
                </div>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition border-2 border-dashed border-slate-200 rounded-xl p-8 group">
                  <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-3xl group-hover:scale-110 transition mb-4">
                    📸
                  </div>
                  <p className="text-lg font-semibold text-slate-700">Chọn hoặc Chụp ảnh</p>
                  <p className="text-sm text-slate-400 mt-1">Định dạng JPG, PNG (Max 5MB)</p>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Result Area */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              {currentCaption ? (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div className="relative group">
                    <img 
                      src={currentCaption.imageUrl} 
                      alt="Food" 
                      className="w-full h-48 object-cover rounded-xl shadow-md"
                    />
                    <div className="absolute top-2 right-2 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-xs font-bold text-orange-600 uppercase tracking-wide">
                      {currentCaption.category}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900">{currentCaption.foodName}</h3>
                    <p className="text-slate-600 mt-4 leading-relaxed italic border-l-4 border-orange-500 pl-4">
                      "{currentCaption.description}"
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Thành phần chính</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentCaption.ingredients.map((ing, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Đánh giá độ chính xác:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button 
                            key={star}
                            onClick={() => handleRating(currentCaption.id, star)}
                            className={`text-xl transition ${currentCaption.rating && currentCaption.rating >= star ? 'text-yellow-400' : 'text-slate-300 hover:text-yellow-200'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 italic">
                  <span className="text-4xl mb-4 opacity-20">🍽️</span>
                  <p>Thông tin món ăn sẽ xuất hiện tại đây sau khi bạn tải ảnh lên.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="animate-in fade-in duration-500">
          <header className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Lịch sử của bạn</h2>
            <p className="text-slate-500">Xem lại các món ăn bạn đã quét</p>
          </header>

          {history.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-400">Chưa có lịch sử. Hãy thử quét món ăn đầu tiên!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition group">
                  <div className="relative h-48 overflow-hidden">
                    <img src={item.imageUrl} alt={item.foodName} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <button 
                      onClick={() => deleteFromHistory(item.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 truncate flex-grow mr-2">{item.foodName}</h4>
                      <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded uppercase">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center mt-auto text-xs text-slate-400">
                      <span>{new Date(item.timestamp).toLocaleDateString('vi-VN')}</span>
                      <div className="text-yellow-400">
                        {item.rating ? '★'.repeat(item.rating) : 'Chưa đánh giá'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="animate-in fade-in duration-500">
          <header className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Thống kê ứng dụng</h2>
            <p className="text-slate-500">Dữ liệu tổng hợp từ các lần quét</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Tổng số ảnh đã quét</p>
              <h4 className="text-4xl font-bold text-slate-800 mt-2">{history.length}</h4>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Món được quét nhiều nhất</p>
              <h4 className="text-2xl font-bold text-orange-600 mt-2 truncate">
                {history.length > 0 ? (
                   [...history].sort((a,b) => 
                    history.filter(x => x.foodName === b.foodName).length - 
                    history.filter(x => x.foodName === a.foodName).length
                  )[0].foodName
                ) : 'N/A'}
              </h4>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Đánh giá trung bình</p>
              <h4 className="text-4xl font-bold text-yellow-500 mt-2">
                {history.filter(h => h.rating).length > 0 ? (
                  (history.reduce((acc, curr) => acc + (curr.rating || 0), 0) / history.filter(h => h.rating).length).toFixed(1)
                ) : '0.0'}
              </h4>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="animate-in fade-in duration-500">
          <header className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Bảng Quản Trị</h2>
            <p className="text-slate-500">Quản lý người dùng và dữ liệu hệ thống</p>
          </header>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Món Ăn</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Người Quét</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ngày Giờ</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Đánh Giá</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={item.imageUrl} className="w-8 h-8 rounded object-cover" />
                        <span className="font-medium text-slate-800">{item.foodName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.userId}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(item.timestamp).toLocaleString('vi-VN')}</td>
                    <td className="px-6 py-4">
                      <span className="text-yellow-500 font-bold">{item.rating || '-'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => deleteFromHistory(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Gỡ bỏ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
