import { NavLink } from 'react-router-dom';
import useContactMessages from '../hooks/useContactMessages';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: 'bi-speedometer2', end: true },
  { to: '/dashboard/products', label: 'Products', icon: 'bi-box-seam' },
  { to: '/dashboard/orders', label: 'Orders', icon: 'bi-receipt' },
  { to: '/dashboard/contact-messages', label: 'Contact Messages', icon: 'bi-envelope' },
  { to: '/dashboard/users', label: 'Users', icon: 'bi-people' },
  { to: '/dashboard/profile', label: 'Profile', icon: 'bi-person-circle' },
  { to: '/dashboard/settings', label: 'Settings', icon: 'bi-gear' },
];

export default function Sidebar({ open, onNavigate }) {
  const { unreadCount } = useContactMessages();

  return (
    <aside className={`dashboard-sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-brand">TEN TEN Admin</div>
      <nav>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
          >
            <i className={`bi ${item.icon}`} />
            <span className="flex-grow-1">{item.label}</span>
            {item.to === '/dashboard/contact-messages' && unreadCount > 0 && (
              <span className="badge rounded-pill bg-light text-dark">{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}