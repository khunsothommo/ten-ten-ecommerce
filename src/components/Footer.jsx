import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-luxury text-center">
      <div className="container">
        <h1 className="footer-logo">TEN TEN</h1>
        <p className="footer-slogan">Premium Whitening Body Lotion</p>

        <div className="footer-links">
          <Link to="/">HOME</Link>
          <Link to="/about">ABOUT</Link>
          <Link to="/services">PRICE</Link>
          <Link to="/contact">CONTACT</Link>
        </div>

        <p className="footer-slogan">Glow Naturally. Feel Confident.</p>
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} TEN TEN Official | Developed by KHUN SOTHOMMO
        </p>
      </div>
    </footer>
  );
}
