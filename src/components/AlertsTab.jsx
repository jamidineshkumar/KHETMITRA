import React, { useState, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  Compass,
  Check,
  Search,
  Filter,
  Plus,
  Trash2,
  CheckCheck,
  ShieldCheck,
  Info,
  Clock,
  Layers,
} from 'lucide-react';

export default function AlertsTab({
  events,
  onReviewEvent,
  onReviewAll,
  onClearReviewed,
  onSimulateDetection,
  onSelectAlert,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Filtered list
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchSearch =
        evt.animal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.side.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (evt.notes && evt.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (evt.sensorId && evt.sensorId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDirection =
        selectedDirection === 'All' || evt.side === selectedDirection;
      const matchSeverity =
        selectedSeverity === 'All' || evt.severity === selectedSeverity.toLowerCase();
      const matchStatus =
        selectedStatus === 'All' || evt.status === selectedStatus;

      return matchSearch && matchDirection && matchSeverity && matchStatus;
    });
  }, [events, searchQuery, selectedDirection, selectedSeverity, selectedStatus]);

  const newCount = events.filter((e) => e.status === 'New').length;

  return (
    <div className="alerts-container page-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Intrusion Logs & Countermeasures</span>
          <h1>Perimeter Detection Alerts</h1>
          <p>
            Review directional threats detected by PIR motion sensors and verify autonomous deterrent
            actions.
          </p>
        </div>
        <div className="page-heading-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={onReviewAll}
            disabled={newCount === 0}
            title="Mark all pending alerts as reviewed"
          >
            <CheckCheck size={16} /> Mark All Reviewed
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onSimulateDetection()}
          >
            <Plus size={16} /> Simulate Alert
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <section className="panel alerts-filter-bar">
        <div className="filter-search-box">
          <Search size={17} className="filter-search-icon" />
          <input
            type="text"
            placeholder="Search by animal, sector (North/East), or sensor ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="filter-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="filter-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>

        <div className="filter-selects-row">
          <label className="filter-label">
            <span>Direction:</span>
            <select
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Directions</option>
              <option value="North">North Sector</option>
              <option value="East">East Sector</option>
              <option value="South">South Sector</option>
              <option value="West">West Sector</option>
            </select>
          </label>

          <label className="filter-label">
            <span>Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Severities</option>
              <option value="High">High (Dangerous Wildlife)</option>
              <option value="Medium">Medium (Grazing Cattle/Deer)</option>
              <option value="Low">Low (Minor Movement)</option>
            </select>
          </label>

          <label className="filter-label">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Statuses ({events.length})</option>
              <option value="New">New ({newCount})</option>
              <option value="Reviewed">Reviewed ({events.length - newCount})</option>
            </select>
          </label>

          {(searchQuery ||
            selectedDirection !== 'All' ||
            selectedSeverity !== 'All' ||
            selectedStatus !== 'All') && (
            <button
              type="button"
              className="text-button reset-filter-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedDirection('All');
                setSelectedSeverity('All');
                setSelectedStatus('All');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </section>

      {/* Alerts Table */}
      <section className="panel alerts-table-panel">
        <div className="panel-heading">
          <div>
            <h3>
              Detection Log Records{' '}
              <span className="heading-counter">({filteredEvents.length} visible)</span>
            </h3>
            <p>Click on any alert row to view sensor telemetry and incident summary.</p>
          </div>
          <span className="status-tag status-demo">
            <span className="pulse-dot" /> Simulated Database
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={36} />
            <strong>No matching alerts found</strong>
            <p>
              {events.length === 0
                ? 'Your field log is currently clean.'
                : 'No alerts match your search or filter criteria. Try adjusting filters.'}
            </p>
          </div>
        ) : (
          <div className="events-list">
            <div className="events-head">
              <span>Intruder / Threat</span>
              <span>Direction</span>
              <span>Sensor ID</span>
              <span>Timestamp</span>
              <span>Deterrent Action</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {filteredEvents.map((evt) => (
              <div
                className="event-row alert-row-clickable"
                key={evt.id}
                onClick={() => onSelectAlert(evt)}
              >
                <div className="event-name">
                  <div className={`event-symbol ${evt.severity}`}>
                    <AlertTriangle size={17} />
                  </div>
                  <div>
                    <strong>{evt.animal}</strong>
                    <span>
                      {evt.severity === 'high'
                        ? 'High Priority Intruder'
                        : evt.severity === 'medium'
                        ? 'Moderate Threat'
                        : 'Low Priority / Stray'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="side-pill">
                    <Compass size={13} /> {evt.side}
                  </span>
                </div>

                <div className="sensor-id-cell">
                  <code>{evt.sensorId || 'PIR-EXT'}</code>
                </div>

                <div className="event-time">
                  <div>{formatTimeAgo(evt.time)}</div>
                  <span className="event-exact-time">
                    {new Date(evt.time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                <div className="event-deterrent">
                  <span className="deterrent-note" title={evt.deterrentAction}>
                    {evt.deterrentAction || 'Acoustic pulse'}
                  </span>
                </div>

                <div>
                  <span
                    className={`event-status ${
                      evt.status === 'New' ? 'event-new' : 'event-reviewed'
                    }`}
                  >
                    <i />
                    {evt.status}
                  </span>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  {evt.status === 'New' ? (
                    <button
                      type="button"
                      className="review-btn"
                      onClick={() => onReviewEvent(evt.id)}
                    >
                      <Check size={15} /> Review
                    </button>
                  ) : (
                    <span className="reviewed-check" title="Reviewed & Cleared">
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
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
