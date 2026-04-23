import api from './api';

const internshipApi = {
  getAllInternships: (userId) => api.get(`/internships?userId=${userId}`),
  getInternship: (id) => api.get(`/internships/${id}`),
  createInternship: (internshipData) => api.post('/internships', internshipData),
  updateInternship: (id, internshipData) => api.put(`/internships/${id}`, internshipData),
  deleteInternship: (id) => api.delete(`/internships/${id}`),
  updateInternshipStatus: (id, status) => api.put(`/internships/${id}?status=${status}`, { status }),
  searchInternships: (company, userId) => api.get(`/internships/search?company=${company}&userId=${userId}`),
  filterInternships: (status, userId) => api.get(`/internships/filter?status=${status}&userId=${userId}`),
  searchAndFilter: (company, status, userId) => api.get(`/internships/search-filter?company=${company}&status=${status}&userId=${userId}`),
};

export default internshipApi;