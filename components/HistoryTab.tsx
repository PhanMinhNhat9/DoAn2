import React from 'react';
import { History, Search, ChevronRight } from 'lucide-react';
import { DishAnalysis, User } from '../types';

interface HistoryTabProps {
  user: User;
  history: DishAnalysis[];
  historyTotal: number;
  historyPage: number;
  historyTotalPages: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  fetchHistory: (user: User, page: number, query: string) => void;
  setActiveTab: (tab: string) => void;
  deleteHistoryItem: (id: string) => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  user,
  history,
  historyTotal,
  historyPage,
  historyTotalPages,
  searchQuery,
  setSearchQuery,
  fetchHistory,
  setActiveTab,
  deleteHistoryItem
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          Lịch sử quét <span className="text-base text-slate-400 font-normal">({historyTotal} món)</span>
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              fetchHistory(user, 1, e.target.value);
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
                      onClick={() => setActiveTab('scan')}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      Xem chi tiết <ChevronRight size={14} />
                    </button>
                    <button 
                      onClick={() => deleteHistoryItem(item.id)}
                      className="text-xs text-slate-400 hover:text-red-500"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {historyTotalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button 
                disabled={historyPage === 1}
                onClick={() => fetchHistory(user, historyPage - 1, searchQuery)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 text-sm font-medium"
              >
                Trước
              </button>
              <span className="text-sm font-medium text-slate-500">
                {historyPage} / {historyTotalPages}
              </span>
              <button 
                disabled={historyPage === historyTotalPages}
                onClick={() => fetchHistory(user, historyPage + 1, searchQuery)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl disabled:opacity-50 text-sm font-medium"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
