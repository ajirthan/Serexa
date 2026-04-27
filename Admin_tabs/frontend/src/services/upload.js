import axiosInstance from './api';

// FIX 8: Remove dead uploadSettings function
export const uploadEvent = (formData) =>
  axiosInstance.post('/events', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(r => r.data);