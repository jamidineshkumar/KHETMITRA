import React, { useState } from 'react';
import {
  Settings,
  Radio,
  Bell,
  Activity,
  Save,
  Check,
  RotateCcw,
  Sprout,
  ShieldCheck,
  Database,
  Cloud,
  RefreshCw,
  Download,
  Info,
  Sparkles,
  Code2,
} from 'lucide-react';
import { hasSupabaseConfig } from '../supabase';
import { checkSupabaseHealth } from '../services/supabaseService';

export default function SettingsTab({
  farmProfile,
  onSaveFarmProfile,
  notificationSettings,
  onSaveNotificationSettings,
  onResetSimulatedData,
  onOpenDinuvoxModal,
  isLiveHardware,
  userEmail,
}) {
  // Local state for farm profile
  const [farmName, setFarmName] = useState(farmProfile.name || 'Green Valley Agricultural Plots');
  const [farmArea, setFarmArea] = useState(farmProfile.area || '5.5 Acres');
  const [farmCrops, setFarmCrops] = useState(farmProfile.crops || 'Wheat, Mustard, Seasonal Vegetables');
  const [farmLocation, setFarmLocation] = useState(farmProfile.location || 'Northern Boundary Canal Sector');

  // Notification settings
  const [soundAlerts, setSoundAlerts] = useState(notificationSettings.soundAlerts !== false);
  const [desktopNotify, setDesktopNotify] = useState(Boolean(notificationSettings.desktopNotify));

  const [toastMessage, setToastMessage] = useState('');
  const [dbTesting, setDbTesting] = useState(false);
  const [dbResult, setDbResult] = useState(null);

  function handleSaveFarm() {
    onSaveFarmProfile({
      name: farmName,
      area: farmArea,
      crops: farmCrops,
      location: farmLocation,
    });
    setToastMessage('Farm details updated and persisted!');
    setTimeout(() => setToastMessage(''), 3000);
  }

  function handleSaveNotify() {
    onSaveNotificationSettings({
      soundAlerts,
      desktopNotify,
    });
    setToastMessage('Notification preferences updated!');
    setTimeout(() => setToastMessage(''), 3000);
  }

  async function handleTestDbConnection() {
    setDbTesting(true);
    setDbResult(null);
    const res = await checkSupabaseHealth();
    setDbTesting(false);
    setDbResult(res);
  }

  function exportBackupJSON() {
    const backup = {
      farmProfile,
      notificationSettings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KhetMitra_Settings_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage('Settings exported to JSON file');
  }

  return (
    <div className="settings-container page-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Customization & Configuration</span>
          <h1>System Settings & Preferences</h1>
          <p>
            Configure agricultural field parameters, IoT connectivity status, and notification
            rules.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="form-message success" role="status">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Farm Profile Configuration */}
        <section className="panel settings-panel">
          <div className="panel-heading">
            <div>
              <h3>Farm & Field Profile</h3>
              <p>Geographic and crop specifications for your agricultural perimeter</p>
            </div>
            <Sprout size={20} className="text-leaf" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveFarm();
            }}
          >
            <label className="settings-field">
              Farm / Estate Name
              <input
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. Green Valley Farm"
                required
              />
            </label>

            <label className="settings-field">
              Total Monitored Area
              <input
                value={farmArea}
                onChange={(e) => setFarmArea(e.target.value)}
                placeholder="e.g. 5.5 Acres (2.2 Hectares)"
                required
              />
            </label>

            <label className="settings-field">
              Primary Cultivated Crops
              <input
                value={farmCrops}
                onChange={(e) => setFarmCrops(e.target.value)}
                placeholder="e.g. Wheat, Mustard, Vegetables"
                required
              />
            </label>

            <label className="settings-field">
              Field Boundary Region / Notes
              <input
                value={farmLocation}
                onChange={(e) => setFarmLocation(e.target.value)}
                placeholder="e.g. Near West Irrigation Canal"
              />
            </label>

            <button type="submit" className="btn btn-primary full-btn mt-3">
              <Save size={16} /> Save Farm Profile
            </button>
          </form>
        </section>

        {/* Unique Animated Dinuvox Creator Card (Kept only inside Settings!) */}
        <section className="panel settings-panel dinuvox-settings-card">
          <div className="dinuvox-shimmer-border" />
          <div className="dinuvox-card-content">
            <div className="dinuvox-pill-badge">
              <Sparkles size={14} className="sparkle-anim" />
              <span>Lead Architect & Creator</span>
            </div>
            <h3 className="dinuvox-heading-title">Dinuvox</h3>
            <p className="dinuvox-card-desc">
              Lead Full-Stack, IoT Hardware & UI/UX Systems Architect. Architect and engineer of the
              KhetMitra smart agricultural defense platform.
            </p>

            <div className="dinuvox-tag-row">
              <span className="dinuvox-mini-tag">
                <Code2 size={12} /> React 18 + Vite
              </span>
              <span className="dinuvox-mini-tag">
                <Radio size={12} /> ESP32 FreeRTOS
              </span>
              <span className="dinuvox-mini-tag">
                <Database size={12} /> Supabase Realtime
              </span>
            </div>

            <button
              type="button"
              className="dinuvox-action-btn"
              onClick={onOpenDinuvoxModal}
            >
              <Sparkles size={16} /> Reveal Dinuvox Credentials
            </button>
          </div>
        </section>

        {/* Audio & Alert Preferences */}
        <section className="panel settings-panel">
          <div className="panel-heading">
            <div>
              <h3>Alert & Notification Preferences</h3>
              <p>Customize user interface auditory alerts and notification rules</p>
            </div>
            <Bell size={20} className="text-leaf" />
          </div>

          <div className="notify-toggles-list">
            <div className="notify-toggle-item">
              <div>
                <strong>Auditory Siren on High Alert</strong>
                <p>Play simulated synthesizer tone when a high-priority intruder is detected</p>
              </div>
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={soundAlerts}
                  onChange={(e) => setSoundAlerts(e.target.checked)}
                />
                <span className="switch-ui" />
                <span className="sr-only">Toggle sound alerts</span>
              </label>
            </div>

            <div className="notify-toggle-item">
              <div>
                <strong>Desktop Push Notifications</strong>
                <p>Request browser permission to alert farmer even when tab is backgrounded</p>
              </div>
              <label className="switch-label">
                <input
                  type="checkbox"
                  checked={desktopNotify}
                  onChange={(e) => setDesktopNotify(e.target.checked)}
                />
                <span className="switch-ui" />
                <span className="sr-only">Toggle desktop notifications</span>
              </label>
            </div>
          </div>

          <div className="control-btn-row mt-3">
            <button
              type="button"
              className="btn btn-primary flex-1"
              onClick={handleSaveNotify}
            >
              <Save size={16} /> Save Preferences
            </button>
            <button
              type="button"
              className="btn btn-outline flex-1"
              onClick={exportBackupJSON}
            >
              <Download size={16} /> Backup Settings JSON
            </button>
          </div>
        </section>

        {/* IoT Gateway & Supabase Configuration */}
        <section className="panel settings-panel">
          <div className="panel-heading">
            <div>
              <h3>Backend & Database Connection</h3>
              <p>Supabase cloud synchronization and IoT gateway configuration</p>
            </div>
            <Database size={20} className="text-leaf" />
          </div>

          <div className="settings-note">
            <Cloud size={19} />
            <div>
              <strong>
                {hasSupabaseConfig ? 'Supabase Configuration Detected' : 'Supabase In Standby Mode'}
              </strong>
              <p>
                {hasSupabaseConfig
                  ? 'Authenticated via .env.local configuration. Realtime tables can synchronize physical ESP32 telemetry.'
                  : 'Supabase credentials are not detected in .env.local. The application is running in complete local offline demo mode.'}
              </p>
            </div>
          </div>

          <div className="health-list">
            <div className="health-row">
              <div className="health-icon">
                <Radio size={18} />
              </div>
              <div className="health-label">ESP32 Hardware Mode</div>
              <span className="health-value">
                {isLiveHardware ? 'Physical WiFi Node' : 'Simulated Sandbox'}
              </span>
            </div>

            <div className="health-row">
              <div className="health-icon">
                <Activity size={18} />
              </div>
              <div className="health-label">Telemetry Heartbeat</div>
              <span className="health-value">Every 10 seconds</span>
            </div>

            <div className="health-row">
              <div className="health-icon">
                <Database size={18} />
              </div>
              <div className="health-label">Logged In User</div>
              <span className="health-value">{userEmail || 'demo@khetmitra.local'}</span>
            </div>
          </div>

          <div className="mt-3">
            <button
              type="button"
              className="btn btn-outline full-btn"
              onClick={handleTestDbConnection}
              disabled={dbTesting}
            >
              <RefreshCw size={16} className={dbTesting ? 'spin-icon' : ''} />
              {dbTesting ? 'Testing Connection…' : 'Test Supabase Connection'}
            </button>
            {dbResult && (
              <div
                className={`form-message mt-3 ${dbResult.ok ? 'success' : 'error'}`}
                role="status"
              >
                {dbResult.ok ? <Check size={16} /> : <Info size={16} />}
                <span>{dbResult.message}</span>
              </div>
            )}
          </div>
        </section>

        {/* Prototype Reset */}
        <section className="panel settings-panel">
          <div className="panel-heading">
            <div>
              <h3>Prototype Maintenance</h3>
              <p>Reset mock data and reinitialize factory states</p>
            </div>
            <RotateCcw size={20} className="text-danger" />
          </div>

          <div className="reset-section">
            <p>
              Restore initial simulated detection events and default sensor states for clean
              demonstration.
            </p>
            <button
              type="button"
              className="btn btn-outline full-btn text-danger"
              onClick={onResetSimulatedData}
            >
              <RotateCcw size={16} /> Reset All Simulated Data to Default
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
