import React from 'react';
import { Activity, Compass, Bell, SlidersHorizontal, Settings } from 'lucide-react';

export default function MobileDock({ activeNav, onNavigate, unresolvedCount }) {
  const dockItems = [
    { id: 'Overview', label: 'Overview', icon: Activity },
    { id: 'Live Monitoring', label: 'Live', icon: Compass },
    { id: 'Alerts', label: 'Alerts', icon: Bell, badge: unresolvedCount },
    { id: 'Controls', label: 'Controls', icon: SlidersHorizontal },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="mobile-dock" aria-label="Mobile quick navigation">
      {dockItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeNav === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={isActive ? 'active' : ''}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={19} />
            <span>{item.label}</span>
            {Boolean(item.badge && item.badge > 0) && (
              <span className="dock-badge">{item.badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
