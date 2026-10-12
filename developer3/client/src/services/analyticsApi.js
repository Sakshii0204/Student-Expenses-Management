const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('sem_auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(json?.message || 'Analytics query failed');
    error.status = res.status;
    throw error;
  }

  return json;
}

export const analyticsApi = {
  getSummary: () => request('/analytics/summary', { method: 'GET' }),

  getByCategory: (timeframe = 'all') =>
    request(`/analytics/by-category?timeframe=${encodeURIComponent(timeframe)}`, { method: 'GET' }),

  getMonthlyTrend: () => request('/analytics/monthly-trend', { method: 'GET' }),

  getRecentTransactions: (limit = 5) =>
    request(`/analytics/recent?limit=${limit}`, { method: 'GET' }),
};
