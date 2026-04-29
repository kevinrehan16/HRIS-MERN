import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosClient';

// --- Sub-Interfaces para malinis ---
interface Department {
  name: string;
}

interface Position {
  title: string;
}

interface WorkSchedule {
  name: string;
  shiftStart: string;
  shiftEnd: string;
  gracePeriod: number;
}

// --- Main Profile Interface ---
export interface MyProfile {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  extensionName: string;
  email: string;
  status: 'REGULAR' | 'PROBATIONARY' | 'CONTRACTUAL';
  role: 'ADMIN' | 'EMPLOYEE' | 'HR';
  leaveCredits: number;
  
  // Nested Objects
  department: Department;
  position: Position;
  schedule: WorkSchedule;

  // Compensation
  basicSalary: string;
  allowance: string;

  // Personal Info
  address: string | null;
  birthDate: string;
  civilStatus: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'SEPARATED';
  contactNo: string;
  gender: 'MALE' | 'FEMALE';
  
  // Dates
  dateHired: string;
  dateResigned: string | null;
  employmentType: 'FULL_TIME' | 'PART_TIME';

  // Gov IDs
  pagibigNo: string;
  philhealthNo: string;
  sssNo: string;
  tinNo: string;
  
  createdAt: string;
}

export const useMyProfile = () => {
  const query = useQuery<MyProfile>({
    queryKey: ['myProfile'], 
    queryFn: async () => {
      const response = await api.get('/auth/my-profile');
      // DAPAT .data.data para makuha yung profile object mismo
      return response.data.data; 
    },
    staleTime: 1000 * 60 * 5, // 5 mins cache
    retry: 3,                 // 3 retries on failure
    retryDelay: 2000,         // 2 seconds gap
  });

  return {
    profile: query.data || null, // Siguraduhing .data ito
    isLoading: query.isLoading,
    isError: query.isError
  };
};