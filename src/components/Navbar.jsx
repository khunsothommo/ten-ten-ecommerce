import { NavLink, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { isAllowedAdminEmail } from '../utils/adminAllowlist';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Price' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const isAdmin = currentUser && isAllowedAdminEmail(currentUser.email);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully.');
      navigate('/');
    } catch (err) {
      toast.error('Failed to log out: ' + err.message);
    }
  };

  const firstName = currentUser?.displayName?.split(' ')[0] || 'Account';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          TEN TEN Official
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainMenu"
          aria-controls="mainMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainMenu">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            {links.map((link) => (
              <li className="nav-item" key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="nav-item">
              <NavLink
                to="/cart"
                className={({ isActive }) => 'nav-link position-relative' + (isActive ? ' active' : '')}
              >
                <i className="bi bi-cart3 fs-5" />
                {itemCount > 0 && (
                  <span
                    className="badge rounded-pill bg-light text-dark position-absolute"
                    style={{ top: -2, right: -8, fontSize: '0.65rem' }}
                  >
                    {itemCount}
                  </span>
                )}
              </NavLink>
            </li>

            {currentUser ? (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center gap-1"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle" />
                  {firstName}
                </a>

                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
                  {isAdmin ? (
                    <li>
                      <Link className="dropdown-item" to="/dashboard">
                        <i className="bi bi-speedometer2 me-2" />
                        Admin Dashboard
                      </Link>
                    </li>
                  ) : (
                    <>
                      <li>
                        <Link className="dropdown-item" to="/account">
                          <i className="bi bi-person me-2" />
                          My Account
                        </Link>
                      </li>

                      <li>
                        <Link className="dropdown-item" to="/account/orders">
                          <i className="bi bi-receipt me-2" />
                          Order History
                        </Link>
                      </li>
                    </>
                  )}

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2" />
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item">
                <NavLink to="/login" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                  Login
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}