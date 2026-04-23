import api from './api';

const resumeApi = {
  // Get all resumes for a user
  getUserResumes: (userId) => api.get(`/resumes?userId=${userId}`),
  
  // Upload a new resume
  uploadResume: ({ title, file, userId }) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    formData.append('userId', userId);
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default resumeApi;