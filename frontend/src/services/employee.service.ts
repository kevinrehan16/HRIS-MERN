// src/services/employee.service.ts
import api from '../api/axiosClient'; // Gamitin ang existing mong api helper

export const EmployeeService = {
  getAll: async (page: number, limit: number, search?: string, deptId?: string) => {
    // Gumamit ng URLSearchParams para malinis ang pag-handle ng query strings
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) params.append('search', search);
    if (deptId) params.append('deptId', deptId);

    const response = await api.get(`/employees`, {
      params: {
        page,
        limit,
        search: search || undefined, // Wag magpasa ng empty string
        deptId: deptId || undefined,
      }
    });
    return response.data; // Ito yung may { success, data, pagination }
  },
  
  create: async (employeeData: any) => {
    const response = await api.post('/auth/register', employeeData);
    return response.data.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },


};