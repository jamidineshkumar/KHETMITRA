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
  Volume2,
  VolumeX,
  Sprout,
  Users,
  Shield,
  ArrowRightLeft,
} from 'lucide-react';
import Brand from './Brand';

export const ADMIN_NAV = [
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'settings', label: 'App Settings', icon: Settings },
];

export const CUSTOMER_NAV = [
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
  userRole,
  onSwitchRole,
  isDemo,
  isLiveHardware,
  soundEnabled,
  onToggleSound,
  onSignOut,
}) {
  const navItems = userRole === 'admin' ? ADMIN_NAV : CUSTOMER_NAV;

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

      <div className="brand-role-wrap">
        <Brand />
        <span className={`portal-role-pill ${userRole === 'admin' ? 'role-admin' : 'role-customer'}`}>
          {userRole === 'admin' ? 'Admin Console' : 'Customer View'}
        </span>
      </div>

      <nav
        id="app-nav"
        className={`primary-nav ${mobileNav ? 'primary-nav-open' : ''}`}
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
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
              <strong>{userRole === 'admin' ? 'System Administrator' : 'Customer Farmer'}</strong>
              <span>{userEmail}</span>
            </div>
          </div>

          {isDemo && onSwitchRole && (
            <button
              type="button"
              className="btn btn-ghost full-btn"
              onClick={() => {
                onSwitchRole(userRole === 'admin' ? 'customer' : 'admin');
                setMobileNav(false);
              }}
            >
              <ArrowRightLeft size={15} /> Switch to {userRole === 'admin' ? 'Customer View' : 'Admin Console'}
            </button>
          )}

          <button type="button" className="btn btn-outline full-btn" onClick={onSignOut}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </nav>

      <div className="header-actions">
        {/* Role switching is disabled unless a trusted admin role is implemented. */}
        {isDemo && onSwitchRole && (
          <button
            type="button"
            className="role-switch-chip"
            onClick={() => onSwitchRole(userRole === 'admin' ? 'customer' : 'admin')}
            title={`Currently in ${userRole === 'admin' ? 'Admin Console' : 'Customer View'}. Click to switch view.`}
          >
            <ArrowRightLeft size={13} />
            <span className="switch-chip-text">
              {userRole === 'admin' ? 'Switch to Customer' : 'Switch to Admin'}
            </span>
          </button>
        )}

        {/* Master Sound Alarm Toggle Button */}
        <button
          type="button"
          className="icon-button sound-toggle-btn"
          onClick={onToggleSound}
          title={
            soundEnabled
              ? 'Acoustic siren alarms unmuted (click to mute)'
              : 'Acoustic siren alarms muted (click to enable)'
          }
          aria-label={soundEnabled ? 'Mute siren alarm audio' : 'Enable siren alarm audio'}
        >
          {soundEnabled ? (
            <Volume2 size={19} className="text-leaf" />
          ) : (
            <VolumeX size={19} className="text-muted" />
          )}
        </button>

        {/* Device connection status */}
        <div
          className={`status-chip ${isLiveHardware ? 'chip-live' : 'chip-demo'}`}
          title={
            isLiveHardware
              ? 'Confirmed connection with authenticated physical hardware'
              : 'No authenticated physical device is connected'
          }
        >
          <span className={`pulse-dot ${isLiveHardware ? 'pulse-live' : 'pulse-demo'}`} />
          <Wifi size={14} />
          <span>{isLiveHardware ? 'LIVE HARDWARE' : 'DEVICE OFFLINE'}</span>
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
                  ? `${unresolvedCount} alert${unresolvedCount > 1 ? 's' : ''} require review.`
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
          title={`Signed in as ${userEmail} (${userRole}) — click to sign out`}
        >
          <span className="avatar small-avatar">
            {(userEmail || 'D').slice(0, 1).toUpperCase()}
          </span>
          <span className="user-chip-name">
            {userRole === 'admin' ? 'Admin' : 'Farmer'}
          </span>
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
