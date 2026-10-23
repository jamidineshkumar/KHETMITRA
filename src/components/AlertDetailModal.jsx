import React from 'react';
import {
  X,
  AlertTriangle,
  Compass,
  Clock,
  Cpu,
  Zap,
  Check,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export default function AlertDetailModal({ alert, onClose, onReview }) {
  if (!alert) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title-row">
            <div className={`event-symbol ${alert.severity}`}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3>{alert.animal}</h3>
              <p>Perimeter Detection Incident #{alert.id}</p>
            </div>
          </div>
          <button
            type="button"
            className="icon-button modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-meta-grid">
            <div className="modal-meta-box">
              <span className="mm-label">Directional Sector</span>
              <strong className="mm-value">
                <Compass size={15} /> {alert.side} Boundary
              </strong>
            </div>

            <div className="modal-meta-box">
              <span className="mm-label">Severity Level</span>
              <strong className={`mm-value text-${alert.severity}`}>
                {alert.severity.toUpperCase()} Priority
              </strong>
            </div>

            <div className="modal-meta-box">
              <span className="mm-label">Triggered Sensor</span>
              <strong className="mm-value">
                <Cpu size={15} /> {alert.sensorId || 'PIR-N01'}
              </strong>
            </div>

            <div className="modal-meta-box">
              <span className="mm-label">Event Timestamp</span>
              <strong className="mm-value">
                <Clock size={15} /> {new Date(alert.time).toLocaleTimeString()}
              </strong>
            </div>
          </div>

          <div className="modal-section">
            <span className="modal-section-title">
              <Zap size={16} /> Autonomous Deterrent Response
            </span>
            <div className="modal-deterrent-box">
              <strong>{alert.deterrentAction || 'Standard Acoustic & Optical Burst'}</strong>
              <p>
                {alert.deterrentSuccess
                  ? 'Countermeasures deployed successfully. Sensor returns to idle state.'
                  : 'Incident logged. Verification required.'}
              </p>
            </div>
          </div>

          {alert.notes && (
            <div className="modal-section">
              <span className="modal-section-title">
                <FileText size={16} /> Incident Field Notes
              </span>
              <p className="modal-notes-text">{alert.notes}</p>
            </div>
          )}

          <div className="modal-section">
            <span className="modal-section-title">
              <ShieldCheck size={16} /> Review Status
            </span>
            <p className="modal-status-text">
              Current state: <strong>{alert.status}</strong>
            </p>
          </div>
        </div>

        <div className="modal-actions">
          {alert.status === 'New' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onReview(alert.id);
                onClose();
              }}
            >
              <Check size={16} /> Mark as Reviewed
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
