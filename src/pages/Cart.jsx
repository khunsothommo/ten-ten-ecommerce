import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, loading } = useCart();
  const navigate = useNavigate();

  return (
    <section className="container py-5" style={{ marginTop: 90, minHeight: '60vh' }}>
      <h1 className="mb-4 text-white">Your Cart</h1>

      {loading ? (
        <p className="text-white-50">Loading your cart...</p>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-cart-x fs-1 d-block mb-3" />
          Your cart is empty.
          <br />
          <Link to="/services" className="btn btn-custom mt-3">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="dashboard-card">
              <div className="table-responsive">
                <table className="table table-dark-custom align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.productId}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div
                                className="bg-white bg-opacity-10 rounded d-flex align-items-center justify-content-center"
                                style={{ width: 56, height: 56 }}
                              >
                                <i className="bi bi-image text-white-50" />
                              </div>
                            )}
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-dark"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              <i className="bi bi-dash" />
                            </button>
                            <span style={{ minWidth: 24, textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <button
                              className="btn btn-sm btn-outline-dark"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <i className="bi bi-plus" />
                            </button>
                          </div>
                        </td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                        <td className="text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeItem(item.productId)}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="dashboard-card">
              <h5 className="mb-3">Order Summary</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-white-50">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-white-50">Shipping</span>
                <span className="text-white-50">Calculated at checkout</span>
              </div>
              <hr className="border-secondary" />
              <div className="d-flex justify-content-between mb-4 fs-5 fw-bold">
                <span>Total</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <button className="btn btn-custom w-100" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
              </button>
              <Link to="/services" className="btn btn-outline-light w-100 mt-2">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
