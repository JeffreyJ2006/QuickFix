import api from './axios.js';

// Authentication APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateFCMToken: (token) => api.put('/auth/update-fcm-token', { fcmToken: token }),
};

// Complaint APIs
export const complaintAPI = {
  create: async (formData) => {
    const response = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  
    return response;
  },
  getAll: async (params) => {
    try {
      const res = await api.get('/complaints', { params });
      // safely extract complaints array
      return res?.data?.data?.complaints || [];
    } catch (error) {
      console.error('complaintAPI.getAll error:', error);
      return []; // always return an array, prevents UI crash
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/complaints/${id}`);
      console.log('API Response:', res.data); // Debug log
      if (!res?.data?.success) {
        throw new Error(res?.data?.message || 'Failed to fetch complaint');
      }
      // Check if complaint exists in the response
      const complaint = res?.data?.data?.complaint || res?.data?.complaint;
      if (!complaint) {
        throw new Error('No complaint data found');
      }
      return complaint;
    } catch (error) {
      console.error('complaintAPI.getById error:', error);
      throw error; // Let the component handle the error
    }
  },
  updateStatus: async (id, status) => {
    const response = await api.put(`/complaints/${id}/status`, { status });
    
    // Send notification when complaint is completed
    if (status === 'Resolved' && response.data?.data?.complaint) {
      await notificationAPI.sendNotification({
        userId: response.data.data.complaint.createdBy,
        type: 'complaint_completed',
        title: 'Complaint Resolved',
        message: `Your complaint "${response.data.data.complaint.title}" has been resolved.`,
        complaintId: id
      });
    }
    
    return response;
  },
  submitFeedback: (id, feedback) => api.post(`/complaints/${id}/feedback`, feedback),
  delete: (id) => api.delete(`/complaints/${id}`),
};

// Message APIs
export const messageAPI = {
  send: (data) => api.post('/messages', data),
  getHistory: (complaintId) => api.get(`/messages/${complaintId}`),
  markAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
};

// Notification APIs
export const notificationAPI = {
  getAll: async () => {
    try {
      const res = await api.get('/notifications');
      return res?.data?.data?.notifications || [];
    } catch (error) {
      console.error('notificationAPI.getAll error:', error);
      return [];
    }
  },
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  sendNotification: (data) => api.post('/notifications', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateAvailability: (status) => api.put('/users/availability', { status }),
  deleteAccount: () => api.delete('/users/account'),
};

// Admin APIs
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllComplaints: async (params) => {
    try {
      const res = await api.get('/admin/complaints', { params });
      // safely extract complaints array
      return { data: { complaints: res?.data?.data?.complaints || [] } };
    } catch (error) {
      console.error('adminAPI.getAllComplaints error:', error);
      throw error;
    }
  },
  reassignComplaint: (id, workerId) => api.put(`/admin/complaints/${id}/reassign`, { workerId }),
  getWorkers: async (params) => {
    try {
      const res = await api.get('/admin/workers', { params });
      // safely extract workers array
      return { data: { workers: res?.data?.data?.workers || [] } };
    } catch (error) {
      console.error('adminAPI.getWorkers error:', error);
      throw error;
    }
  },
  verifyWorker: (id) => api.put(`/admin/workers/${id}/verify`),
  deleteWorker: (id) => api.delete(`/admin/workers/${id}`),
};