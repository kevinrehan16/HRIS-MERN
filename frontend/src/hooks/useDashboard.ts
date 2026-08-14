import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../services/dashboard.service';

export const useAdminDashboard = () => useQuery({
  queryKey: ['dashboard', 'admin'],
  queryFn: DashboardService.getAdmin,
  staleTime: 30_000,
  refetchInterval: 60_000,
});

export const useEmployeeDashboard = () => useQuery({
  queryKey: ['dashboard', 'employee'],
  queryFn: DashboardService.getEmployee,
  staleTime: 30_000,
  refetchInterval: 60_000,
});