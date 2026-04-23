import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PayrollService } from '../services/payroll.service';

export const usePayroll = (search: string = "") => {
  const queryClient = useQueryClient();

  const payrollQuery = useQuery({
    queryKey: ['payroll', search],
    queryFn: () => PayrollService.getAll(search),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    select: (response) => {
      return Array.isArray(response) ? response : response.data || [];
    }
  });

  return { 
    payrollQuery
  };
};