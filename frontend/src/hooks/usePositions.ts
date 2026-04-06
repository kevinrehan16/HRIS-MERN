import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PositionService } from '../services/position.service';

export const usePositions = (search: string = "") => {
  const queryClient = useQueryClient();

  const positionsQuery = useQuery({
    queryKey: ['positions', search],
    queryFn: () => PositionService.getAll(search),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    // --- DAGDAG MO ITO ---
    select: (response) => {
      // Kung ang response ay may 'data' field (paginated), kunin yung data.
      // Kung wala, asahan na array na siya agad.
      return Array.isArray(response) ? response : response.data || [];
    }
  });

  // I-add na rin natin ang update at delete para kumpleto na ang hook mo
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => PositionService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: PositionService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
  });

  return { 
    positionsQuery, 
    createMutation: useMutation({
      mutationFn: PositionService.create,
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['positions'] }),
    }),
    updateMutation,
    deleteMutation
  };
};