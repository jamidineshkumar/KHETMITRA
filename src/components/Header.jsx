import React from 'react';
import {
  Activity,
  Compass,
  Bell,
  Cpu,
  SlidersHorizontal,
  BarChart3,
  Settings,
  Wifi,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import Brand from './Brand';

export const NAV_ITEMS = [
  { id: 'Overview', label: 'Overview', icon: Activity },
  { id: 'Live Monitoring', label: 'Live Monitoring', icon: Compass },
  { id: 'Alerts', label: 'Alerts', icon: Bell },
  { id: 'Device & Sensors', label: 'Device & Sensors', icon: Cpu },
  { id: 'Controls', label: 'Controls', icon: SlidersHorizontal },
  { id: 'History & Reports', label: 'History & Reports', icon: BarChart3 },
  { id: 'Settings', label: 'Settings', icon: Settings },
];

export default function Header({
  activeNav,
  onNavigate,
  mobileNav,
  setMobileNav,
  unresolvedCount,
  notificationsOpen,
  setNotificationsOpen,
  userEmail,
  isDemo,
  isLiveHardware,
  onSignOut,
}) {
  return (
    <header className="site-header">
      <button
        className="icon-button menu-button"
        onClick={() => setMobileNav(!mobileNav)}
        aria-expanded={mobileNav}
        aria-controls="app-nav"
        aria-label={mobileNav ? 'Close navigation menu' : 'Open navigation menu'}
      >
        {mobileNav ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Brand />

      <nav
        id="app-nav"
        className={`primary-nav ${mobileNav ? 'primary-nav-open' : ''}`}
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                onNavigate(item.id);
                setMobileNav(false);
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={17} />
              <span>{item.label}</span>
              {item.id === 'Alerts' && unresolvedCount > 0 && (
                <span className="nav-count">{unresolvedCount}</span>
              )}
            </button>
          );
        })}

        <div className="mobile-nav-extra">
          <div className="profile-row">
            <div className="avatar">
              {(userEmail || 'D').slice(0, 1).toUpperCase()}
            </div>
            <div className="profile-info">
              <strong>{isDemo ? 'Demo Farmer' : userEmail.split('@')[0]}</strong>
              <span>{isDemo ? 'Simulated Sandbox' : userEmail}</span>
            </div>
          </div>
          <button type="button" className="btn btn-outline full-btn" onClick={onSignOut}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </nav>

      <div className="header-actions">
        {/* Prominent Demo Mode vs Live Hardware Chip */}
        <div
          className={`status-chip ${isLiveHardware ? 'chip-live' : 'chip-demo'}`}
          title={
            isLiveHardware
              ? 'Confirmed connection with authenticated physical hardware'
              : 'DEMO MODE — simulated telemetry and alerts'
          }
        >
          <span className={`pulse-dot ${isLiveHardware ? 'pulse-live' : 'pulse-demo'}`} />
          <Wifi size={14} />
          <span>{isLiveHardware ? 'LIVE HARDWARE' : 'DEMO MODE'}</span>
        </div>

        <div className="notification-wrap">
          <button
            className="icon-button notification-button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            aria-expanded={notificationsOpen}
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unresolvedCount > 0 && <i />}
          </button>
          {notificationsOpen && (
            <div className="notification-popover" role="dialog" aria-label="Notifications">
              <strong>Notifications</strong>
              <p>
                {unresolvedCount
                  ? `${unresolvedCount} simulated alert${unresolvedCount > 1 ? 's' : ''} require review.`
                  : 'All perimeter alerts have been reviewed.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  onNavigate('Alerts');
                  setNotificationsOpen(false);
                }}
              >
                Go to Alerts log →
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="user-chip"
          onClick={onSignOut}
          title={`Signed in as ${userEmail} — click to sign out`}
        >
          <span className="avatar small-avatar">
            {(userEmail || 'D').slice(0, 1).toUpperCase()}
          </span>
          <span className="user-chip-name">{isDemo ? 'Demo' : userEmail.split('@')[0]}</span>
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
