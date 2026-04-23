import axiosClient from '../api/axiosClient';
// GUMAMIT NG 'import type' PARA SA INTERFACES
import type { AuthResponse, LoginCredentials, User } from '../types/auth';

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    // 1. Login muna para makuha ang cookie/token
    await axiosClient.post<AuthResponse>('/auth/login', credentials);
    
    // 2. AGAD na tawagin ang profile endpoint gamit ang bagong session
    // Para siguradong kumpleto ang User object (may firstName/lastName)
    const profileResponse = await axiosClient.get<AuthResponse>('/employees/profile');
    
    console.log("Full User Profile fetched:", profileResponse.data.data);
    return profileResponse.data.data; 
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosClient.get<AuthResponse>('/employees/profile');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  }
};