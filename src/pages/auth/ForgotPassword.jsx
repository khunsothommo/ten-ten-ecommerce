import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { friendlyAuthError } from '../../utils/authErrors';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper text-white">
      <div className="auth-card">
        <h2 className="text-center mb-4">Reset Password</h2>

        {sent ? (
          <div className="text-center">
            <i className="bi bi-envelope-check fs-1 d-block mb-3" />
            <p className="text-white-50">
              Check <strong>{email}</strong> for a link to reset your password.
            </p>
            <Link to="/login" className="btn btn-custom w-100 mt-3">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <p className="text-white-50 mb-4">
              Enter the email associated with your account and we'll send a reset link.
            </p>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${error ? 'is-invalid' : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <div className="invalid-feedback">{error}</div>}
            </div>
            <button type="submit" className="btn btn-custom w-100" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-white-50 mt-4 mb-0">
              <Link to="/login" className="text-white">Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
