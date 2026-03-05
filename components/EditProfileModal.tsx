
import React, { useState } from 'react';
import { User } from '../types';

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (data: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    handle: user.handle || '',
    bio: (user as any).bio || '',
    location: user.location || '',
    avatar: user.avatar || ''
  });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="w-full max-w-md bg-white dark:bg-surface-dark rounded-2xl shadow-2xl z-10 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold dark:text-white">Chỉnh sửa Hồ sơ</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Tên hiển thị</label>
            <input 
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-background-dark dark:text-white border-none focus:ring-2 focus:ring-primary/50 transition-all" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Tiểu sử (Bio)</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-background-dark dark:text-white border-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" 
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              placeholder="Kể về niềm đam mê ẩm thực của bạn..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Vị trí</label>
            <input 
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-background-dark dark:text-white border-none focus:ring-2 focus:ring-primary/50 transition-all" 
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
              placeholder="VD: Hà Nội, Việt Nam"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Link Ảnh Đại Diện (URL)</label>
            <input 
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-background-dark dark:text-white border-none focus:ring-2 focus:ring-primary/50 transition-all" 
              value={formData.avatar}
              onChange={e => setFormData({...formData, avatar: e.target.value})}
            />
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-white/5 mt-4 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5 transition-all">Hủy</button>
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 py-3 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            Lưu Thay Đổi
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
