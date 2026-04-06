// src/hooks/useLookups.ts
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

export const useLookups = () => {
  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/departments');
      return data.data; // Siguraduhin ang structure ng response mo
    },
  });

  const positionsQuery = useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/positions');
      return data.data;
    },
  });

  return {
    departments: departmentsQuery.data || [],
    positions: positionsQuery.data || [],
    isLoading: departmentsQuery.isLoading || positionsQuery.isLoading,
  };
};