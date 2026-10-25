import api from './api'

export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

export const resumeService = {
  getAll: () => api.get('/resumes'),
  getById: (id) => api.get(`/resumes/${id}`),
  create: (data) => api.post('/resumes', data),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
  duplicate: (id) => api.post(`/resumes/${id}/duplicate`),
  updateVisibility: (id, isPublic) => api.patch(`/resumes/${id}/visibility`, { isPublic }),
  upload: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export const aiService = {
  generateSummary: (data) => api.post('/ai/summary', data),
  improveText: (data) => api.post('/ai/improve', data),
  generateResume: (data) => api.post('/ai/generate-resume', data),
  getAtsScore: (data) => api.post('/ai/ats-score', data),
  generateCoverLetter: (data) => api.post('/ai/cover-letter', data),
  extractText: (formData) => api.post('/ai/extract-text', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

export const portfolioService = {
  getPublic: (username) => api.get(`/portfolio/${username}`),
}
