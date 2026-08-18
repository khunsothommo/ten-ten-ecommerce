import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { subscribeToOrders, updateOrderStatus, ORDER_STATUSES } from '../../firebase/orders';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';

const statusVariant = {
  pending: 'status-inactive',
  processing: 'status-inactive',
  completed: 'status-active',
  cancelled: 'status-inactive',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToOrders(
      (data) => {
        setOrders(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsubscribe;
  }, []);

  const visibleOrders = useMemo(() => {
    let list = [...orders];

    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.customer?.name?.toLowerCase().includes(term) ||
          o.customer?.email?.toLowerCase().includes(term) ||
          o.id.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((o) => o.status === statusFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'total-asc') return Number(a.total) - Number(b.total);
      if (sortBy === 'total-desc') return Number(b.total) - Number(a.total);
      return 0; 
    });

    return list;
  }, [orders, search, statusFilter, sortBy]);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Order status updated.');
      setSelectedOrder(null);
    } catch (err) {
      toast.error('Failed to update order: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div className="dashboard-topbar">
        <h2 className="mb-0">Order History</h2>
      </div>

      <div className="dashboard-card mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-auto">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, order ID..." />
          </div>
          <div className="col-12 col-md-auto">
            <select
              className="form-select bg-transparent text-white border-secondary"
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
          <div className="col-12 col-md-auto">
            <select
              className="form-select bg-transparent text-white border-secondary"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest" className="text-dark">Newest</option>
              <option value="total-asc" className="text-dark">Total: Low to High</option>
              <option value="total-desc" className="text-dark">Total: High to Low</option>
            </select>
          </div>
          <div className="col-12 col-md-auto ms-md-auto text-white-50 small">
            {visibleOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      <div className="dashboard-card">
        {loading ? (
          <LoadingSpinner />
        ) : visibleOrders.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-receipt fs-1 d-block mb-3" />
            No orders yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark-custom align-middle mb-0">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div>{o.customer?.name}</div>
                      <div className="text-50 small">{o.customer?.email}</div>
                    </td>
                    <td>{o.items?.reduce((sum, i) => sum + i.quantity, 0)} item(s)</td>
                    <td>${Number(o.total).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${statusVariant[o.status] || 'status-active'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-50 small">
                      {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : '—'}
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
        )}
      </div>

      <Modal
        show={!!selectedOrder}
        title={`Order ${selectedOrder?.id?.slice(0, 8) || ''}`}
        onClose={() => setSelectedOrder(null)}
      >
        {selectedOrder && (
          <div>
            <p className="mb-1">
              <strong>{selectedOrder.customer?.name}</strong>
            </p>
            <p className="text-50 small mb-3">
              {selectedOrder.customer?.email} · {selectedOrder.customer?.phone}
              <br />
              {selectedOrder.customer?.address}
            </p>

            {selectedOrder.items?.map((item) => (
              <div key={item.productId} className="d-flex justify-content-between mb-2 small">
                <span className="text-white-50">
                  {item.name} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr className="border-secondary" />
            <div className="d-flex justify-content-between fw-bold mb-3">
              <span>Total</span>
              <span>${Number(selectedOrder.total).toFixed(2)}</span>
            </div>

            <label className="form-label small">Update Status</label>
            <select
              className="form-select bg-transparent text-white border-secondary"
              value={selectedOrder.status}
              disabled={updating}
              onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s} className="text-dark">
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </Modal>
    </div>
  );
}