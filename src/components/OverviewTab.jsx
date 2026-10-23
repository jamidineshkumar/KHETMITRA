import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Radio,
  Cpu,
  Volume2,
  VolumeX,
  Lightbulb,
  Zap,
  Clock,
  Compass,
  AlertTriangle,
  Check,
  Plus,
  Play,
  Flame,
  ArrowRight,
  Info,
} from 'lucide-react';
import FarmScene from './FarmScene';

export default function OverviewTab({
  operatingMode,
  setOperatingMode,
  isLiveHardware,
  espHeartbeatSeconds,
  sensors,
  events,
  buzzerOn,
  setBuzzerOn,
  buzzerIntensity,
  lightOn,
  setLightOn,
  lightIntensity,
  autoProtection,
  setAutoProtection,
  onSimulateDetection,
  onTriggerAlarm,
  onSilenceAll,
  onReviewEvent,
  onNavigate,
  onSelectZone,
}) {
  const unresolvedCount = events.filter((e) => e.status === 'New').length;
  const latestEvent = events[0];

  // Sensor stats
  const totalSensors = sensors.length;
  const activeSensors = sensors.filter((s) => s.status === 'active').length;
  const inactiveSensors = sensors.filter((s) => s.status === 'inactive').length;
  const faultSensors = sensors.filter((s) => s.status === 'fault').length;

  const modeBadge = {
    ARMED: { label: 'ARMED — Active Guard', icon: ShieldCheck, color: 'mode-armed' },
    ALERT: { label: 'ALERT — Breach Detected', icon: ShieldAlert, color: 'mode-alert' },
    DISARMED: { label: 'DISARMED — Standby', icon: ShieldOff, color: 'mode-disarmed' },
  }[operatingMode] || { label: operatingMode, icon: ShieldCheck, color: 'mode-armed' };

  const ModeIcon = modeBadge.icon;

  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'morning' : hours < 18 ? 'afternoon' : 'evening';

  return (
    <div className="overview-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-badges">
            <span className="eyebrow">Good {greeting}</span>
            <span className={`status-pill ${modeBadge.color}`}>
              <ModeIcon size={14} />
              {modeBadge.label}
            </span>
          </div>
          <h1>Your Farm, Protected</h1>
          <p>
            KhetMitra monitors boundaries around all four directions of your crops, detects intruding
            wildlife, and coordinates smart acoustic and optical deterrents.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSimulateDetection}
              title="Add a simulated wildlife intrusion event"
            >
              <Plus size={17} /> Simulate a detection
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onNavigate('Live Monitoring')}
            >
              <Compass size={17} /> Open Live Radar
            </button>
            <button
              type="button"
              className="btn btn-danger-soft"
              onClick={onTriggerAlarm}
              title="Test the field alarm buzzer & strobe"
            >
              <Flame size={17} /> Panic Alarm
            </button>
          </div>

          <div className="demo-disclaimer-tag">
            <Info size={14} />
            <span>
              {isLiveHardware
                ? 'Connected to authenticated physical ESP32 controller.'
                : 'DEMO MODE — simulated telemetry. Hardware sensors are not yet connected.'}
            </span>
          </div>
        </div>

        <FarmScene />
      </section>

      {/* Prominent Operating Mode & Hardware Status Banner */}
      <section className="dashboard-status-banner">
        <div className="status-banner-item">
          <span className="banner-sub">Operating State</span>
          <div className="banner-main">
            <span className={`banner-mode-pill ${modeBadge.color}`}>
              <ModeIcon size={16} />
              {operatingMode}
            </span>
            <div className="mode-toggle-group">
              <button
                type="button"
                className={`mode-btn ${operatingMode === 'ARMED' ? 'active' : ''}`}
                onClick={() => setOperatingMode('ARMED')}
              >
                Arm
              </button>
              <button
                type="button"
                className={`mode-btn ${operatingMode === 'ALERT' ? 'active' : ''}`}
                onClick={() => setOperatingMode('ALERT')}
              >
                Alert
              </button>
              <button
                type="button"
                className={`mode-btn ${operatingMode === 'DISARMED' ? 'active' : ''}`}
                onClick={() => setOperatingMode('DISARMED')}
              >
                Disarm
              </button>
            </div>
          </div>
        </div>

        <div className="status-banner-item">
          <span className="banner-sub">ESP32 Controller Status</span>
          <div className="banner-main">
            {isLiveHardware ? (
              <span className="hardware-live-badge">
                <span className="pulse-live" /> ESP32-ONLINE
              </span>
            ) : (
              <span className="hardware-demo-badge">
                <span className="pulse-demo" /> SIMULATED CONTROLLER
              </span>
            )}
            <span className="heartbeat-text">
              <Clock size={13} />
              Heartbeat: {espHeartbeatSeconds}s ago
            </span>
          </div>
        </div>

        <div className="status-banner-item">
          <span className="banner-sub">Field Deterrents</span>
          <div className="banner-deterrents">
            <span className={`deterrent-badge ${buzzerOn ? 'on' : 'off'}`}>
              {buzzerOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
              Buzzer: {buzzerOn ? `${buzzerIntensity}%` : 'OFF'}
            </span>
            <span className={`deterrent-badge ${lightOn ? 'on' : 'off'}`}>
              <Lightbulb size={14} />
              Light: {lightOn ? `${lightIntensity}%` : 'OFF'}
            </span>
            <span className={`deterrent-badge ${autoProtection ? 'auto-on' : 'off'}`}>
              <Zap size={14} />
              Auto: {autoProtection ? 'ENABLED' : 'MANUAL'}
            </span>
          </div>
        </div>
      </section>

      {/* Metrics Row: 4 Essential Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <ShieldCheck size={20} />
          </div>
          <div className="stat-label">Field Protection</div>
          <div className="stat-value">
            {operatingMode === 'DISARMED'
              ? 'Disarmed'
              : unresolvedCount > 0
              ? 'Needs Review'
              : 'Secure & Calm'}
          </div>
          <div className="stat-caption">
            {unresolvedCount > 0
              ? `${unresolvedCount} unreviewed simulated detection(s)`
              : 'Zero active perimeter breaches'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Radio size={20} />
          </div>
          <div className="stat-label">ESP32 IoT Node</div>
          <div className="stat-value">
            {isLiveHardware ? 'Live Hardware' : 'Demo Mode'}
          </div>
          <div className="stat-caption">
            {isLiveHardware
              ? 'WiFi RSSI -64 dBm · Authenticated'
              : 'Virtual loopback · Heartbeat: active'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Cpu size={20} />
          </div>
          <div className="stat-label">Sensors Configured</div>
          <div className="stat-value">{totalSensors} Total</div>
          <div className="stat-sensor-pills">
            <span className="sensor-pill active-pill">{activeSensors} Active</span>
            <span className="sensor-pill inactive-pill">{inactiveSensors} Inactive</span>
            {faultSensors > 0 && (
              <span className="sensor-pill fault-pill">{faultSensors} Fault</span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-label">Latest Detection</div>
          <div className="stat-value">
            {latestEvent ? latestEvent.side : 'None'}
          </div>
          <div className="stat-caption">
            {latestEvent
              ? `${latestEvent.animal} (${latestEvent.severity.toUpperCase()})`
              : 'No detection logs'}
          </div>
        </div>
      </section>

      {/* Quick Actions & Four-Directional Glance */}
      <div className="overview-two-col">
        {/* Directional Glance */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Four-Direction Field Zones</h3>
              <p>Perimeter motion sensors on North, East, South, and West sides</p>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => onNavigate('Live Monitoring')}
            >
              Open Full Radar →
            </button>
          </div>

          <div className="direction-glance-grid">
            {['North', 'East', 'South', 'West'].map((side) => {
              const zoneEvents = events.filter((e) => e.side === side);
              const latest = zoneEvents[0];
              const isAlert = latest?.status === 'New';
              return (
                <div
                  key={side}
                  className={`glance-card ${isAlert ? 'is-alert' : ''}`}
                  onClick={() => {
                    onSelectZone(side);
                    onNavigate('Live Monitoring');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSelectZone(side);
                      onNavigate('Live Monitoring');
                    }
                  }}
                >
                  <div className="glance-head">
                    <span className="glance-side">{side} Zone</span>
                    <span className={`glance-badge ${isAlert ? 'badge-alert' : 'badge-ok'}`}>
                      {isAlert ? 'Alert' : 'Secure'}
                    </span>
                  </div>
                  <div className="glance-body">
                    <strong>{latest ? latest.animal : 'Calm'}</strong>
                    <span>
                      {latest ? `Last: ${latest.deterrentAction || 'Monitored'}` : 'No activity logged'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Deterrent Controls Card */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Quick Deterrent Actions</h3>
              <p>Direct manual overrides for acoustic and optical countermeasures</p>
            </div>
            <span className="status-tag status-demo">
              <span className="pulse-dot" /> Safe Simulation
            </span>
          </div>

          <div className="quick-controls-list">
            <div className="quick-control-item">
              <div className="quick-control-meta">
                <div className={`quick-icon ${buzzerOn ? 'icon-on' : ''}`}>
                  <Volume2 size={19} />
                </div>
                <div>
                  <strong>Field Siren / Buzzer</strong>
                  <span>{buzzerOn ? `Active at ${buzzerIntensity}% intensity` : 'Standby / Silent'}</span>
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${buzzerOn ? 'btn-danger' : 'btn-outline'}`}
                onClick={() => setBuzzerOn(!buzzerOn)}
              >
                {buzzerOn ? 'Silence' : 'Activate'}
              </button>
            </div>

            <div className="quick-control-item">
              <div className="quick-control-meta">
                <div className={`quick-icon ${lightOn ? 'icon-on-gold' : ''}`}>
                  <Lightbulb size={19} />
                </div>
                <div>
                  <strong>Scarecrow Strobe Light</strong>
                  <span>{lightOn ? `Flashing at ${lightIntensity}% brightness` : 'Standby / Dark'}</span>
                </div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${lightOn ? 'btn-danger' : 'btn-outline'}`}
                onClick={() => setLightOn(!lightOn)}
              >
                {lightOn ? 'Turn Off' : 'Illuminate'}
              </button>
            </div>

            <div className="quick-control-item">
              <div className="quick-control-meta">
                <div className={`quick-icon ${autoProtection ? 'icon-on' : ''}`}>
                  <Zap size={19} />
                </div>
                <div>
                  <strong>Auto-Deterrent Reaction</strong>
                  <span>Automatically fires buzzer & strobe on sensor detection</span>
                </div>
              </div>
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={autoProtection}
                  onChange={(e) => setAutoProtection(e.target.checked)}
                />
                <span className="switch-ui" />
                <span className="sr-only">Toggle auto protection</span>
              </label>
            </div>
          </div>

          <div className="quick-footer-actions">
            <button
              type="button"
              className="btn btn-outline flex-1"
              onClick={onSilenceAll}
            >
              <VolumeX size={16} /> Silence All
            </button>
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={() => onNavigate('Controls')}
            >
              Full Controls <ArrowRight size={16} />
            </button>
          </div>
        </section>
      </div>

      {/* Recent Alerts Feed */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Recent Field Detection Alerts</h3>
            <p>Chronological feed of movement events and automated countermeasures</p>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => onNavigate('Alerts')}
          >
            View All ({events.length}) →
          </button>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={32} />
            <strong>No detection alerts</strong>
            <p>Your perimeter is calm. Click "Simulate a detection" to trigger a simulated intrusion.</p>
          </div>
        ) : (
          <div className="events-list">
            <div className="events-head">
              <span>Detection / Threat</span>
              <span>Direction</span>
              <span>Timestamp</span>
              <span>Deterrent Action</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {events.slice(0, 4).map((evt) => (
              <div className="event-row" key={evt.id}>
                <div className="event-name">
                  <div className={`event-symbol ${evt.severity}`}>
                    <AlertTriangle size={17} />
                  </div>
                  <div>
                    <strong>{evt.animal}</strong>
                    <span>{evt.threatLevel || 'Standard'} threat · Sensor {evt.sensorId}</span>
                  </div>
                </div>
                <div>
                  <span className="side-pill">
                    <Compass size={13} /> {evt.side}
                  </span>
                </div>
                <div className="event-time">
                  {formatTimeAgo(evt.time)}
                </div>
                <div className="event-deterrent">
                  <span className="deterrent-note">{evt.deterrentAction || 'Logged only'}</span>
                </div>
                <div>
                  <span className={`event-status ${evt.status === 'New' ? 'event-new' : 'event-reviewed'}`}>
                    <i />
                    {evt.status}
                  </span>
                </div>
                <div>
                  {evt.status === 'New' ? (
                    <button
                      type="button"
                      className="review-btn"
                      onClick={() => onReviewEvent(evt.id)}
                    >
                      <Check size={15} /> Review
                    </button>
                  ) : (
                    <span className="reviewed-check" title="Reviewed">
                      <Check size={16} />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatTimeAgo(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  return `${Math.floor(hours / 24)} d ago`;
}
