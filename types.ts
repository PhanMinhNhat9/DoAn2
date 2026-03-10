
export interface UserRole {
  ADMIN: 'ADMIN';
  USER: 'USER';
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  location: string;
  posts: number;
  followers: string;
  following: string;
  bio: string;
  role: 'ADMIN' | 'USER';
}

export interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    location: string;
    followers: number;
    following: number;
    bio: string;
    isFollowing: boolean;
  };
  image: string;
  caption: string;
  aiAnalysis?: string;
  recipe?: string;
  likes: number;
  comments: number;
  time: string;
  tags: string[];
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

export interface UserAnalytics {
  overview: {
    posts: number;
    likes: number;
    followers: number;
    following: number;
    avgLikes: number;
  };
  topPost: any;
  recentActivity: any[];
}
