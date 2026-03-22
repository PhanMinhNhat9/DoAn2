
export enum Language {
  VIETNAMESE = 'vi',
  ENGLISH = 'en'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  token?: string; // JWT token (Phase 2)
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  page: number;
}

export interface DishAnalysis {
  id: string;
  userId: string; // Added to isolate history
  timestamp: number;
  imageUrl: string;
  dishName: string;
  category: string;
  description: string;
  history: string;
  ingredients: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  rating?: number;
  userNote?: string;
  language: Language;
  isPublic?: boolean; // Added for community sharing
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  timestamp: number;
}

export interface CommunityPost extends DishAnalysis {
  username: string; // To show who shared it
  likes: number;
  comments: Comment[];
}

export interface MapGroundingResult {
  title: string;
  uri: string;
}
