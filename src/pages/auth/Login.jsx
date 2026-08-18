import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { isAllowedAdminEmail } from '../../utils/adminAllowlist';
import { friendlyAuthError } from '../../utils/authErrors';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = 'Email is required.';
    if (!form.password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await login(form);
      toast.success('Welcome back!');

      const isAdmin = isAllowedAdminEmail(form.email);
      let destination;
      if (isAdmin) {
        destination = '/dashboard';
      } else {
        destination = from && !from.startsWith('/dashboard') ? from : '/account';
      }
      navigate(destination, { replace: true });
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper text-white">
      <div className="auth-card">
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <Link to="/forgot-password" className="text-white-50 small">
              <p className='noted'>Forgot Password?</p>
            </Link>
          </div>

          <button type="submit" className="btn btn-custom w-100" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-white-50 mt-4 mb-0">
          Don't have an account? <Link to="/register" className="text-white">Register</Link>
        </p>
      </div>
    </div>
  );
}