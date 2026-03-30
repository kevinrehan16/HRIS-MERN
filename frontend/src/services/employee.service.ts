// src/services/employee.service.ts
import api from '../api/axiosClient'; // Gamitin ang existing mong api helper

export const EmployeeService = {
  getAll: async () => {
    // Hindi na kailangan ang buong URL dito dahil nasa api config na ang baseURL
    const response = await api.get('/employees');
    return response.data.data;
  },
  
  create: async (employeeData: any) => {
    const response = await api.post('/auth/register', employeeData);
    return response.data.data;
  }
};