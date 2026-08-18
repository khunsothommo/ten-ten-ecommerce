import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useProducts from '../../hooks/useProducts';
import useContactMessages from '../../hooks/useContactMessages';
import { subscribeToOrders } from '../../firebase/orders';
import DashboardCard from '../../components/DashboardCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Overview() {
  const { currentUser } = useAuth();
  const { products, loading } = useProducts();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const {
    messages: contactMessages,
    loading: messagesLoading,
    unreadCount,
  } = useContactMessages();

  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      (data) => {
        setOrders(data);
        setOrdersLoading(false);
      },
      () => setOrdersLoading(false)
    );
    return unsubscribe;
  }, []);

  const activeCount = products.filter((p) => p.status !== 'inactive').length;
  const inactiveCount = products.filter((p) => p.status === 'inactive').length;
  const avgPrice =
    products.length > 0
      ? (products.reduce((sum, p) => sum + Number(p.price || 0), 0) / products.length).toFixed(2)
      : '0.00';

  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const revenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  return (
    <div>
      <div className="dashboard-topbar">
        <div>
          <h2 className="mb-0">Welcome back{currentUser?.displayName ? `, ${currentUser.displayName}` : ''} 👋</h2>
          <p className="text-white-50">Here's what's happening with your store today.</p>
        </div>
        <Link to="/dashboard/products/new" className="btn btn-custom">
          <i className="bi bi-plus-lg me-1" /> Add Product
        </Link>
      </div>

      {loading || ordersLoading || messagesLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="row g-3">
            <div className="col-sm-6 col-lg-3">
              <DashboardCard icon="bi-box-seam" label="Total Products" value={products.length} />
            </div>
            <div className="col-sm-6 col-lg-3">
              <DashboardCard icon="bi-receipt" label="Total Orders" value={orders.length} />
            </div>
            <div className="col-sm-6 col-lg-3">
              <DashboardCard icon="bi-hourglass-split" label="Pending Orders" value={pendingOrders} />
            </div>
            <div className="col-sm-6 col-lg-3">
              <DashboardCard icon="bi-cash-stack" label="Revenue" value={`$${revenue.toFixed(2)}`} />
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-sm-6 col-lg-3">
              <DashboardCard icon="bi-check-circle" label="Active Products" value={activeCount} />
            </div>
            <div className="col-sm-6 col-lg-3">
              <DashboardCard icon="bi-slash-circle" label="Inactive Products" value={inactiveCount} />
            </div>
            <div className="col-sm-6 col-lg-3">
              <DashboardCard icon="bi-tag" label="Avg. Price" value={`$${avgPrice}`} />
            </div>
            <div className="col-sm-6 col-lg-3">
              <DashboardCard
                icon="bi-envelope"
                label="Contact Messages"
                value={contactMessages.length}
                hint={`${unreadCount} Unread`}
              />
            </div>
          </div>
        </>
      )}

      <div className="row mt-4">
        <div className="col-lg-6 mb-4">
          <div className="dashboard-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Recent Orders</h5>
              <Link to="/dashboard/orders" className="text-white-50 small">
                View all
              </Link>
            </div>
            {orders.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-receipt fs-1 d-block mb-3" />
                No orders yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-custom mb-0">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id}>
                        <td>{o.customer?.name}</td>
                        <td>${Number(o.total).toFixed(2)}</td>
                        <td>
                          <span className="status-badge status-active">{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="dashboard-card">
            <h5 className="mb-3">Recently Added Products</h5>
            {products.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-inboxes fs-1 d-block mb-3" />
                No products yet.{' '}
                <Link to="/dashboard/products/new" className="text-white">
                  Add your first product
                </Link>{' '}
                or{' '}
                <Link to="/dashboard/products" className="text-white">
                  seed sample products
                </Link>
                .
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-custom mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>${Number(p.price).toFixed(2)}</td>
                        <td>
                          <span
                            className={`status-badge ${p.status === 'inactive' ? 'status-inactive' : 'status-active'}`}
                          >
                            {p.status || 'active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="dashboard-card">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Recent Contact Messages</h5>
              <Link to="/dashboard/contact-messages" className="btn btn-sm btn-outline-light">
                View All Messages
              </Link>
            </div>
            {contactMessages.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-envelope fs-1 d-block mb-3" />
                No contact messages yet.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark-custom mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactMessages.slice(0, 5).map((m) => (
                      <tr key={m.id} className={m.read ? '' : 'fw-bold'}>
                        <td>{m.name}</td>
                        <td>{m.subject}</td>
                        <td className="text-white-50 small fw-normal">
                          {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleDateString() : '—'}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${m.read ? 'status-active' : 'status-inactive'}`}
                          >
                            {m.read ? 'Read' : 'Unread'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}