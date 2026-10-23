import React, { useState } from 'react';
import {
  Cpu,
  Radio,
  Wifi,
  Zap,
  BatteryCharging,
  Thermometer,
  ShieldCheck,
  AlertCircle,
  Activity,
  HardDrive,
  Clock,
  Terminal,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';
import { INITIAL_SENSORS, INITIAL_ACTUATORS } from '../constants/farmData';

export default function DeviceSensorsTab({
  isLiveHardware,
  espHeartbeatSeconds,
  onPingController,
}) {
  const [pinging, setPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  function handlePing() {
    setPinging(true);
    setPingSuccess(false);
    setTimeout(() => {
      setPinging(false);
      setPingSuccess(true);
      onPingController();
      setTimeout(() => setPingSuccess(false), 3000);
    }, 600);
  }

  return (
    <div className="device-sensors-container page-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Hardware Architecture & Telemetry</span>
          <h1>Device & Sensor Management</h1>
          <p>
            Monitor the ESP32 microcontroller, directional PIR motion sensors, actuators, and solar
            power systems.
          </p>
        </div>
        <div className="page-heading-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handlePing}
            disabled={pinging}
          >
            <RefreshCw size={16} className={pinging ? 'spin-icon' : ''} />
            {pinging ? 'Pinging Node…' : 'Ping ESP32'}
          </button>
        </div>
      </div>

      {pingSuccess && (
        <div className="form-message success" role="status">
          <Check size={16} />
          <span>Controller ping is unavailable until the physical ESP32 is connected.</span>
        </div>
      )}

      {/* ESP32 Controller Telemetry Card */}
      <section className="panel esp-controller-card">
        <div className="panel-heading">
          <div className="esp-head-info">
            <div className="esp-avatar">
              <Cpu size={26} />
            </div>
            <div>
              <h3>ESP32 Microcontroller Hub</h3>
              <p>Node MCU ESP-WROOM-32 · Master Field Gateway</p>
            </div>
          </div>
          <div className="esp-tags">
            {isLiveHardware ? (
              <span className="hardware-live-badge">
                <span className="pulse-live" /> LIVE HARDWARE
              </span>
            ) : (
              <span className="hardware-demo-badge">
                <span className="pulse-demo" /> HARDWARE NOT CONNECTED
              </span>
            )}
          </div>
        </div>

        <div className="esp-telemetry-grid">
          <div className="telemetry-box">
            <span className="tel-label">
              <Wifi size={14} /> Network Connectivity
            </span>
            <strong>{isLiveHardware ? 'WiFi: Connected' : 'Waiting for ESP32 connection'}</strong>
            <span className="tel-sub">RSSI: -64 dBm · Farm-Mesh-2.4G</span>
          </div>

          <div className="telemetry-box">
            <span className="tel-label">
              <Clock size={14} /> Last Heartbeat
            </span>
            <strong>{espHeartbeatSeconds == null ? 'No heartbeat received' : `${espHeartbeatSeconds} seconds ago`}</strong>
            <span className="tel-sub">Heartbeat Interval: 10s</span>
          </div>

          <div className="telemetry-box">
            <span className="tel-label">
              <BatteryCharging size={14} /> Solar Battery Rail
            </span>
            <strong>4.15 V (92% Charged)</strong>
            <span className="tel-sub">Solar Influx: +380mA</span>
          </div>

          <div className="telemetry-box">
            <span className="tel-label">
              <Thermometer size={14} /> Core Temperature
            </span>
            <strong>38.2 °C (Normal)</strong>
            <span className="tel-sub">Operating Range: -10° to 70°C</span>
          </div>

          <div className="telemetry-box">
            <span className="tel-label">
              <HardDrive size={14} /> SRAM Memory
            </span>
            <strong>184 KB Free / 320 KB</strong>
            <span className="tel-sub">Heap fragmentation: 6%</span>
          </div>

          <div className="telemetry-box">
            <span className="tel-label">
              <Terminal size={14} /> Firmware Release
            </span>
            <strong>v1.2.0-khetmitra</strong>
            <span className="tel-sub">ESP-IDF v4.4 + FreeRTOS</span>
          </div>
        </div>
      </section>

      {/* Configured Sensors Grid */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Configured Perimeter & Environmental Sensors</h3>
            <p>4 directional motion detectors + ambient light & climate monitoring</p>
          </div>
          <span className="status-tag status-demo">
            <span className="pulse-dot" /> 6 / 6 Operational
          </span>
        </div>

        <div className="sensors-grid">
          {INITIAL_SENSORS.map((s) => (
            <div className="sensor-card" key={s.id}>
              <div className="sensor-card-top">
                <span className="sensor-id-tag">{s.id}</span>
                <span className="sensor-live-dot" title="Sensor operational" />
              </div>
              <h4 className="sensor-title">{s.name}</h4>
              <p className="sensor-type">{s.type}</p>

              <div className="sensor-props">
                <div className="sensor-prop">
                  <span>Sector:</span>
                  <strong>{s.sector}</strong>
                </div>
                <div className="sensor-prop">
                  <span>Hardware Pin:</span>
                  <code>{s.gpio}</code>
                </div>
                <div className="sensor-prop">
                  <span>Detection Range:</span>
                  <strong>{s.range || s.reading}</strong>
                </div>
                <div className="sensor-prop">
                  <span>Power / Battery:</span>
                  <strong>{s.battery || 'Rail Powered'}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actuators & Deterrent Hardware */}
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Actuators & Deterrent Hardware</h3>
            <p>Acoustic and optical repellent units operated by ESP32 PWM & relays</p>
          </div>
        </div>

        <div className="actuators-grid">
          {INITIAL_ACTUATORS.map((act) => (
            <div className="actuator-card" key={act.id}>
              <div className="actuator-head">
                <div className="actuator-icon">
                  <Zap size={20} />
                </div>
                <div>
                  <strong>{act.name}</strong>
                  <span className="act-type">{act.type}</span>
                </div>
              </div>
              <p className="act-desc">{act.description}</p>
              <div className="act-pin-row">
                <span>Controlled via:</span>
                <code>{act.gpio}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hardware Pinout & College Project Documentation */}
      <section className="panel hardware-guide-panel">
        <div className="panel-heading">
          <div>
            <h3>ESP32 Pinout & Integration Reference</h3>
            <p>Wiring specifications for building and demonstrating physical KhetMitra hardware</p>
          </div>
        </div>

        <div className="pinout-table-wrapper">
          <table className="pinout-table">
            <thead>
              <tr>
                <th>ESP32 Pin</th>
                <th>Peripheral Device</th>
                <th>Signal Type</th>
                <th>Recommended Circuit / Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>GPIO 13</code></td>
                <td>North PIR Motion Sensor</td>
                <td>Digital Input (Active HIGH)</td>
                <td>HC-SR501 with 3.3V output level or voltage divider</td>
              </tr>
              <tr>
                <td><code>GPIO 12</code></td>
                <td>East Radar / Microwave Dual PIR</td>
                <td>Digital Input (Interrupt)</td>
                <td>RCWL-0516 Doppler radar or dual sensor module</td>
              </tr>
              <tr>
                <td><code>GPIO 14</code></td>
                <td>South Boundary PIR</td>
                <td>Digital Input (Active HIGH)</td>
                <td>HC-SR501 mounted with weather-sealed Fresnel lens</td>
              </tr>
              <tr>
                <td><code>GPIO 27</code></td>
                <td>West Storage PIR</td>
                <td>Digital Input (Active HIGH)</td>
                <td>HC-SR501 connected to hardware interrupt handler</td>
              </tr>
              <tr>
                <td><code>GPIO 26</code></td>
                <td>Field Buzzer / Piezo Transducer</td>
                <td>PWM Output (LEDC Channel 0)</td>
                <td>NPN Transistor / MOSFET driver (e.g. 2N2222 or IRFZ44N)</td>
              </tr>
              <tr>
                <td><code>GPIO 25</code></td>
                <td>Scarecrow Strobe Spotlight</td>
                <td>PWM / Relay Output</td>
                <td>Optoisolated 5V Relay module or logic-level MOSFET</td>
              </tr>
              <tr>
                <td><code>GPIO 34</code></td>
                <td>Ambient Light (LDR)</td>
                <td>Analog Input (ADC1_CH6)</td>
                <td>10kΩ voltage divider for dusk-to-dawn mode detection</td>
              </tr>
              <tr>
                <td><code>GPIO 4</code></td>
                <td>Field Climate (DHT22)</td>
                <td>Single-bus Digital Input</td>
                <td>4.7kΩ pull-up resistor to 3.3V rail</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
