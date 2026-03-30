import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EmployeeService } from '../services/employee.service';

export const useEmployees = () => {
  const queryClient = useQueryClient();

  // GET ALL EMPLOYEES
  const employeesQuery = useQuery({
    queryKey: ['employees'],
    queryFn: EmployeeService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes bago ituring na "stale" ang data
  });

  // CREATE EMPLOYEE MUTATION
  const createEmployeeMutation = useMutation({
    mutationFn: (newEmployee: any) => EmployeeService.create(newEmployee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      // Mas safe na logging para hindi 'undefined'
      console.error("Full Error Object:", error);
      const message = error.response?.data?.message || error.message || "Server Error";
      console.error("Mutation Error Message:", message);
    }
  });

  return {
    employeesQuery,
    createEmployee: createEmployeeMutation,
  };
};