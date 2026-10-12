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
    const error = new Error(json?.message || 'Expense request failed');
    error.status = res.status;
    error.errors = json?.errors || null;
    throw error;
  }

  return json;
}

export const expenseApi = {
  getExpenses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/expenses${queryString}`, { method: 'GET' });
  },

  getExpenseById: (id) => request(`/expenses/${id}`, { method: 'GET' }),

  createExpense: (data) =>
    request('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateExpense: (id, data) =>
    request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteExpense: (id) =>
    request(`/expenses/${id}`, {
      method: 'DELETE',
    }),
};
