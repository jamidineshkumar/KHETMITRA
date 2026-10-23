import React from 'react';
import {
  X,
  UserRound,
  ExternalLink,
  Linkedin,
  Instagram,
  Github,
  Sparkles,
  Code2,
  Cpu,
  Layers,
  Award,
} from 'lucide-react';

export default function DinuvoxModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop dinuvox-backdrop-blur" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card dinuvox-aesthetic-card" onClick={(e) => e.stopPropagation()}>
        {/* Animated Glowing Aura Border */}
        <div className="dinuvox-glow-aura" />

        <div className="dinuvox-card-inner">
          <div className="dinuvox-header-band">
            <div className="dinuvox-avatar-wrapper">
              <div className="dinuvox-avatar-ring">
                <div className="dinuvox-avatar-core">
                  <UserRound size={38} />
                </div>
              </div>
              <span className="dinuvox-online-pulse" title="Lead Architect" />
            </div>

            <button
              type="button"
              className="dinuvox-close-btn"
              onClick={onClose}
              aria-label="Close credentials"
            >
              <X size={18} />
            </button>
          </div>

          <div className="dinuvox-body-content">
            <div className="dinuvox-title-group">
              <span className="dinuvox-shimmer-tag">
                <Sparkles size={12} /> Master Creator & Architect
              </span>
              <h2 className="dinuvox-name">Dinuvox</h2>
              <p className="dinuvox-tagline">
                Lead Full-Stack, IoT Hardware & UI/UX Systems Architect
              </p>
            </div>

            <p className="dinuvox-bio-narrative">
              Architect and developer of the <strong>KhetMitra</strong> platform. Specialized in
              resilient embedded IoT firmware, real-time directional telemetry, agricultural perimeter
              security, and modern full-stack web applications.
            </p>

            {/* Architecture Highlights */}
            <div className="dinuvox-tech-badges">
              <span className="d-tech-badge">
                <Cpu size={13} /> ESP32 FreeRTOS
              </span>
              <span className="d-tech-badge">
                <Code2 size={13} /> React 18 + Vite
              </span>
              <span className="d-tech-badge">
                <Layers size={13} /> Supabase Realtime
              </span>
              <span className="d-tech-badge">
                <Award size={13} /> Autonomous AI Repellers
              </span>
            </div>

            {/* Social Connect Buttons */}
            <div className="dinuvox-aesthetic-links">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="d-aesthetic-link d-link-linkedin"
              >
                <Linkedin size={18} />
                <span>LinkedIn</span>
                <ExternalLink size={13} className="d-link-arrow" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="d-aesthetic-link d-link-instagram"
              >
                <Instagram size={18} />
                <span>Instagram</span>
                <ExternalLink size={13} className="d-link-arrow" />
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="d-aesthetic-link d-link-github"
              >
                <Github size={18} />
                <span>GitHub</span>
                <ExternalLink size={13} className="d-link-arrow" />
              </a>
            </div>
          </div>

          <div className="dinuvox-card-foot">
            <span className="dinuvox-foot-text">Crafted with passion for Indian agriculture · 2026</span>
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
