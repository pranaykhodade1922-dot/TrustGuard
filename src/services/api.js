/**
 * Central API Client for TrustGuard AI
 * All backend network communications pass through this service layer.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Retrieve the current JWT authentication token from secure local storage
 */
export function getStoredToken() {
  try {
    return localStorage.getItem('trustguard_token') || null;
  } catch {
    return null;
  }
}

/**
 * Persist or remove the JWT authentication token
 */
export function setStoredToken(token) {
  try {
    if (token) {
      localStorage.setItem('trustguard_token', token);
    } else {
      localStorage.removeItem('trustguard_token');
    }
  } catch (err) {
    console.error('Failed to update local token storage:', err);
  }
}

/**
 * Low-level HTTP request dispatcher with JWT bearer injection
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getStoredToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkError) {
    const error = new Error('Network error: Unable to connect to TrustGuard API server.');
    error.isNetworkError = true;
    error.status = 0;
    throw error;
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status} (${response.statusText})`;
    const error = new Error(message);
    error.status = response.status;
    error.statusText = response.statusText;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Health & Service Monitoring
  health: {
    check: () => request('/health'),
  },

  // Authentication Endpoints
  auth: {
    signup: async (email, password) => {
      const result = await request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (result.token) {
        setStoredToken(result.token);
      }
      return result;
    },

    login: async (email, password) => {
      const result = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (result.token) {
        setStoredToken(result.token);
      }
      return result;
    },

    getMe: () => request('/auth/me'),

    logout: () => {
      setStoredToken(null);
    },
  },

  // Scan History & Audit Records (User Isolated)
  scans: {
    list: () => request('/scans'),
    getById: (id) => request(`/scans/${encodeURIComponent(id)}`),
    updateAction: (id, action) =>
      request(`/scans/${encodeURIComponent(id)}/action`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
      }),
  },

  // Security Analysis Engine (Phase 2)
  analyze: {
    scan: (inputText) =>
      request('/analyze', {
        method: 'POST',
        body: JSON.stringify({ inputText }),
      }),
  },
};

export default api;
