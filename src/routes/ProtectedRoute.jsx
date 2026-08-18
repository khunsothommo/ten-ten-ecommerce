import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { isAllowedAdminEmail } from '../utils/adminAllowlist';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  const authorized = currentUser && isAllowedAdminEmail(currentUser.email);

  useEffect(() => {
    if (!loading && currentUser && !authorized) {
      toast.info("You're signed in, but this account doesn't have admin access.");
    }
  }, [loading, currentUser, authorized]);

  if (loading) {
    return <LoadingSpinner label="Checking your session..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!authorized) {
    return <Navigate to="/" replace />;
  }

  return children;
}