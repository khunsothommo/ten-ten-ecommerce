import { useState } from 'react';
import { toast } from 'react-toastify';
import { addContactMessage } from '../firebase/contactMessages';
import mapImg from '../assets/images/map1.jpg';

const initialForm = { name: '', email: '', subject: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!form.email.trim()) next.email = 'Email address is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.subject.trim()) next.subject = 'Subject is required.';
    if (!form.message.trim()) next.message = 'Message cannot be empty.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await addContactMessage(form);
      toast.success('Thanks! Your message has been sent.');
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      toast.error('Could not send your message: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-header hero-section bg-contact text-white">
        <div className="container">
          <h1 className="display-4 fw-bold">Contact Us</h1>
          <p className="lead">We would love to hear from you.</p>
        </div>
      </section>

      <section className="container py-5">
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="contact-card">
              <i className="bi bi-telephone-fill" />
              <h4>Phone</h4>
              <p>+855 12 345 678</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="contact-card">
              <i className="bi bi-envelope-fill" />
              <h4>Email</h4>
              <p>info@tenten.com</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="contact-card">
              <i className="bi bi-geo-alt-fill" />
              <h4>Location</h4>
              <p>Phnom Penh, Cambodia</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="contact-form">
              <h2 className="text-center mb-4">Send Us A Message</h2>
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Enter your @email"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                    placeholder="Enter subject"
                    value={form.subject}
                    onChange={handleChange}
                  />
                  {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    rows="5"
                    name="message"
                    className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                    placeholder="Tell us about your concerning"
                    value={form.message}
                    onChange={handleChange}
                  />
                  {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                </div>

                <div className="text-center">
                  <button type="submit" className="btn btn-custom px-4" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5 text-center">
        <h2 className="mb-4">Follow Us</h2>
        <a
          href="https://www.facebook.com/share/1MDKh9pV5G/?mibextid=wwXIfr"
          className="social-icon"
          target="_blank"
          rel="noreferrer"
        >
          <i className="bi bi-facebook" />
        </a>
        <a
          href="https://www.instagram.com/fuchinmoochii?igsh=MWNmeGsxbGl0OHo1MQ%3D%3D&utm_source=qr"
          className="social-icon"
          target="_blank"
          rel="noreferrer"
        >
          <i className="bi bi-instagram" />
        </a>
        <a
          href="https://www.tiktok.com/@tenten1687?_r=1&_t=ZS-97JnbtpJzdt"
          className="social-icon"
          target="_blank"
          rel="noreferrer"
        >
          <i className="bi bi-tiktok" />
        </a>
      </section>

      <section className="container py-5">
        <div className="map-box">
          <h3 className="mb-4">Store Location</h3>
          <p>Click the map below to open Google Maps.</p>
          <a href="https://maps.app.goo.gl/iKPkYTm2HosGR9MH7?g_st=ic" target="_blank" rel="noreferrer">
            <img src={mapImg} alt="TEN TEN Location" className="img-fluid rounded shadow" />
          </a>
        </div>
      </section>
    </>
  );
}