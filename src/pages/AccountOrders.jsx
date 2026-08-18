import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserOrders, ORDER_STATUSES } from '../firebase/orders';
import { friendlyFirestoreError } from '../utils/firestoreErrors';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderDetailModal from '../components/OrderDetailModal';

const statusVariant = {
  pending: 'status-inactive',
  processing: 'status-inactive',
  completed: 'status-active',
  cancelled: 'status-inactive',
};

export default function AccountOrders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const unsubscribe = subscribeToUserOrders(
      currentUser.uid,
      (data) => {
        setOrders(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        setError(err);
      }
    );
    return unsubscribe;
  
  }, [currentUser, retryKey]);

  const visibleOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  return (
    <section className="container py-5" style={{ marginTop: 90, minHeight: '70vh' }}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <h1 className="text-white mb-0">Order History</h1>
        <Link to="/account" className="btn btn-outline-light">
          <i className="bi bi-arrow-left me-1" />
          Back to Account
        </Link>
      </div>

      <div className="account-card mb-4">
        <select
          className="form-select bg-transparent text-white border-secondary"
          style={{ maxWidth: 220 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all" className="text-dark">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s} className="text-dark">
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="account-card">
        {loading ? (
          <LoadingSpinner label="Loading orders..." />
        ) : error ? (
          <div className="empty-state">
            <i className="bi bi-exclamation-triangle fs-1 d-block mb-3" />
            {friendlyFirestoreError(error)}
            {(error.code === 'unavailable' || !error.code) && (
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
        ) : visibleOrders.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-search fs-1 d-block mb-3" />
            No orders match this filter.
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
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOrders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className="text-white-50 small">
                        {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : '—'}
                      </td>
                      <td>{o.items?.reduce((sum, i) => sum + i.quantity, 0)} item(s)</td>
                      <td>${Number(o.total).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge ${statusVariant[o.status] || 'status-active'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-light"
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
              {visibleOrders.map((o) => (
                <div key={o.id} className="border-bottom border-secondary border-opacity-25 py-3">
                  <div className="d-flex justify-content-between mb-1">
                    <strong>#{o.id.slice(0, 8).toUpperCase()}</strong>
                    <span className={`status-badge ${statusVariant[o.status] || 'status-active'}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="text-white-50 small mb-2">
                    {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : '—'} ·{' '}
                    {o.items?.reduce((sum, i) => sum + i.quantity, 0)} item(s)
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

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </section>
  );
}