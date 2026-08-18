import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Failed to log out: ' + err.message);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex-grow-1 d-flex flex-column">
        <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-25">
          <button
            className="btn btn-outline-light d-md-none"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle admin menu"
          >
            <i className="bi bi-list" />
          </button>

          <span className="fw-bold d-md-none">Admin Dashboard</span>

          <div className="ms-auto d-flex align-items-center gap-3">
            <span className="text-white-50 small d-none d-sm-inline">
              {currentUser?.email}
            </span>
            <button className="btn btn-sm btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1" />
              Logout
            </button>
          </div>
        </div>

        <div className="dashboard-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}