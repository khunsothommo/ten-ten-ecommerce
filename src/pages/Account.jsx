import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useUserProfile from '../hooks/useUserProfile';
import { subscribeToUserOrders } from '../firebase/orders';
import { friendlyFirestoreError } from '../utils/firestoreErrors';
import DashboardCard from '../components/DashboardCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EditProfileModal from '../components/EditProfileModal';
import OrderDetailModal from '../components/OrderDetailModal';

const statusVariant = {
  pending: 'status-inactive',
  processing: 'status-inactive',
  completed: 'status-active',
  cancelled: 'status-inactive',
};

export default function Account() {
  const { currentUser } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    setOrdersLoading(true);
    const unsubscribe = subscribeToUserOrders(
      currentUser.uid,
      (data) => {
        setOrders(data);
        setOrdersLoading(false);
        setOrdersError(null);
      },
      (err) => {
        setOrdersLoading(false);
        setOrdersError(err);
      }
    );
    return unsubscribe;
  }, [currentUser, retryKey]);

  if (profileLoading) {
    return (
      <div style={{ marginTop: 90, minHeight: '60vh' }}>
        <LoadingSpinner label="Loading your account..." />
      </div>
    );
  }

  const displayName = profile?.name || currentUser?.displayName || 'Shopper';
  const memberSince = profile?.createdAt?.toDate
    ? profile.createdAt.toDate().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const totalSpent = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <section className="container py-5" style={{ marginTop: 90, minHeight: '70vh' }}>
      <h1 className="text-white mb-4">My Account</h1>

      {/* Profile header */}
      <div className="account-card mb-4">
        <div className="d-flex flex-wrap align-items-center gap-4">
          {profile?.photoURL ? (
            <img
              src={profile.photoURL}
              alt={displayName}
              className="rounded-circle"
              style={{ width: 96, height: 96, objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-circle bg-white bg-opacity-10 d-flex align-items-center justify-content-center"
              style={{ width: 96, height: 96, fontSize: '2.5rem' }}
            >
              <i className="bi bi-person-fill" />
            </div>
          )}

          <div className="flex-grow-1">
            <h3 className="mb-1">{displayName}</h3>
            <p className="text-white-50 mb-1">{currentUser?.email}</p>
            <p className="text-white-50 small mb-0">Member since {memberSince}</p>
          </div>

          <button className="btn btn-outline-light" onClick={() => setEditOpen(true)}>
            <i className="bi bi-pencil me-1" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Account overview stats */}
      <h5 className="text-white mb-3">Account Overview</h5>
      {ordersLoading ? (
        <LoadingSpinner label="Loading orders..." />
      ) : (
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-lg-3">
            <DashboardCard icon="bi-receipt" label="Orders" value={orders.length} />
          </div>
          <div className="col-sm-6 col-lg-3">
            <DashboardCard icon="bi-hourglass-split" label="Pending" value={pendingCount} />
          </div>
          <div className="col-sm-6 col-lg-3">
            <DashboardCard icon="bi-check-circle" label="Completed" value={completedCount} />
          </div>
          <div className="col-sm-6 col-lg-3">
            <DashboardCard icon="bi-cash-stack" label="Total Spent" value={`$${totalSpent.toFixed(2)}`} />
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="account-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Order History</h5>
          {orders.length > 0 && (
            <Link to="/account/orders" className="btn btn-sm btn-outline-light">
              View All Orders
            </Link>
          )}
        </div>

        {ordersLoading ? (
          <LoadingSpinner />
        ) : ordersError ? (
          <div className="empty-state">
            <i className="bi bi-exclamation-triangle fs-1 d-block mb-3" />
            {friendlyFirestoreError(ordersError)}
            {(ordersError.code === 'unavailable' || !ordersError.code) && (
              <div className="text-white-50 small mt-2">
                If this keeps happening, a browser privacy shield or ad-blocker
                extension (like Brave Shields or uBlock Origin) may be blocking
                the connection to Firestore — try disabling it for this site.
              </div>
            )}
            <br />
            <button
              className="btn btn-outline-light mt-3"
              onClick={() => setRetryKey((k) => k + 1)}
            >
              <i className="bi bi-arrow-clockwise me-1" />
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-bag fs-1 d-block mb-3" />
            You haven't placed any orders yet.
            <br />
            Start shopping and your orders will appear here.
            <br />
            <Link to="/services" className="btn btn-custom mt-3">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop/tablet: table */}
            <div className="table-responsive d-none d-sm-block">
              <table className="table table-dark-custom align-middle mb-0">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className="text-50 small">
                        {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : '—'}
                      </td>
                      <td>${Number(o.total).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${statusVariant[o.status] || 'status-active'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-dark"
                          onClick={() => setSelectedOrder(o)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <div className="d-sm-none">
              {orders.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="border-bottom border-secondary border-opacity-25 py-3"
                >
                  <div className="d-flex justify-content-between mb-1">
                    <strong>#{o.id.slice(0, 8).toUpperCase()}</strong>
                    <span className={`status-badge ${statusVariant[o.status] || 'status-active'}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="text-white-50 small mb-2">
                    {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : '—'}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span>${Number(o.total).toFixed(2)}</span>
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={() => setSelectedOrder(o)}
                    >
                      View Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <EditProfileModal show={editOpen} profile={profile} onClose={() => setEditOpen(false)} />
      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </section>
  );
}