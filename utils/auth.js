// Utility functions for authentication

// Get admin token from localStorage
export function getAdminToken() {
  try {
    // Try to get token from session
    const session = localStorage.getItem('admin_session_reviewqeem');
    if (session) {
      const sessionData = JSON.parse(session);
      if (sessionData.token) {
        return sessionData.token;
      }
    }
    
    // Fallback to ADMIN_TOKEN
    return localStorage.getItem('ADMIN_TOKEN');
  } catch (error) {
    return null;
  }
}

// Get auth headers for API requests
export function getAuthHeaders() {
  const token = getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Check if admin is authenticated
export function isAdminAuthenticated() {
  const token = getAdminToken();
  if (!token) return false;
  
  try {
    const session = localStorage.getItem('admin_session_reviewqeem');
    if (session) {
      const sessionData = JSON.parse(session);
      if (sessionData.expires && Date.now() < sessionData.expires) {
        return true;
      }
    }
  } catch (error) {
    return false;
  }
  
  return false;
}
