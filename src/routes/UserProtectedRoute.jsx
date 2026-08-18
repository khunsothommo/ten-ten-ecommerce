import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAllowedAdminEmail } from '../utils/adminAllowlist';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UserProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner label="Checking your session..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAllowedAdminEmail(currentUser.email)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}