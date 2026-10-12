const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Resilient HTTP Request Wrapper
 * Bounded retries for idempotent GET requests only. Never retries mutations.
 */
export async function apiRequest(endpoint, options = {}, retriesLeft = 2) {
  const token = localStorage.getItem('sem_auth_token');
  const method = (options.method || 'GET').toUpperCase();
  const isIdempotent = method === 'GET';

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check for session expiry
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('sem_session_expired'));
    }

    // Attempt retry on transient 5xx server errors for safe GET requests
    if (isIdempotent && [502, 503, 504].includes(response.status) && retriesLeft > 0) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return apiRequest(endpoint, options, retriesLeft - 1);
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const error = new Error(data?.message || `HTTP request failed with status ${response.status}`);
      error.status = response.status;
      error.errors = data?.errors || null;
      throw error;
    }

    return data;
  } catch (err) {
    // Retry on network drops for idempotent GET requests only
    if (isIdempotent && err.name === 'TypeError' && retriesLeft > 0) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return apiRequest(endpoint, options, retriesLeft - 1);
    }
    throw err;
  }
}

/**
 * Authentication Endpoints (Developer 1)
 */
export const authApi = {
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (payload) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProfile: () =>
    apiRequest('/auth/me', {
      method: 'GET',
    }),

  logout: () =>
    apiRequest('/auth/logout', {
      method: 'POST',
    }),
};

/**
 * Expense Management Endpoints (Developer 2)
 */
export const expenseApi = {
  getExpenses: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.limit) params.append('limit', String(filters.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/expenses${query}`, { method: 'GET' });
  },

  getExpenseById: (id) => apiRequest(`/expenses/${id}`, { method: 'GET' }),

  createExpense: (data) =>
    apiRequest('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateExpense: (id, data) =>
    apiRequest(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteExpense: (id) =>
    apiRequest(`/expenses/${id}`, {
      method: 'DELETE',
    }),

  /**
   * Export expenses as downloadable CSV file
   */
  downloadCSV: async (filters = {}) => {
    const token = localStorage.getItem('sem_auth_token');
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/expenses/export/csv${query}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      throw new Error(errJson?.message || 'Failed to download CSV export');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStamp = new Date().toISOString().split('T')[0];
    link.download = `student-expenses-${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true };
  },
};

/**
 * Analytics and Reporting Endpoints (Developer 3)
 */
export const analyticsApi = {
  getSummary: () => apiRequest('/analytics/summary', { method: 'GET' }),

  getByCategory: (timeframe = 'all') =>
    apiRequest(`/analytics/by-category?timeframe=${encodeURIComponent(timeframe)}`, {
      method: 'GET',
    }),

  getMonthlyTrend: () => apiRequest('/analytics/monthly-trend', { method: 'GET' }),

  getRecentTransactions: (limit = 5) =>
    apiRequest(`/analytics/recent?limit=${limit}`, { method: 'GET' }),
};

/**
 * Monthly Budget Endpoints (Phase 3)
 */
export const budgetApi = {
  getCurrentBudget: (month = null) => {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    return apiRequest(`/budgets/current${query}`, { method: 'GET' });
  },

  setMonthlyBudget: (payload) =>
    apiRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

/**
 * System Health
 */
export const systemApi = {
  getHealth: () => apiRequest('/health', { method: 'GET' }),
};
