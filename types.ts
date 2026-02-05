
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface FoodCaption {
  id: string;
  userId: string;
  imageUrl: string;
  foodName: string;
  category: string;
  description: string;
  ingredients: string[];
  language: 'vi' | 'en';
  timestamp: number;
  rating?: number;
  userFeedback?: string;
}

export interface GeminiResponse {
  foodName: string;
  category: string;
  description: string;
  ingredients: string[];
}
