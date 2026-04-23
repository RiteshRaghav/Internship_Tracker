import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Internship API
export const internshipApi = {
  getAllInternships: (userId) => api.get(`/internships?userId=${userId}`),
  createInternship: (internshipData) => api.post('/internships', internshipData),
  updateInternship: (id, internshipData) => api.put(`/internships/${id}`, internshipData),
  deleteInternship: (id) => api.delete(`/internships/${id}`),
  updateInternshipStatus: (id, status) => api.put(`/internships/${id}?status=${status}`, { status }),
  searchInternships: (company, userId) => api.get(`/internships/search?company=${company}&userId=${userId}`),
  filterInternships: (status, userId) => api.get(`/internships/filter?status=${status}&userId=${userId}`),
  getInternship: (id) => api.get(`/internships/${id}`),
};

// Profile API
export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (profileData) => api.put('/profile', profileData),
};

// Resume API
export const resumeApi = {
  getUserResumes: (userId) => api.get(`/resumes`, { params: { userId } }),
  uploadResume: ({ title, file, userId }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    formData.append('userId', userId);
    return api.post('/resumes/upload', formData);
  },
  deleteResume: (id, userId) => api.delete(`/resumes/${id}`, { params: { userId } }),
};

export default api;
