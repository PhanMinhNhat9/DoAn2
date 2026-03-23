import React, { useState } from 'react';
import { ChevronRight, ExternalLink, MapPin, Navigation, Share2, Upload } from 'lucide-react';
import { User, DishAnalysis, Language } from '../types';

interface ScanTabProps {
  user: User;
  activeTab: string;
  handleLogout: () => void;
  authHeaders: (u: User) => HeadersInit;
  uploadImage: (file: File, u: User) => Promise<{ imageUrl: string; base64: string }>;
  fetchHistory: (u: User, page: number, q: string) => void;
  currentResult: DishAnalysis | null;
  setCurrentResult: (result: DishAnalysis | null) => void;
}

export const ScanTab: React.FC<ScanTabProps> = ({ user, activeTab, handleLogout, authHeaders, uploadImage, fetchHistory, currentResult, setCurrentResult }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState<{ text: string, links: any[] } | null>(null);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [language, setLanguage] = useState<Language>(Language.VIETNAMESE);

  if (activeTab !== 'scan') return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setIsScanning(true);
    setCurrentResult(null);
    setNearbyPlaces(null);

    try {
      // Phase 2: upload to disk first, get URL back
      const { imageUrl, base64 } = await uploadImage(file, user);

      // Call backend /api/analyze — Gemini runs server-side, key never exposed to client
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: authHeaders(user),
        body: JSON.stringify({ base64Image: base64, language })
      });
      if (analyzeRes.status === 401) { handleLogout(); return; }
      if (!analyzeRes.ok) {
        const err = await analyzeRes.json();
        throw new Error(err.error || 'Analysis failed');
      }
      const result = await analyzeRes.json();
      const newEntry: DishAnalysis = {
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        timestamp: Date.now(),
        imageUrl,  // now a server URL, not base64
        language
      };
      
      await fetch('/api/history', {
        method: 'POST',
        headers: authHeaders(user),
        body: JSON.stringify(newEntry)
      });

      setCurrentResult(newEntry);
      fetchHistory(user, 1, '');
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
      const runSearch = async (lat: number, lng: number) => {
        const nearbyRes = await fetch('/api/nearby', {
          method: 'POST',
          headers: authHeaders(user),
          body: JSON.stringify({ dishName: currentResult.dishName, latitude: lat, longitude: lng })
        });
        if (!nearbyRes.ok) throw new Error('Search failed');
        return nearbyRes.json();
      };

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const result = await runSearch(latitude, longitude);
          setNearbyPlaces(result);
          setIsSearchingPlaces(false);
          setTimeout(() => {
            document.getElementById('nearby-results')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        },
        async () => {
          alert('Quyền truy cập vị trí bị từ chối. Sử dụng tìm kiếm chung tại Hà Nội.');
          const result = await runSearch(21.0285, 105.8542);
          setNearbyPlaces(result);
          setIsSearchingPlaces(false);
        }
      );
    } catch (error) {
      setIsSearchingPlaces(false);
      alert('Không thể tìm kiếm nhà hàng.');
    }
  };

  const shareToCommunity = async (dishId: string) => {
    try {
      const res = await fetch(`/api/community/share`, {
        method: 'POST',
        headers: authHeaders(user),
        body: JSON.stringify({ dishId, username: user.username })
      });
      if (res.ok) {
        alert('Đã chia sẻ công khai lên cộng đồng!');
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Quét món ăn mới</h2>
            <p className="text-slate-500 mt-1">Tải ảnh món ăn Việt Nam lên để nhận mô tả chi tiết</p>
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
  );
};
