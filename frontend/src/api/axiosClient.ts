import axios from 'axios';
// import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Response Interceptor: Para sa Auto-Logout
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // HUWAG maglagay ng window.location.reload() o redirect dito!
    // Hayaan ang App.tsx catch block ang mag-handle.
    return Promise.reject(error);
  }
);

export default axiosClient;