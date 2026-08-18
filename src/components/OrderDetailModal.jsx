const statusVariant = {
  pending: 'status-inactive',
  processing: 'status-inactive',
  completed: 'status-active',
  cancelled: 'status-inactive',
};

export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const formattedDate = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString()
    : '—';

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div className="modal-content bg-dark text-white border-secondary">
            <div className="modal-header border-secondary">
              <h5 className="modal-title">Order #{order.id.slice(0, 8).toUpperCase()}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            <div className="modal-body">
              <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
                <span className="text-white-50 small">{formattedDate}</span>
                <span className={`status-badge ${statusVariant[order.status] || 'status-active'}`}>
                  {order.status}
                </span>
              </div>

              {order.customer?.address && (
                <p className="text-white-50 small mb-3">
                  <i className="bi bi-geo-alt me-1" />
                  {order.customer.address}
                </p>
              )}

              <h6 className="mb-3">Products</h6>
              {order.items?.map((item) => (
                <div key={item.productId} className="d-flex justify-content-between mb-2 small">
                  <span className="text-white-50">
                    {item.name} × {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr className="border-secondary" />
              <div className="d-flex justify-content-between fs-5 fw-bold">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-light" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}