
import React, { useState, useEffect } from 'react';
import { 
  Heart as Favorite, 
  MessageCircle as ChatBubble, 
  Users as Groups,
  RefreshCw
} from 'lucide-react';
import { User } from '../types';

const API_BASE_URL = 'http://localhost/DoAn2/api';

interface NotificationPageProps {
    user: User | null;
}

const NotificationPage: React.FC<NotificationPageProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${API_BASE_URL}/get_notifications.php?user_id=${user.id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
            setNotifications(data);
        }
      } catch (e) { 
          console.error(e); 
      } finally {
          setLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  if (!user) {
      return (
          <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-slate-500">Vui lòng đăng nhập để xem thông báo.</p>
          </div>
      );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Thông báo</h1>
      
      {loading ? (
          <div className="flex justify-center py-10">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-white/5 p-4 rounded-xl flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-slate-100 shrink-0">
                  <img src={n.sender_avatar} alt={n.sender_name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm dark:text-white leading-snug">
                  <span className="font-bold">{n.sender_name}</span> {n.display_content}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <div className={`p-1 rounded-full ${n.type === 'like' ? 'text-rose-500' : n.type === 'comment' ? 'text-blue-500' : 'text-primary'}`}>
                        {n.type === 'like' ? <Favorite className="w-3 h-3 fill-current" /> : n.type === 'comment' ? <ChatBubble className="w-3 h-3 fill-current" /> : <Groups className="w-3 h-3" />}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{n.time_ago}</p>
                </div>
              </div>
            </div>
          ))}
          {!notifications.length && (
              <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-2xl border border-dashed border-slate-300 dark:border-white/10">
                  <p className="text-slate-500 italic">Bạn chưa có thông báo nào mới.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
