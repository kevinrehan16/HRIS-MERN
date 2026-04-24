import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AuthService } from './services/auth.service';
import { Spinner } from 'react-bootstrap';

import LoginPage from './pages/LoginPage';
// --- MGA IMPORTS NG PAGES AT LAYOUTS NI ADMIN ---
import AdminLayout from './components/layouts/AdminLayout';
import Dashboard from './pages/admin/dashboard/Dashboard';
import Employees from './pages/admin/employees/Employees';
import Attendance from './pages/admin/attendance/Attendance';
import Leaves from './pages/admin/leaves/Leaves';
import Payroll from './pages/admin/payroll/Payroll';
import Department from './pages/admin/referentials/Department';
import Position from './pages/admin/referentials/Position';
import OvertimeRequest from './pages/admin/approvals/OvertimeRequest';
import AttendanceCorrection from './pages/admin/approvals/AttendanceCorrection';
import LeaveRequest from './pages/admin/approvals/LeaveRequest';

// --- MGA IMPORTS NG PAGES AT LAYOUTS NI EMPLOYEE ---
import EmployeeLayout from './components/layouts/EmployeeLayout';
import EmpDashboard from './pages/employee/dashboard/Dashboard';
import MyProfile from './pages/employee/my-profile/MyProfile';
import DailyLogs from './pages/employee/attendance/DailyLogs';

import FaceClock from './components/modals/FaceClockModal';

function App() {
  // DAGDAGAN NG 'user' DITO
  const { user, isAuthenticated, setAuth, isInitialLoading, setInitialLoading } = useAuthStore();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await AuthService.getProfile();
        if (userData) {
          setAuth(userData);
        } else {
          // Kung walang data pero walang error (rare)
          setInitialLoading(false);
        }
      } catch (err: any) {
        // DITO: Linisin lang ang Zustand state nang walang redirect
        useAuthStore.setState({ user: null, isAuthenticated: false });
      } finally {
        // PINAKA-IMPORTANTENG LINE:
        setInitialLoading(false); 
      }
    };

    checkSession();
  }, []);

  if (isInitialLoading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
        <Spinner animation="grow" variant="primary" />
        <span className="ms-2 mt-3 fw-medium text-muted">Checking your credentials...</span>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN ROUTE */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : (
            // Importante: Gamitin ang optional chaining ?.
            user?.role === 'ADMIN' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/portal" />
          )} 
        />

        <Route 
          path="/timeclock" 
          element={!isAuthenticated ? <FaceClock /> : (
            // Importante: Gamitin ang optional chaining ?.
            user?.role === 'ADMIN' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/portal" />
          )} 
        />

        {/* ADMIN ROUTES */}
        <Route 
          path="/admin/*" 
          element={isAuthenticated && user?.role === 'ADMIN' ? <AdminLayout /> : <Navigate to="/login" />} 
        >
           {/* Siguraduhin na may default child route sa loob ng AdminLayout (Outlet) */}
           <Route index element={<Navigate to="dashboard" replace />} />
           <Route path="dashboard" element={<Dashboard />} />
           <Route path="employees" element={<Employees />} />
           <Route path="attendance" element={<Attendance />} />
           <Route path="leaves" element={<Leaves />} />
           <Route path="payroll" element={<Payroll />} />
           <Route path="departments" element={<Department />} />
           <Route path="positions" element={<Position />} />
           <Route path="overtime-requests" element={<OvertimeRequest />} />
           <Route path="attendance-corrections" element={<AttendanceCorrection />} />
           <Route path="leave-requests" element={<LeaveRequest />} />
        </Route>

        {/* EMPLOYEE ROUTES */}
        <Route 
          path="/portal/*" 
          element={isAuthenticated && user?.role === 'EMPLOYEE' ? <EmployeeLayout /> : <Navigate to="/login" />} 
        >
          {/* Siguraduhin na may default child route sa loob ng AdminLayout (Outlet) */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmpDashboard />} />
          <Route path="my-profile" element={<MyProfile />} />
          <Route path="daily-logs" element={<DailyLogs />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={
          <Navigate to={!isAuthenticated ? "/login" : (user?.role === 'ADMIN' ? "/admin/dashboard" : "/portal")} />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;