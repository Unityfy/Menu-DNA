import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/dashboard',      icon: '⊞', label: 'Overview' },
  { to: '/upload',         icon: '↑', label: 'Data Upload' },
  { to: '/add-item',       icon: '+', label: 'Add Items' },
  { to: '/profitability',  icon: '◈', label: 'Profitability' },
  { to: '/intelligence',   icon: '◉', label: 'Intelligence' },
];

export default function Sidebar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" fill="#0a0a0a" />
            <rect x="9" y="2" width="5" height="5" fill="#0a0a0a" />
            <rect x="2" y="9" width="5" height="5" fill="#0a0a0a" opacity="0.6" />
            <rect x="9" y="9" width="5" height="5" fill="#0a0a0a" opacity="0.3" />
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-text">Menu DNA</div>
          <div style={{ fontSize: '10px', color: 'var(--text-disabled)', letterSpacing: '0.05em' }}>
            {profile?.restaurantName || 'Restaurant Intelligence'}
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Workspace</div>
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-item-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      {/* Bottom nav */}
      {/* <div className="sidebar-section" style={{ marginTop: 'auto' }}>
        <div className="sidebar-section-label">Account</div>
        {BOTTOM_NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-item-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </div> */}

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{
          padding: '12px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '4px',
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}>
            {(profile?.display_name || user?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '12px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.display_name || user?.email?.split('@')[0]}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-disabled)' }}>
              {profile?.role || 'Owner'}
            </div>
          </div>
        </div>
        <button
          className="nav-item"
          onClick={handleLogout}
          style={{ width: '100%', textAlign: 'left' }}
        >
          <span className="nav-item-icon">→</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
