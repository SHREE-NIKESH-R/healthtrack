import axios from 'axios';

const BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_API_URL || "/api"
    : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Auth token interceptor
api.interceptors.request.use(config => {
    const token = localStorage.getItem('ht_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// 401 → logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err && err.response && err.response.status === 401) {
      localStorage.removeItem("ht_token");
      localStorage.removeItem("ht_user");
      window.location.href = "/auth";
    }
    return Promise.reject(err);
  }, // ❗ no semicolon here
);

// Auth
export const authApi = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data)
};

// Profile
export const profileApi = {
    get: () => api.get('/profile'),
    create: (data) => api.post('/profile', data),
    update: (data) => api.put('/profile', data)
};

// Records
export const recordsApi = {
    today: () => api.get('/records/today'),
    summary: (days = 7) => api.get(`/records/summary?days=${days}`),
    all: (page = 1) => api.get(`/records?page=${page}`),
    save: (data) => api.post('/records', data)
};

// Insights
export const insightsApi = {
    get: () => api.get('/insights')
};

// AI / Baymax
export const aiApi = {
    status: () => api.get('/ai/status'),
    chat: (message, history) => api.post('/ai/chat', { message, history })
};

// Goals
export const goalsApi = {
    getAll: () => api.get('/goals'),
    create: (data) => api.post('/goals', data),
    update: (id, data) => api.put(`/goals/${id}`, data),
    delete: (id) => api.delete(`/goals/${id}`),
    checkToday: () => api.post('/goals/check-today')
};

// Wellness
export const wellnessApi = {
    dashboard: () => api.get('/wellness/dashboard'),
    scores: (days = 30) => api.get(`/wellness/score?days=${days}`),
    calculateToday: () => api.post('/wellness/calculate-today')
};

export default api;