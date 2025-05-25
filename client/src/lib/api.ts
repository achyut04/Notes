import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface AuthResponse {
  token: string;
}

export interface SummaryResponse {
  summary: string;
}

export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (name : string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },
};

export const notesAPI = {
  getAll: async (): Promise<Note[]> => {
    const response = await api.get('/notes');
    return response.data;
  },

  getById: async (id: string): Promise<Note> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  create: async (title: string, content: string): Promise<Note> => {
    const response = await api.post('/notes', { title, content });
    return response.data;
  },

  update: async (id: string, title: string, content: string): Promise<Note> => {
    const response = await api.put(`/notes/${id}`, { title, content });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },

  summarize: async (id: string): Promise<SummaryResponse> => {
    const response = await api.post(`/summarize/${id}`);
    return response.data;
  },
};

export default api;