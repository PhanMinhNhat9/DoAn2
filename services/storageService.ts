
import { FoodCaption } from '../types';

const HISTORY_KEY = 'vietfood_history';

export const storageService = {
  saveCaption: (caption: FoodCaption) => {
    const history = storageService.getHistory();
    history.unshift(caption);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  getHistory: (): FoodCaption[] => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  },

  deleteCaption: (id: string) => {
    const history = storageService.getHistory().filter(c => c.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  },

  updateCaption: (id: string, updates: Partial<FoodCaption>) => {
    const history = storageService.getHistory().map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
};
