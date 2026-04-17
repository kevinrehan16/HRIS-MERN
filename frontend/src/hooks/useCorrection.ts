import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CorrectionsService } from '../services/corrections.service';

export const useCorrections = (search: string = "") => {
  const queryClient = useQueryClient();

  const correctionsQuery = useQuery({
    queryKey: ['corrections', search],
    queryFn: () => CorrectionsService.getAll(search),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    select: (response) => {
      return Array.isArray(response) ? response : response.data || [];
    }
  });

  const approveCorrectionMutation = useMutation({
    mutationFn: ({ id, adminRemarks }: { id: number; adminRemarks?: string }) => 
      CorrectionsService.approveCorrection(id, adminRemarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
    }
  });

  const rejectCorrectionMutation = useMutation({
    mutationFn: ({ id, adminRemarks }: { id: number; adminRemarks?: string }) => 
      CorrectionsService.rejectCorrection(id, adminRemarks),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections'] });
    }
  });

  return { 
    correctionsQuery,
    approveCorrectionMutation,
    rejectCorrectionMutation
  };
}