import React from 'react';
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
import { DishAnalysis, User, UserRole } from '../types';

interface StatsTabProps {
  user: User;
  history: DishAnalysis[];
}

export const StatsTab: React.FC<StatsTabProps> = ({ user, history }) => {
  return (
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
  );
};
