// ==================== API Configuration ====================

// Base URL for API calls
// Uses environment variable in production, localhost in development
export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.NEXT_PUBLIC_SITE_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');

// Full API URL
export const API_URL = `${API_BASE_URL}/api`;

// Helper function to get full URL for uploads
export function getUploadUrl(path: string): string {
  if (!path) return '/images/placeholder.jpg';
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If starts with /api/, return as is
  if (path.startsWith('/api/')) {
    return path;
  }
  
  // Otherwise, construct API upload URL
  if (path.startsWith('uploads/') || path.startsWith('/uploads/')) {
    const cleanPath = path.replace(/^\/?uploads\//, '');
    return `/api/uploads/${cleanPath}`;
  }
  
  return `/api/uploads/${path}`;
}
