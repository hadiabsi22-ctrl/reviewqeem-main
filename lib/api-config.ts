// ==================== API Configuration ====================

export const getApiBaseUrl = (): string => {
  // في Next.js، نستخدم relative paths للـ API routes
  if (typeof window !== 'undefined') {
    // Client-side
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
    const port = window.location.port || '3001';
    return isLocal ? `http://127.0.0.1:${port}/api` : '/api';
  }
  // Server-side
  return process.env.NEXT_PUBLIC_API_URL || '/api';
};

export const API_ENDPOINTS = {
  REVIEWS: {
    ALL: '/reviews',
    PUBLISHED: '/reviews/published',
    BY_ID: (id: string) => `/reviews/${id}`,
    BY_SLUG: (slug: string) => `/reviews/slug/${slug}`,
    CREATE: '/reviews',
    UPDATE: (id: string) => `/reviews/${id}`,
    DELETE: (id: string) => `/reviews/${id}`,
  },
  COMMENTS: {
    BY_REVIEW: (reviewId: string) => `/comments/review/${reviewId}`,
    CREATE: '/comments',
    LIKE: (id: string) => `/comments/${id}/like`,
    REPORT: (id: string) => `/comments/${id}/report`,
  },
  GAMES: {
    ALL: '/games',
    BY_ID: (id: string) => `/games/${id}`,
    BY_SLUG: (slug: string) => `/games/slug/${slug}`,
  },
  ADMIN: {
    LOGIN: '/admin/auth/login',
    LOGOUT: '/admin/auth/logout',
    VERIFY: '/admin/auth/verify',
  },
  UPLOAD: {
    SINGLE: '/upload/single',
    MULTIPLE: '/upload/multiple',
  },
  STATS: '/stats',
} as const;
