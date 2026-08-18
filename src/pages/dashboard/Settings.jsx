import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';

export default function Settings() {
  const { logout, resetPassword, currentUser } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to log out: ' + err.message);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setSendingReset(true);
    try {
      await resetPassword(currentUser.email);
      toast.success('Password reset email sent to ' + currentUser.email);
    } catch (err) {
      toast.error('Failed to send reset email: ' + err.message);
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <h2 className="mb-0">Settings</h2>
      </div>

      <div className="dashboard-card mb-4" style={{ maxWidth: 500 }}>
        <h5 className="mb-3">Account Security</h5>
        <p className="text-white-50">
          Send yourself a password reset link to change your password.
        </p>
        <button className="btn btn-outline-light" onClick={handlePasswordReset} disabled={sendingReset}>
          {sendingReset ? 'Sending...' : 'Send Password Reset Email'}
        </button>
      </div>

      <div className="dashboard-card" style={{ maxWidth: 500 }}>
        <h5 className="mb-3">Session</h5>
        <p className="text-white-50">Sign out of your admin account on this device.</p>
        <button className="btn btn-outline-danger" onClick={() => setShowLogoutModal(true)}>
          <i className="bi bi-box-arrow-right me-1" /> Logout
        </button>
      </div>

      <Modal
        show={showLogoutModal}
        title="Confirm Logout"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        confirmLabel="Logout"
        confirmVariant="danger"
      >
        Are you sure you want to log out?
      </Modal>
    </div>
  );
}
