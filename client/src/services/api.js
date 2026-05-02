import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

const normalizeJob = (job) => {
  if (!job || typeof job !== 'object') {
    return job;
  }

  return {
    ...job,
    isRemote: job.isRemote ?? job.workMode === 'remote',
    applicationsCount: job.applicationsCount ?? job.applicationCount ?? job.applications ?? 0
  };
};

// Add token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const addCompatDataShape = (response) => {
  const payload = response.data;

  if (payload?.success && payload.data === undefined) {
    const data = Object.entries(payload).reduce((acc, [key, value]) => {
      if (!['success', 'message'].includes(key)) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (payload.pagination) {
      data.page = payload.pagination.page;
      data.pages = payload.pagination.pages;
      data.total = payload.pagination.total;
      data.limit = payload.pagination.limit;
    }

    if (Array.isArray(data.jobs)) {
      data.jobs = data.jobs.map(normalizeJob);
      data.total = data.total ?? data.jobs.length;
      data.recommendations = data.recommendations ?? data.jobs;
    }

    if (Array.isArray(data.recommendations)) {
      data.recommendations = data.recommendations.map(normalizeJob);
    }

    if (data.job) {
      data.job = normalizeJob(data.job);
    }

    if (Array.isArray(data.applications)) {
      data.total = data.total ?? data.applications.length;
      data.jobs = data.jobs ?? data.applications.map(application => normalizeJob(application.job)).filter(Boolean);
    }

    if (Array.isArray(data.notifications)) {
      data.total = data.total ?? data.notifications.length;
    }

    response.data = { ...payload, data };
  }

  return response;
};

// Handle response errors
API.interceptors.response.use(
  (response) => addCompatDataShape(response),
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  logout: () => API.post('/auth/logout'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.put(`/auth/reset-password/${token}`, data),
  updatePassword: (data) => API.put('/auth/update-password', data)
};

// User APIs
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  uploadResume: (formData) => API.post('/users/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteResume: () => API.delete('/users/resume'),
  saveJob: (jobId) => API.post(`/users/save-job/${jobId}`),
  unsaveJob: (jobId) => API.delete(`/users/save-job/${jobId}`),
  getSavedJobs: () => API.get('/users/saved-jobs'),
  getAppliedJobs: () => API.get('/users/applied-jobs'),
  getUserStats: () => API.get('/users/stats'),
  getAllUsers: (params) => API.get('/users/admin/users', { params }),
  getAllRecruiters: (params) => API.get('/users/admin/recruiters', { params }),
  approveRecruiter: (recruiterId) => API.put(`/users/admin/recruiter/${recruiterId}/approve`),
  deleteUser: (userId) => API.delete(`/users/admin/user/${userId}`)
};

// Job APIs
export const jobAPI = {
  getJobs: (params) => API.get('/jobs', { params }),
  getJob: (id) => API.get(`/jobs/${id}`),
  createJob: (data) => API.post('/jobs', data),
  updateJob: (id, data) => API.put(`/jobs/${id}`, data),
  deleteJob: (id) => API.delete(`/jobs/${id}`),
  getMyJobs: (params) => API.get('/jobs/recruiter/my-jobs', { params }),
  getJobApplicants: (jobId, params) => API.get(`/jobs/recruiter/${jobId}/applicants`, { params }),
  getAllJobsAdmin: (params) => API.get('/jobs/admin/all', { params }),
  getDashboardStats: (params) => API.get('/jobs/admin/stats', { params })
};

// Recruiter APIs
export const recruiterAPI = {
  getDashboardStats: () => API.get('/jobs/recruiter/dashboard'),
  getMyJobs: (params) => API.get('/jobs/recruiter/my-jobs', { params }),
  getJobApplicants: (jobId, params) => API.get(`/jobs/recruiter/${jobId}/applicants`, { params }),
  updateApplicantStatus: (applicationId, data) => API.put(`/applications/${applicationId}/status`, data),
  scheduleInterview: (applicationId, data) => API.post(`/applications/${applicationId}/schedule-interview`, data)
};

// Application APIs
export const applicationAPI = {
  applyForJob: (jobId, data) => API.post(`/applications/job/${jobId}`, data),
  getMyApplications: () => API.get('/applications/my-applications'),
  getApplication: (id) => API.get(`/applications/${id}`),
  updateApplicationStatus: (id, data) => API.put(`/applications/${id}/status`, data),
  withdrawApplication: (id) => API.delete(`/applications/${id}`),
  rateApplicant: (id, data) => API.put(`/applications/${id}/rating`, data),
  getApplicationStats: () => API.get('/applications/stats/me')
};

// Notification APIs
export const notificationAPI = {
  getNotifications: (params) => API.get('/notifications', { params }),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/mark-all-read'),
  deleteNotification: (id) => API.delete(`/notifications/${id}`),
  getUnreadCount: () => API.get('/notifications/unread-count')
};

// AI APIs
export const aiAPI = {
  parseResume: (formData) => API.post('/ai/parse-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getResumeReport: () => API.get('/ai/resume-report'),
  checkATSScore: (data) => API.post('/ai/ats-score', data),
  getRolePrediction: (data) => API.post('/ai/role-prediction', data),
  getSalaryPrediction: (data) => API.post('/ai/salary-prediction', data),
  getCompanySuggestions: (data) => API.post('/ai/company-suggestions', data),
  getInterviewFeedback: (data) => API.post('/ai/interview-feedback', data),
  careerChatbot: (data) => API.post('/ai/chatbot', data),
  chatWithBot: (data) => API.post('/ai/chatbot', data),
  getJobRecommendations: () => API.get('/ai/job-recommendations'),
  analyzeAgainstJob: (jobId) => API.get(`/ai/job/${jobId}/analyze`)
};

export default API;
