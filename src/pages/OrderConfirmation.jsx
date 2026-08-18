import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderOnce } from '../firebase/orders';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getOrderOnce(orderId)
      .then((data) => {
        if (!cancelled) setOrder(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <section className="container py-5 text-center" style={{ marginTop: 90, minHeight: '60vh' }}>
      {loading ? (
        <LoadingSpinner label="Loading your order..." />
      ) : !order ? (
        <div className="empty-state">
          <i className="bi bi-question-circle fs-1 d-block mb-3" />
          We couldn't find that order.
        </div>
      ) : (
        <div className="mx-auto" style={{ maxWidth: 520 }}>
          <i className="bi bi-check-circle fs-1 d-block mb-3" style={{ color: '#3ddc84' }} />
          <h1 className="text-white mb-2">Thank you, {order.customer?.name}!</h1>
          <p className="text-white-50 mb-4">
            Your order has been received. We'll reach out at{' '}
            <strong>{order.customer?.email}</strong> to confirm delivery details.
          </p>

          <div className="dashboard-card text-start mb-4">
            <div className="d-flex justify-content-between text-white-50 small mb-3">
              <span>Order ID</span>
              <span>{order.id}</span>
            </div>
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

          <Link to="/services" className="btn btn-custom">
            Continue Shopping
          </Link>
        </div>
      )}
    </section>
  );
}
