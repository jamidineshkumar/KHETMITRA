import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Lightbulb,
  ShieldCheck,
  ShieldOff,
  ShieldAlert,
  Flame,
  Zap,
  SlidersHorizontal,
  Clock,
  RotateCcw,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function ControlsTab({
  operatingMode,
  setOperatingMode,
  buzzerOn,
  setBuzzerOn,
  buzzerIntensity,
  setBuzzerIntensity,
  lightOn,
  setLightOn,
  lightIntensity,
  setLightIntensity,
  autoProtection,
  setAutoProtection,
  autoDuration,
  setAutoDuration,
  onTriggerAlarm,
  onSilenceAll,
  onTestPulse,
  isLiveHardware,
}) {
  const [panicCountdown, setPanicCountdown] = useState(0);

  function handlePanicAlarm() {
    onTriggerAlarm();
    setPanicCountdown(10);
    const interval = setInterval(() => {
      setPanicCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return (
    <div className="controls-container page-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Acoustic & Optical Countermeasures</span>
          <h1>Deterrent & Device Controls</h1>
          <p>
            Remotely calibrate siren volumes, scarecrow lighting brightness, and autonomous field
            response rules.
          </p>
        </div>
        <div className="page-heading-actions">
          <span className="status-tag status-demo">
            <span className="pulse-dot" /> {isLiveHardware ? 'Hardware Linked' : 'Simulation Mode'}
          </span>
        </div>
      </div>

      {/* Emergency Panic Banner */}
      <section className="panel panic-banner-panel">
        <div className="panic-copy">
          <div className="panic-icon">
            <Flame size={26} />
          </div>
          <div>
            <h3>Emergency Perimeter Alarm</h3>
            <p>
              Instantly activates the 110dB high-decibel siren and maximum flash strobe on all four
              field boundaries.
            </p>
          </div>
        </div>
        <div className="panic-actions">
          {panicCountdown > 0 ? (
            <div className="panic-active-box">
              <span className="panic-countdown-badge">{panicCountdown}s remaining</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setPanicCountdown(0);
                  onSilenceAll();
                }}
              >
                Cancel / Silence
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handlePanicAlarm}
            >
              <Flame size={17} /> Trigger Panic Alarm
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline"
            onClick={onSilenceAll}
          >
            <VolumeX size={16} /> Silence All
          </button>
        </div>
      </section>

      {/* Master Mode Selector */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Field Protection Mode</h3>
            <p>Set the active defensive posture for the entire farm</p>
          </div>
        </div>

        <div className="mode-selection-grid">
          <div
            className={`mode-card ${operatingMode === 'ARMED' ? 'mode-card-active' : ''}`}
            onClick={() => setOperatingMode('ARMED')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setOperatingMode('ARMED')}
          >
            <div className="mode-card-icon armed">
              <ShieldCheck size={26} />
            </div>
            <h4>Armed (Active Guard)</h4>
            <p>
              PIR sensors continuously detect motion. If auto-deterrent is enabled, siren and strobe
              fire on intrusion.
            </p>
            <span className="mode-card-tag">Recommended for night</span>
          </div>

          <div
            className={`mode-card ${operatingMode === 'ALERT' ? 'mode-card-active-alert' : ''}`}
            onClick={() => setOperatingMode('ALERT')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setOperatingMode('ALERT')}
          >
            <div className="mode-card-icon alert">
              <ShieldAlert size={26} />
            </div>
            <h4>Heightened Alert</h4>
            <p>
              High-sensitivity threshold enabled. Triggers early warning pulses for any suspicious
              boundary movement.
            </p>
            <span className="mode-card-tag">Wild boar season</span>
          </div>

          <div
            className={`mode-card ${operatingMode === 'DISARMED' ? 'mode-card-active-disarmed' : ''}`}
            onClick={() => setOperatingMode('DISARMED')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setOperatingMode('DISARMED')}
          >
            <div className="mode-card-icon disarmed">
              <ShieldOff size={26} />
            </div>
            <h4>Disarmed (Maintenance)</h4>
            <p>
              Perimeter alarms silenced. Use during harvesting, irrigation, or when laborers are
              working in the fields.
            </p>
            <span className="mode-card-tag">Daytime maintenance</span>
          </div>
        </div>
      </section>

      {/* Hardware Actuators: Buzzer & Light Sliders */}
      <div className="control-grid">
        {/* Buzzer Control Card */}
        <article className="control-card">
          <div className="control-card-head">
            <div className={`control-icon ${buzzerOn ? 'icon-on' : ''}`}>
              <Volume2 size={24} />
            </div>
            <div>
              <h3>Field Siren & Buzzer</h3>
              <p>Acoustic predator deterrent</p>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={buzzerOn}
                onChange={(e) => setBuzzerOn(e.target.checked)}
              />
              <span className="switch-ui" />
              <span className="sr-only">Toggle field buzzer</span>
            </label>
          </div>

          <div className="slider-heading">
            <label htmlFor="buzzer-intensity">Sound Volume / Intensity</label>
            <strong>
              {buzzerIntensity}% (~{Math.round(45 + buzzerIntensity * 0.65)} dB)
            </strong>
          </div>
          <input
            id="buzzer-intensity"
            className="intensity-slider"
            type="range"
            min="10"
            max="100"
            step="5"
            value={buzzerIntensity}
            onChange={(e) => setBuzzerIntensity(Number(e.target.value))}
          />
          <div className="slider-ends">
            <span>Low (50 dB)</span>
            <span>Standard (80 dB)</span>
            <span>Max (110 dB)</span>
          </div>

          <div className="control-btn-row">
            <button
              className="btn btn-outline full-btn"
              type="button"
              onClick={() => onTestPulse('buzzer')}
            >
              <Volume2 size={17} /> Test 2-Second Siren Pulse
            </button>
          </div>
          <p className="control-footnote">
            ESP32 PWM duty cycle adjusts piezo frequency between 2.4kHz and 4.8kHz to prevent animal
            habituation.
          </p>
        </article>

        {/* Scarecrow Light Card */}
        <article className="control-card">
          <div className="control-card-head">
            <div className={`control-icon light ${lightOn ? 'icon-on-gold' : ''}`}>
              <Lightbulb size={24} />
            </div>
            <div>
              <h3>Scarecrow Strobe Spotlight</h3>
              <p>Optical night-flash deterrent</p>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={lightOn}
                onChange={(e) => setLightOn(e.target.checked)}
              />
              <span className="switch-ui" />
              <span className="sr-only">Toggle scarecrow light</span>
            </label>
          </div>

          <div className="slider-heading">
            <label htmlFor="light-intensity">Flash Brightness</label>
            <strong>
              {lightIntensity}% (~{Math.round(lightIntensity * 14)} Lumens)
            </strong>
          </div>
          <input
            id="light-intensity"
            className="intensity-slider"
            type="range"
            min="10"
            max="100"
            step="5"
            value={lightIntensity}
            onChange={(e) => setLightIntensity(Number(e.target.value))}
          />
          <div className="slider-ends">
            <span>Dim Strobe</span>
            <span>Medium Flash</span>
            <span>High Intensity</span>
          </div>

          <div className="control-btn-row">
            <button
              className="btn btn-outline full-btn"
              type="button"
              onClick={() => onTestPulse('light')}
            >
              <Lightbulb size={17} /> Test Strobe Flash Pulse
            </button>
          </div>
          <p className="control-footnote">
            Operates via 12V high-luminosity LED arrays switched by power MOSFET on GPIO 25.
          </p>
        </article>

        {/* Automatic Deterrent Rules */}
        <article className="control-card control-card-wide">
          <div className="control-card-head">
            <div className="control-icon">
              <Zap size={24} />
            </div>
            <div>
              <h3>Autonomous Protection Logic</h3>
              <p>ESP32 edge automation rules (runs even during network outages)</p>
            </div>
            <label className="switch-label">
              <input
                type="checkbox"
                checked={autoProtection}
                onChange={(e) => setAutoProtection(e.target.checked)}
              />
              <span className="switch-ui" />
              <span className="sr-only">Toggle automatic protection</span>
            </label>
          </div>

          <div className="auto-rules-grid">
            <div className="rule-box">
              <label htmlFor="duration-select">
                <Clock size={16} /> Deterrent Pulse Duration
              </label>
              <select
                id="duration-select"
                value={autoDuration || 10}
                onChange={(e) => setAutoDuration(Number(e.target.value))}
                className="filter-select"
              >
                <option value={5}>5 Seconds (Quick Scare)</option>
                <option value={10}>10 Seconds (Standard Protocol)</option>
                <option value={20}>20 Seconds (Persistent Intrusion)</option>
                <option value={30}>30 Seconds (Heavy Threat)</option>
              </select>
            </div>

            <div className="rule-box">
              <label htmlFor="cooldown-select">
                <RotateCcw size={16} /> Sensor Retrigger Cooldown
              </label>
              <select id="cooldown-select" className="filter-select" defaultValue={15}>
                <option value={10}>10 Seconds Cooldown</option>
                <option value={15}>15 Seconds Cooldown</option>
                <option value={30}>30 Seconds Cooldown</option>
              </select>
            </div>
          </div>

          <p className="control-footnote">
            When armed, physical ESP32 firmware executes detection logic in real time via local
            FreeRTOS tasks. In this browser prototype, simulated intrusion triggers will update these
            control states automatically.
          </p>
        </article>
      </div>
    </div>
  );
}
