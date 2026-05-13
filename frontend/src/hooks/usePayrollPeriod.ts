import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PayrollPeriodService } from '../services/payrollPeriod.service';

export const usePayrollPeriodsQuery = () => {
  return useQuery({
    queryKey: ['payrollPeriods'],
    queryFn: () => PayrollPeriodService.getAll(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    select: (response) => {
      return Array.isArray(response)
        ? response
        : response.data || [];
    }
  });
};

export const useAddPayrollPeriodMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ periodName, startDate, endDate, payoutDate }: { periodName: string; startDate: string; endDate: string; payoutDate: string }) => PayrollPeriodService.addPayrollPeriod( periodName, startDate, endDate, payoutDate ),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['payrollPeriods']
        });
      }
  });
};