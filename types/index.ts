// ==================== Types الأساسية ====================

export interface Review {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  gameTitle: string;
  gameSlug: string;
  coverImage?: string;
  screenshots?: string[];
  content: string;
  summary: string;
  rating: number;
  category: string;
  tags: string[];
  releaseDate?: string;
  pros?: string[];
  cons?: string[];
  status: 'draft' | 'published' | 'archived';
  featured?: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  author?: string;
}

export interface Comment {
  _id?: string;
  id?: string;
  reviewId: string;
  userName: string;
  userEmail: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected' | 'reported';
  likes: number;
  reports?: Array<{
    reason: string;
    reportedAt: string;
  }>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  platforms: string[];
  releaseDate?: string;
  developer?: string;
  publisher?: string;
  genre: string[];
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  password?: string; // hashed (optional in responses)
  role: 'admin' | 'superadmin';
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface ReviewsResponse extends ApiResponse {
  reviews: Review[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CommentsResponse extends ApiResponse {
  comments: Comment[];
  count?: number;
}
