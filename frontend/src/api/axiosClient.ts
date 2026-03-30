import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Response Interceptor: Para sa Auto-Logout
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kung ang server ay nag-return ng 401 (Expired or No Cookie)
    if (error.response?.status === 401) {
      // Force logout sa client side
      useAuthStore.getState().logout();
      // Opsyonal: I-redirect sa login kung wala sa browser context
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;