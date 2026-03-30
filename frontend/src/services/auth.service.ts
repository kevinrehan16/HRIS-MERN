import axiosClient from '../api/axiosClient';
// GUMAMIT NG 'import type' PARA SA INTERFACES
import type { AuthResponse, LoginCredentials, User } from '../types/auth';

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login', credentials);
    return response.data.data; 
  },

  getProfile: async (): Promise<User> => {
    const response = await axiosClient.get<AuthResponse>('/employees/profile');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout');
  }
};