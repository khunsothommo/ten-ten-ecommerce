import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../firebase/orders';
import { friendlyFirestoreError } from '../utils/firestoreErrors';
import paymentQr from '../assets/images/payment_qr.png';

const emptyForm = { name: '', email: '', phone: '', address: '' };

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...emptyForm,
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <section className="container py-5" style={{ marginTop: 90, minHeight: '60vh' }}>
        <div className="empty-state">
          <i className="bi bi-cart-x fs-1 d-block mb-3" />
          Your cart is empty — nothing to check out.
          <br />
          <Link to="/services" className="btn btn-custom mt-3">
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.phone.trim()) next.phone = 'Phone number is required.';
    if (!form.address.trim()) next.address = 'Delivery address is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (submitting) return; 

    setSubmitting(true);
    try {
      const orderRef = await createOrder({
        uid: currentUser?.uid || null,
        customer: form,
        items,
        subtotal,
      });
      clearCart();
      toast.success('Order placed! Thank you for shopping with TEN TEN.');
      navigate(`/order-confirmation/${orderRef.id}`, { replace: true });
    } catch (err) {
      toast.error('Could not place your order: ' + friendlyFirestoreError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container py-5" style={{ marginTop: 90, minHeight: '60vh' }}>
      <h1 className="mb-4 text-white">Checkout</h1>

      <div className="row">
        <div className="col-lg-7 mb-4 order-2 order-lg-1">
          <div className="contact-form">
            <h5 className="mb-4">Delivery Details</h5>
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Your name"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@example.com"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="+855 12 345 678"
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>

              <div className="mb-4">
                <label className="form-label">Delivery Address</label>
                <textarea
                  rows="3"
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                  value={form.address}
                  onChange={handleChange('address')}
                  placeholder="Street, city, country"
                />
                {errors.address && <div className="invalid-feedback">{errors.address}</div>}
              </div>
              
              <button type="submit" className="btn btn-custom w-100" disabled={submitting}>
                {submitting ? 'Placing Order...' : `Place Order — $${subtotal.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-5 order-1 order-lg-2">
          <div className="dashboard-card">
            <h5 className="mb-3">Order Summary</h5>
            {items.map((item) => (
              <div key={item.productId} className="d-flex justify-content-between mb-2 small">
                <span className="text-white-50">
                  {item.name} × {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr className="border-secondary" />
            <div className="d-flex justify-content-between fs-5 fw-bold mb-4">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <hr className="border-secondary" />

            <h5 className="mb-3">Scan to Pay</h5>
            <div className="text-center">
              <img
                src={paymentQr}
                alt="Scan this QR code to pay"
                className="mx-auto d-block"
                style={{ width: '100%', maxWidth: 200, borderRadius: 12 }}
              />
              <p className="text-white-50 small mt-3 mb-0">
                Scan with your banking or payment app to complete payment for this order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}