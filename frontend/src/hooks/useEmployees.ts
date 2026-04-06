import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeeService } from '../services/employee.service';

export const useEmployees = (
  page: number, 
  limit: number, 
  search: string, 
  deptId: string, 
  onSuccessCallback?: () => void
) => {

  const queryClient = useQueryClient();

  // GET ALL EMPLOYEES
  const employeesQuery = useQuery({
    queryKey: ['employees', page, limit, search, deptId],
    queryFn: () => EmployeeService.getAll(page, limit, search, deptId),
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes bago ituring na "stale" ang data
  });

  // CREATE EMPLOYEE MUTATION
  const createEmployeeMutation = useMutation({
    mutationFn: (newEmployee: any) => EmployeeService.create(newEmployee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });

      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: any) => {
      // Mas safe na logging para hindi 'undefined'
      console.error("Full Error Object:", error);
      const message = error.response?.data?.message || error.message || "Server Error";
      console.error("Mutation Error Message:", message);
    }
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: (data: any) => {
      // Dito natin kinukuha ang ID mula sa payload para sa URL
      const { id, ...payload } = data;
      return EmployeeService.update(id, payload);
    },
    onSuccess: () => {
      // Refresh ang listahan para makita agad ang pagbabago
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      console.error("Update Error:", error);
    }
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: string) => EmployeeService.delete(id),
    onSuccess: () => {
      // Refresh ang table para mawala yung binura
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      console.error("Delete Error:", error.response?.data?.message || error.message);
    }
  });

  return {
    employeesQuery,
    createEmployee: createEmployeeMutation,
    deleteEmployee: deleteEmployeeMutation,
    updateEmployee: updateEmployeeMutation
  };
};