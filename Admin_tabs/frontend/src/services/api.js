import axios from 'axios';

// FIX 7: Use env variable for base URL
const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiry globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const api = {
  // Auth
  login:  (body) => axiosInstance.post('/auth/login', body).then(r => r.data),
  getMe:  ()     => axiosInstance.get('/auth/me').then(r => r.data),

  // Users
  getUsers:    ()     => axiosInstance.get('/users').then(r => r.data),
  createUser:  (body) => axiosInstance.post('/users', body).then(r => r.data),
  updateUser:  (id, body) => axiosInstance.put(`/users/${id}`, body).then(r => r.data),
  deleteUser:  (id)   => axiosInstance.delete(`/users/${id}`).then(r => r.data),
  blockUser:   (id)   => axiosInstance.patch(`/users/${id}/block`).then(r => r.data),
  unblockUser: (id)   => axiosInstance.patch(`/users/${id}/unblock`).then(r => r.data),

  // Events
  getEvents:    ()     => axiosInstance.get('/events').then(r => r.data),
  // FIX 7: Remove dead createEvent function - use uploadEvent from upload.js instead
  updateEvent:  (id, body) => axiosInstance.put(`/events/${id}`, body).then(r => r.data),
  deleteEvent:  (id)   => axiosInstance.delete(`/events/${id}`).then(r => r.data),
  approveEvent: (id)   => axiosInstance.patch(`/events/${id}/approve`).then(r => r.data),
  rejectEvent:  (id)   => axiosInstance.patch(`/events/${id}/reject`).then(r => r.data),

  // Messages
  getMessages:      ()   => axiosInstance.get('/messages').then(r => r.data),
  markMessageRead:  (id) => axiosInstance.patch(`/messages/${id}/read`).then(r => r.data),
  deleteMessage:    (id) => axiosInstance.delete(`/messages/${id}`).then(r => r.data),

  // Reports
  getDashboardSummary:  () => axiosInstance.get('/reports/summary').then(r => r.data),
  getRecentActivity:    () => axiosInstance.get('/reports/recent-activity').then(r => r.data),
  getEventStatusStats:  () => axiosInstance.get('/reports/event-status').then(r => r.data),
  getMonthlyUserStats:  () => axiosInstance.get('/reports/monthly-users').then(r => r.data),

  // Settings
  getSettings:    ()     => axiosInstance.get('/settings').then(r => r.data),
  updateSettings: (body) => axiosInstance.put('/settings', body).then(r => r.data),
  // FIX 7: Add uploadLogo function
  uploadLogo: (formData) => axiosInstance.post('/settings/upload-logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data),
};

export default axiosInstance;