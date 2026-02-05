
import { User, UserRole } from '../types';

const AUTH_KEY = 'vietfood_auth_user';

export const authService = {
  getCurrentUser: (): User | null => {
    const saved = localStorage.getItem(AUTH_KEY);
    return saved ? JSON.parse(saved) : null;
  },

  login: (username: string): User => {
    const role = username.toLowerCase() === 'admin' ? UserRole.ADMIN : UserRole.USER;
    const user: User = { id: Math.random().toString(36).substr(2, 9), username, role };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return user;
  },

  logout: () => {
    localStorage.removeItem(AUTH_KEY);
  }
};
