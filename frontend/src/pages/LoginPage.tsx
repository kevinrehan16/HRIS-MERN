import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import type { LoginCredentials } from '../types/auth';
import { LogIn, Mail, Lock } from 'lucide-react'; // Para sa icons

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const user = await AuthService.login(data);
      setAuth(user);
      navigate('/dashboard'); // Pag success, lipat sa Dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-lg border-0" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="bg-primary text-white d-inline-block p-3 rounded-circle mb-3">
              <LogIn size={32} />
            </div>
            <h2 className="fw-bold">HRIS Login</h2>
            <p className="text-muted">Enter your credentials to access the system</p>
          </div>

          {error && <div className="alert alert-danger p-2 small">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-uppercase text-muted">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Mail size={18} className="text-muted" /></span>
                <input
                  type="email"
                  className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="name@company.com"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <div className="text-danger small mt-1">{errors.email.message}</div>}
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase text-muted">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><Lock size={18} className="text-muted" /></span>
                <input
                  type="password"
                  className={`form-control border-start-0 ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
              {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;