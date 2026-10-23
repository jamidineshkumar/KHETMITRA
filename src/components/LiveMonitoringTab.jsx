import React, { useState } from 'react';
import {
  Compass,
  Radar,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Radio,
  Zap,
  Volume2,
  Lightbulb,
  Check,
  Layers,
  Activity,
  Info,
} from 'lucide-react';
import { INITIAL_ZONES } from '../constants/farmData';

export default function LiveMonitoringTab({
  events,
  selectedZone,
  setSelectedZone,
  onSimulateDetection,
  onTriggerZoneTest,
  buzzerOn,
  lightOn,
}) {
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' or 'map'

  // Latest event per zone
  const latestBySide = Object.fromEntries(
    ['North', 'East', 'South', 'West'].map((side) => [
      side,
      events.find((e) => e.side === side),
    ])
  );

  const selectedZoneData =
    INITIAL_ZONES.find((z) => z.name === selectedZone) || INITIAL_ZONES[0];
  const selectedZoneEvents = events.filter((e) => e.side === selectedZoneData.name);

  return (
    <div className="live-monitoring-container page-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Real-Time Perimeter Radar</span>
          <h1>Live Field Monitoring</h1>
          <p>
            Continuous 360° directional scanning across North, East, South, and West field
            boundaries.
          </p>
        </div>
        <div className="page-heading-actions">
          <div className="button-group">
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'radar' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('radar')}
            >
              <Radar size={16} /> Radar View
            </button>
            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'map' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('map')}
            >
              <Layers size={16} /> Boundary Map
            </button>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onSimulateDetection(selectedZoneData.name)}
          >
            <Plus size={16} /> Simulate on {selectedZoneData.name}
          </button>
        </div>
      </div>

      {/* Main Radar & Live Sector Visualization Layout */}
      <div className="radar-layout-grid">
        {/* Left: Radar Visualizer */}
        <section className="panel radar-display-card">
          <div className="panel-heading">
            <div>
              <h3>Field Radar Sector</h3>
              <p>Visual radar sweep with detected motion hotspots</p>
            </div>
            <span className="status-tag status-demo">
              <span className="pulse-dot" /> Continuous Sweep
            </span>
          </div>

          {activeTab === 'radar' ? (
            <div className="radar-stage">
              <div className="radar-ring ring-one" />
              <div className="radar-ring ring-two" />
              <div className="radar-ring ring-three" />
              <div className="radar-sweep" />

              {/* Direction Labels & Clickable Sector Zones */}
              <button
                type="button"
                className={`radar-sector-label north ${selectedZoneData.name === 'North' ? 'active-zone' : ''}`}
                onClick={() => setSelectedZone('North')}
              >
                <span>NORTH (0°)</span>
                {latestBySide.North?.status === 'New' && <span className="blip-radar blip-north" />}
              </button>

              <button
                type="button"
                className={`radar-sector-label east ${selectedZoneData.name === 'East' ? 'active-zone' : ''}`}
                onClick={() => setSelectedZone('East')}
              >
                <span>EAST (90°)</span>
                {latestBySide.East?.status === 'New' && <span className="blip-radar blip-east" />}
              </button>

              <button
                type="button"
                className={`radar-sector-label south ${selectedZoneData.name === 'South' ? 'active-zone' : ''}`}
                onClick={() => setSelectedZone('South')}
              >
                <span>SOUTH (180°)</span>
                {latestBySide.South?.status === 'New' && <span className="blip-radar blip-south" />}
              </button>

              <button
                type="button"
                className={`radar-sector-label west ${selectedZoneData.name === 'West' ? 'active-zone' : ''}`}
                onClick={() => setSelectedZone('West')}
              >
                <span>WEST (270°)</span>
                {latestBySide.West?.status === 'New' && <span className="blip-radar blip-west" />}
              </button>

              {/* Central IoT Node */}
              <div className="radar-center" title="Central ESP32 Hub & Master Station">
                <Radar size={24} />
              </div>
            </div>
          ) : (
            /* Field Boundary Map Representation */
            <div className="field-map" role="img" aria-label="Field boundary map">
              <div className="map-top-label">
                N <span>↑</span>
              </div>
              <div className="map-side-label map-west">W</div>
              <div className="map-side-label map-east">E</div>
              <div className="map-bottom-label">
                S <span>↓</span>
              </div>

              {['North', 'East', 'South', 'West'].map((side) => {
                const isSelected = selectedZoneData.name === side;
                const hasAlert = latestBySide[side]?.status === 'New';
                return (
                  <button
                    key={side}
                    type="button"
                    className={`map-zone zone-${side.toLowerCase()} ${isSelected ? 'map-zone-selected' : ''}`}
                    onClick={() => setSelectedZone(side)}
                  >
                    <span className="zone-direction">{side} Sector</span>
                    {hasAlert && (
                      <span className="map-alert">
                        <AlertTriangle size={13} /> Motion
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="map-crop">
                <div className="crop-title">
                  <Activity size={18} />
                  <span>KhetMitra Central</span>
                </div>
                <div className="crop-caption">ESP32 Hub · 5.5 Acres</div>
              </div>
            </div>
          )}

          <p className="radar-caption">
            Click on any sector marker (North, East, South, West) to inspect sensor sensitivity,
            boundary length, and specific deterrent records.
          </p>
        </section>

        {/* Right: Selected Sector Detail Panel */}
        <section className="panel zone-detail-card">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">{selectedZoneData.heading}</span>
              <h3>{selectedZoneData.label}</h3>
              <p>{selectedZoneData.note}</p>
            </div>
            <span
              className={`status-pill ${
                latestBySide[selectedZoneData.name]?.status === 'New'
                  ? 'mode-alert'
                  : 'mode-armed'
              }`}
            >
              {latestBySide[selectedZoneData.name]?.status === 'New'
                ? 'ALERT DETECTED'
                : 'SECTOR SECURE'}
            </span>
          </div>

          <div className="zone-spec-grid">
            <div className="spec-box">
              <span className="spec-label">Assigned Sensor</span>
              <strong>{selectedZoneData.sensorId}</strong>
              <span className="spec-sub">{selectedZoneData.sensitivity}</span>
            </div>
            <div className="spec-box">
              <span className="spec-label">Perimeter Span</span>
              <strong>{selectedZoneData.perimeterLength}</strong>
              <span className="spec-sub">Fenced Boundary</span>
            </div>
            <div className="spec-box">
              <span className="spec-label">Protected Crop</span>
              <strong>{selectedZoneData.crop}</strong>
              <span className="spec-sub">High-yield zone</span>
            </div>
            <div className="spec-box">
              <span className="spec-label">Heartbeat Ping</span>
              <strong>{selectedZoneData.lastPing}</strong>
              <span className="spec-sub">Status: {selectedZoneData.sensorStatus}</span>
            </div>
          </div>

          {/* Quick Zone Test Buttons */}
          <div className="zone-test-actions">
            <button
              type="button"
              className="btn btn-outline btn-sm flex-1"
              onClick={() => onTriggerZoneTest(selectedZoneData.name, 'buzzer')}
            >
              <Volume2 size={16} /> Test Sector Siren
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm flex-1"
              onClick={() => onTriggerZoneTest(selectedZoneData.name, 'light')}
            >
              <Lightbulb size={16} /> Flash Sector Strobe
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm flex-1"
              onClick={() => onSimulateDetection(selectedZoneData.name)}
            >
              <Plus size={16} /> Simulate Intrusion
            </button>
          </div>

          {/* Activity on this sector */}
          <div className="zone-history-feed">
            <h4>Recent Intrusions on {selectedZoneData.name} Boundary</h4>
            {selectedZoneEvents.length === 0 ? (
              <p className="no-events-note">No motion detections logged for this sector.</p>
            ) : (
              <div className="zone-event-pills">
                {selectedZoneEvents.slice(0, 3).map((evt) => (
                  <div key={evt.id} className="zone-event-pill">
                    <div className="zep-left">
                      <span className={`zep-dot ${evt.severity}`} />
                      <strong>{evt.animal}</strong>
                      <span className="zep-time">
                        {new Date(evt.time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="zep-action">{evt.deterrentAction || 'Acoustic pulse'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 4 Interactive Zone Cards */}
      <section className="direction-section">
        <div className="section-heading">
          <h2>Perimeter Boundary Sectors</h2>
          <p>
            Select a sector below to focus your radar view, inspect sensor telemetry, or test deterrents.
          </p>
        </div>

        <div className="direction-grid">
          {INITIAL_ZONES.map((zone) => {
            const latest = latestBySide[zone.name];
            const isAlert = latest?.status === 'New';
            const isSelected = selectedZoneData.name === zone.name;

            return (
              <button
                key={zone.name}
                type="button"
                className={`direction-card ${isAlert ? 'is-alert' : ''} ${
                  isSelected ? 'is-selected' : ''
                }`}
                onClick={() => setSelectedZone(zone.name)}
              >
                <div className="direction-compass" aria-hidden="true">
                  <Compass size={18} />
                </div>
                <div className="direction-copy">
                  <strong>{zone.name} Sector</strong>
                  <span>{zone.note}</span>
                </div>
                <span className={`zone-status ${isAlert ? 'zone-status-alert' : ''}`}>
                  <i />
                  {isAlert ? 'Motion Alert' : 'Secure'}
                </span>
                <p className="direction-meta">
                  {latest
                    ? `${latest.animal} · ${formatTimeAgo(latest.time)}`
                    : 'No recent activity'}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function formatTimeAgo(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
