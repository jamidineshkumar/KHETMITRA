import React, { useState } from 'react';
import {
  UserRound,
  ExternalLink,
  Instagram,
  Github,
  Linkedin,
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
  Info,
} from 'lucide-react';
import { hasSupabaseConfig } from '../supabase';

export default function SettingsTab({
  developerProfile,
  onSaveDeveloperProfile,
  farmProfile,
  onSaveFarmProfile,
  notificationSettings,
  onSaveNotificationSettings,
  onResetSimulatedData,
  isLiveHardware,
  userEmail,
}) {
  // Local state for developer profile
  const [devName, setDevName] = useState(developerProfile.name || 'App Developer');
  const [devBio, setDevBio] = useState(developerProfile.bio || 'KhetMitra lead engineer & IoT developer');
  const [devPhoto, setDevPhoto] = useState(developerProfile.photo || '');
  const [devLinkedIn, setDevLinkedIn] = useState(developerProfile.linkedin || '');
  const [devInstagram, setDevInstagram] = useState(developerProfile.instagram || '');
  const [devGithub, setDevGithub] = useState(developerProfile.github || '');

  // Local state for farm profile
  const [farmName, setFarmName] = useState(farmProfile.name || 'Green Valley Agricultural Plots');
  const [farmArea, setFarmArea] = useState(farmProfile.area || '5.5 Acres');
  const [farmCrops, setFarmCrops] = useState(farmProfile.crops || 'Wheat, Mustard, Seasonal Vegetables');
  const [farmLocation, setFarmLocation] = useState(farmProfile.location || 'Northern Boundary Canal Sector');

  // Notification settings
  const [soundAlerts, setSoundAlerts] = useState(notificationSettings.soundAlerts !== false);
  const [desktopNotify, setDesktopNotify] = useState(Boolean(notificationSettings.desktopNotify));

  const [toastMessage, setToastMessage] = useState('');

  function handleSaveDev() {
    onSaveDeveloperProfile({
      name: devName,
      bio: devBio,
      photo: devPhoto,
      linkedin: devLinkedIn,
      instagram: devInstagram,
      github: devGithub,
    });
    setToastMessage('Developer profile saved and persisted successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  }

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

  return (
    <div className="settings-container page-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Customization & Profiles</span>
          <h1>System Settings & Developer Profile</h1>
          <p>
            Configure agricultural field parameters, developer credentials, IoT connectivity, and
            notification preferences.
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

        {/* Developer Profile (Persisted properly!) */}
        <section className="panel settings-panel developer-panel">
          <div className="panel-heading">
            <div>
              <h3>Application Developer</h3>
              <p>Project architect & student profile credentials</p>
            </div>
            <UserRound size={20} className="text-leaf" />
          </div>

          <div className="developer-preview">
            {devPhoto ? (
              <img
                src={devPhoto}
                alt="Developer Profile Avatar"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="developer-placeholder">
                <UserRound size={32} />
              </div>
            )}
            <div>
              <strong>{devName || 'App Developer'}</strong>
              <p>{devBio || 'Lead Full-Stack & IoT Developer'}</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveDev();
            }}
          >
            <label className="settings-field">
              Display Name
              <input
                value={devName}
                onChange={(e) => setDevName(e.target.value)}
                placeholder="Your Full Name"
                required
              />
            </label>

            <label className="settings-field">
              Profile Photo URL
              <input
                type="url"
                value={devPhoto}
                onChange={(e) => setDevPhoto(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </label>

            <label className="settings-field">
              Role & Short Bio
              <input
                value={devBio}
                onChange={(e) => setDevBio(e.target.value)}
                placeholder="e.g. Electronics & Computer Engineering Student"
              />
            </label>

            <label className="settings-field">
              LinkedIn Profile URL
              <input
                type="url"
                value={devLinkedIn}
                onChange={(e) => setDevLinkedIn(e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </label>

            <label className="settings-field">
              Instagram Profile URL
              <input
                type="url"
                value={devInstagram}
                onChange={(e) => setDevInstagram(e.target.value)}
                placeholder="https://instagram.com/yourhandle"
              />
            </label>

            <label className="settings-field">
              GitHub Profile URL
              <input
                type="url"
                value={devGithub}
                onChange={(e) => setDevGithub(e.target.value)}
                placeholder="https://github.com/yourusername"
              />
            </label>

            <button type="submit" className="btn btn-primary full-btn mt-3">
              <Save size={16} /> Save Developer Profile
            </button>
          </form>

          <div className="developer-links">
            {devLinkedIn && (
              <a href={devLinkedIn} target="_blank" rel="noreferrer">
                <Linkedin size={15} /> LinkedIn
              </a>
            )}
            {devInstagram && (
              <a href={devInstagram} target="_blank" rel="noreferrer">
                <Instagram size={15} /> Instagram
              </a>
            )}
            {devGithub && (
              <a href={devGithub} target="_blank" rel="noreferrer">
                <Github size={15} /> GitHub
              </a>
            )}
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
                {hasSupabaseConfig ? 'Supabase Connected' : 'Supabase In Standby Mode'}
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
        </section>

        {/* Audio & Alert Preferences */}
        <section className="panel settings-panel">
          <div className="panel-heading">
            <div>
              <h3>Alert & Notification Preferences</h3>
              <p>Customize user interface auditory alerts and simulation resets</p>
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

          <button
            type="button"
            className="btn btn-outline full-btn mt-3"
            onClick={handleSaveNotify}
          >
            <Save size={16} /> Save Notification Settings
          </button>

          <hr className="divider-hr" />

          <div className="reset-section">
            <h4>Prototype Data Reset</h4>
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
