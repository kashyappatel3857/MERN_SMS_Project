import axios from 'axios';

// Create central Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Student API services
export const studentService = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Attendance API services
export const attendanceService = {
  save: (data) => api.post('/attendance', data),
  getAll: (params) => api.get('/attendance', { params }),
  getDaily: (params) => api.get('/attendance/daily', { params }),
  getMonthly: (params) => api.get('/attendance/monthly', { params }),
  updateById: (id, data) => api.put(`/attendance/${id}`, data),
};

// Report API services
export const reportService = {
  getDashboard: () => api.get('/reports/dashboard'),
  getStudentReport: (id) => api.get(`/reports/student/${id}`),
  getMonthlyReport: (params) => api.get('/reports/monthly', { params }),
};

// System Health API service
export const healthService = {
  check: () => api.get('/health'),
};

export default api;

