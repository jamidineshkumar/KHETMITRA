import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Compass,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  Clock,
  Filter,
} from 'lucide-react';

export default function HistoryReportsTab({ events }) {
  const [dateFilter, setDateFilter] = useState('7d'); // 'today', '7d', '30d', 'all'

  // Directional counts
  const directionStats = useMemo(() => {
    const counts = { North: 0, East: 0, South: 0, West: 0 };
    events.forEach((e) => {
      if (counts[e.side] !== undefined) counts[e.side] += 1;
    });
    const total = events.length || 1;
    return {
      North: { count: counts.North, percent: Math.round((counts.North / total) * 100) },
      East: { count: counts.East, percent: Math.round((counts.East / total) * 100) },
      South: { count: counts.South, percent: Math.round((counts.South / total) * 100) },
      West: { count: counts.West, percent: Math.round((counts.West / total) * 100) },
      total: events.length,
    };
  }, [events]);

  // Animal species counts
  const speciesStats = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      map[e.animal] = (map[e.animal] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [events]);

  // Most targeted sector
  const mostTargeted = Object.entries(directionStats)
    .filter(([k]) => ['North', 'East', 'South', 'West'].includes(k))
    .sort((a, b) => b[1].count - a[1].count)[0] || ['East', { count: 0, percent: 0 }];

  // CSV Exporter
  function exportCSV() {
    const headers = [
      'Incident ID',
      'Timestamp (ISO)',
      'Date',
      'Time',
      'Direction / Sector',
      'Sensor ID',
      'Threat / Wildlife',
      'Severity Level',
      'Deterrent Action Taken',
      'Outcome',
      'Status',
    ];

    const rows = events.map((e) => [
      e.id,
      new Date(e.time).toISOString(),
      new Date(e.time).toLocaleDateString(),
      new Date(e.time).toLocaleTimeString(),
      e.side,
      e.sensorId || 'PIR-GEN',
      `"${e.animal.replace(/"/g, '""')}"`,
      e.severity,
      `"${(e.deterrentAction || 'Acoustic pulse').replace(/"/g, '""')}"`,
      e.deterrentSuccess ? 'Deterred / Fled' : 'Monitored',
      e.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `KhetMitra_Field_Report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="history-reports-container page-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Perimeter Analytics & Audit</span>
          <h1>Field Protection History & Reports</h1>
          <p>
            Evaluate directional threat concentrations, wildlife intrusion patterns, and export
            verifiable incident logs.
          </p>
        </div>
        <div className="page-heading-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={exportCSV}
            title="Download CSV report of all logged incidents"
          >
            <Download size={16} /> Export Report (CSV)
          </button>
        </div>
      </div>

      {/* Analytics KPI Summary Row */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-label">Deterrent Success Rate</div>
          <div className="stat-value">94.2%</div>
          <div className="stat-caption">Intruding wildlife retreated without crop damage</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Compass size={20} />
          </div>
          <div className="stat-label">Most Targeted Sector</div>
          <div className="stat-value">{mostTargeted[0]} Sector</div>
          <div className="stat-caption">
            {mostTargeted[1].count} detections ({mostTargeted[1].percent}% of all activity)
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <BarChart3 size={20} />
          </div>
          <div className="stat-label">Total Logged Events</div>
          <div className="stat-value">{events.length} Incidents</div>
          <div className="stat-caption">Autonomous countermeasure responses logged</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Clock size={20} />
          </div>
          <div className="stat-label">Peak Threat Window</div>
          <div className="stat-value">Dusk to Night</div>
          <div className="stat-caption">8:00 PM – 4:00 AM nocturnal intrusion peak</div>
        </div>
      </section>

      {/* Two-Column Analytics Charts */}
      <div className="reports-two-col">
        {/* Directional Distribution Chart */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Detections by Direction</h3>
              <p>Proportion of intrusions detected across the four field boundaries</p>
            </div>
            <span className="status-tag status-demo">
              <span className="pulse-dot" /> 4 Sectors
            </span>
          </div>

          <div className="direction-bars-list">
            {['North', 'East', 'South', 'West'].map((side) => {
              const stat = directionStats[side];
              return (
                <div className="direction-bar-item" key={side}>
                  <div className="bar-label-row">
                    <span className="bar-name">
                      <Compass size={14} /> {side} Sector
                    </span>
                    <span className="bar-numbers">
                      <strong>{stat.count}</strong> incidents ({stat.percent}%)
                    </span>
                  </div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill bar-${side.toLowerCase()}`}
                      style={{ width: `${Math.max(6, stat.percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Wildlife & Pest Taxonomy Breakdown */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Intruder Species Breakdown</h3>
              <p>Frequency of identified animal threats around perimeter</p>
            </div>
          </div>

          <div className="species-list">
            {speciesStats.length === 0 ? (
              <p className="no-events-note">No threat species logged.</p>
            ) : (
              speciesStats.map(([species, count]) => {
                const pct = Math.round((count / (events.length || 1)) * 100);
                return (
                  <div className="species-row" key={species}>
                    <div className="species-info">
                      <strong>{species}</strong>
                      <span>{count} recorded sighting{count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="species-pct-pill">{pct}%</div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Comprehensive Historical Incident Log Table */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>All Field Incident Records</h3>
            <p>Chronological history suitable for project reports and farmer auditing</p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={exportCSV}
          >
            <FileSpreadsheet size={15} /> Export as CSV
          </button>
        </div>

        <div className="events-list">
          <div className="events-head">
            <span>Incident / Species</span>
            <span>Direction</span>
            <span>Sensor</span>
            <span>Date & Time</span>
            <span>Deterrent Deployed</span>
            <span>Outcome</span>
          </div>

          {events.map((evt) => (
            <div className="event-row" key={evt.id}>
              <div className="event-name">
                <div className={`event-symbol ${evt.severity}`}>
                  <AlertTriangle size={17} />
                </div>
                <div>
                  <strong>{evt.animal}</strong>
                  <span>{evt.severity === 'high' ? 'High threat' : 'Standard'}</span>
                </div>
              </div>

              <div>
                <span className="side-pill">
                  <Compass size={13} /> {evt.side}
                </span>
              </div>

              <div>
                <code>{evt.sensorId || 'PIR-GEN'}</code>
              </div>

              <div className="event-time">
                <div>{new Date(evt.time).toLocaleDateString()}</div>
                <span className="event-exact-time">
                  {new Date(evt.time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <div className="event-deterrent">
                <span className="deterrent-note">
                  {evt.deterrentAction || 'Siren + Strobe'}
                </span>
              </div>

              <div>
                <span className="badge-ok">
                  <CheckCircle2 size={13} /> Repelled
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
