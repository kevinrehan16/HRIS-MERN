import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DepartmentService } from '../services/department.service';


export const useDepartments = (search: string = "") => {
  const queryClient = useQueryClient();

  const departmentsQuery = useQuery({
    queryKey: ['departments', search],
    queryFn: () => DepartmentService.getAll(search),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    // --- DAGDAG MO ITO ---
    select: (response) => {
      return Array.isArray(response) ? response : response.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: DepartmentService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  return { 
    departmentsQuery,
    createMutation
  };
}