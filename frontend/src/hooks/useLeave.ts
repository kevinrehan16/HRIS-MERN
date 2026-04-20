import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LeaveService } from '../services/leave.service';

export const useLeave = (search: string = "") => {
  const queryClient = useQueryClient();

  const leaveQuery = useQuery({
    queryKey: ['leave-s', search],
    queryFn: () => LeaveService.getAll(search),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    select: (response) => {
      return Array.isArray(response) ? response : response.data || [];
    }
  });

  return { 
    leaveQuery
  };
};