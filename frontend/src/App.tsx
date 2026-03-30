import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AuthService } from './services/auth.service';
import { Spinner } from 'react-bootstrap';

// --- MGA IMPORTS NG PAGES AT LAYOUTS ---
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/layouts/AdminLayout';
import Dashboard from './pages/admin/dashboard/Dashboard';
import Employees from './pages/admin/employees/Employees';

// Gagawa tayo ng separate file para dito later, 
// pero for now let's keep it here or move it to /pages
// const Dashboard = () => {
//   const { user, logout } = useAuthStore();
//   return (
//     <div className="p-5 text-center">
//       <div className="card p-4 shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
//         <h1 className="fw-bold text-primary">HRIS Dashboard</h1>
//         <hr />
//         <p className="fs-5">Welcome back, <strong>{user?.email}</strong>!</p>
//         <p className="text-muted small">Your Role: {user?.role}</p>
//         <button className="btn btn-outline-danger mt-3" onClick={logout}>
//           Sign Out
//         </button>
//       </div>
//     </div>
//   );
// };

function App() {
  // DAGDAGAN NG 'user' DITO
  const { user, isAuthenticated, setAuth, logout, isInitialLoading, setInitialLoading } = useAuthStore();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await AuthService.getProfile();
        setAuth(userData); // Dito tatanim ang user at isAuthenticated = true
      } catch (err) {
        logout();
      } finally {
        setInitialLoading(false);
      }
    };

    checkSession();
  }, [setAuth, logout, setInitialLoading]);

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

        {/* ADMIN ROUTES */}
        <Route 
          path="/admin/*" 
          element={isAuthenticated && user?.role === 'ADMIN' ? <AdminLayout /> : <Navigate to="/login" />} 
        >
           {/* Siguraduhin na may default child route sa loob ng AdminLayout (Outlet) */}
           <Route path="dashboard" element={<Dashboard />} />
           <Route path="employees" element={<Employees />} />
        </Route>

        {/* EMPLOYEE ROUTES */}
        <Route 
          path="/portal/*" 
          element={isAuthenticated && user?.role === 'EMPLOYEE' ? <div>Employee Portal</div> : <Navigate to="/login" />} 
        />

        {/* FALLBACK */}
        <Route path="*" element={
          <Navigate to={!isAuthenticated ? "/login" : (user?.role === 'ADMIN' ? "/admin/dashboard" : "/portal")} />
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;