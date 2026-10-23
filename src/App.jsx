import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, ShieldCheck, Sprout } from 'lucide-react';
import { hasSupabaseConfig, supabase } from './supabase';
import {
  INITIAL_ZONES,
  INITIAL_EVENTS,
  INITIAL_SENSORS,
  INITIAL_ACTUATORS,
  WILDLIFE_PRESETS,
} from './constants/farmData';

// Component Imports
import Header from './components/Header';
import MobileDock from './components/MobileDock';
import AuthScreen from './components/AuthScreen';
import OverviewTab from './components/OverviewTab';
import LiveMonitoringTab from './components/LiveMonitoringTab';
import AlertsTab from './components/AlertsTab';
import DeviceSensorsTab from './components/DeviceSensorsTab';
import ControlsTab from './components/ControlsTab';
import HistoryReportsTab from './components/HistoryReportsTab';
import SettingsTab from './components/SettingsTab';
import AlertDetailModal from './components/AlertDetailModal';

// Local storage helper
function getStoredJson(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStoredJson(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// Web Audio API acoustic synthesizer for realistic buzzer sounds
function playAcousticAlarm(durationSec = 1, frequency = 2800) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    // Rapid alternating warble like an agricultural repeller
    osc.frequency.linearRampToValueAtTime(frequency + 600, ctx.currentTime + durationSec * 0.5);
    osc.frequency.linearRampToValueAtTime(frequency, ctx.currentTime + durationSec);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSec);
  } catch {
    // Ignore audio autoplay restrictions gracefully
  }
}

export default function App() {
  // Supabase & Auth state
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(!hasSupabaseConfig);
  const [demo, setDemo] = useState(false);

  // Navigation state (7 tabs)
  const [activeNav, setActiveNav] = useState('Overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Core Farm System State
  const [operatingMode, setOperatingMode] = useState('ARMED'); // 'ARMED', 'ALERT', 'DISARMED'
  const [events, setEvents] = useState(() => getStoredJson('khetmitra_events', INITIAL_EVENTS));
  const [sensors, setSensors] = useState(INITIAL_SENSORS);
  const [selectedZone, setSelectedZone] = useState('North');
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);

  // Actuator controls
  const [buzzerOn, setBuzzerOn] = useState(false);
  const [buzzerIntensity, setBuzzerIntensity] = useState(70);
  const [lightOn, setLightOn] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(80);
  const [autoProtection, setAutoProtection] = useState(true);
  const [autoDuration, setAutoDuration] = useState(10);

  // Heartbeat counter (seconds since last heartbeat)
  const [espHeartbeatSeconds, setEspHeartbeatSeconds] = useState(4);

  // Developer & Farm profiles (persisted in localStorage)
  const [developerProfile, setDeveloperProfile] = useState(() =>
    getStoredJson('khetmitra_dev_profile', {
      name: 'App Developer',
      bio: 'Lead Full-Stack, IoT & UI/UX Developer',
      photo: '',
      linkedin: '',
      instagram: '',
      github: '',
    })
  );

  const [farmProfile, setFarmProfile] = useState(() =>
    getStoredJson('khetmitra_farm_profile', {
      name: 'Green Valley Agricultural Plots',
      area: '5.5 Acres (2.2 Hectares)',
      crops: 'Wheat, Mustard, Seasonal Vegetables',
      location: 'Northern Canal Boundary',
    })
  );

  const [notificationSettings, setNotificationSettings] = useState(() =>
    getStoredJson('khetmitra_notify_settings', {
      soundAlerts: true,
      desktopNotify: false,
    })
  );

  // Supabase Auth listener
  useEffect(() => {
    if (!hasSupabaseConfig) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
      if (data.session) setDemo(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthChecked(true);
      if (nextSession) setDemo(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Heartbeat ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setEspHeartbeatSeconds((prev) => (prev >= 10 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync events to local storage
  useEffect(() => {
    setStoredJson('khetmitra_events', events);
  }, [events]);

  // Toast auto-clear
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Derived metrics
  const unresolvedCount = useMemo(
    () => events.filter((e) => e.status === 'New').length,
    [events]
  );

  const isLiveHardware = false; // Strictly DEMO MODE unless physical hardware authenticated

  // Actions
  function showToast(msg) {
    setToast(msg);
  }

  async function handleSignOut() {
    if (hasSupabaseConfig && session) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setDemo(false);
    setActiveNav('Overview');
  }

  function simulateDetection(targetZone) {
    const sides = ['North', 'East', 'South', 'West'];
    const chosenSide = targetZone || sides[Math.floor(Math.random() * sides.length)];
    const preset =
      WILDLIFE_PRESETS[Math.floor(Math.random() * WILDLIFE_PRESETS.length)];

    const sensorMap = {
      North: 'PIR-N01',
      East: 'PIR-E02',
      South: 'PIR-S03',
      West: 'PIR-W04',
    };

    let deterrentResponse = 'Monitored (Threshold normal)';
    let soundBuzzer = false;
    let flashLight = false;

    if (autoProtection && operatingMode !== 'DISARMED') {
      soundBuzzer = true;
      flashLight = true;
      deterrentResponse = `Autonomous Buzzer (${buzzerIntensity}%) + Strobe (${lightIntensity}%) for ${autoDuration}s`;

      setBuzzerOn(true);
      setLightOn(true);

      if (notificationSettings.soundAlerts) {
        playAcousticAlarm(1.5, preset.severity === 'high' ? 3200 : 2400);
      }

      // Auto turn off after duration
      setTimeout(() => {
        setBuzzerOn(false);
        setLightOn(false);
      }, autoDuration * 1000);
    }

    const newEvent = {
      id: Date.now(),
      animal: preset.name,
      threatLevel: preset.severity === 'high' ? 'High' : 'Medium',
      side: chosenSide,
      sensorId: sensorMap[chosenSide],
      time: new Date(),
      severity: preset.severity,
      status: 'New',
      deterrentAction: deterrentResponse,
      deterrentSuccess: true,
      notes: `Simulated intrusion detected on ${chosenSide} perimeter. Countermeasures deployed automatically.`,
    };

    setEvents((prev) => [newEvent, ...prev]);
    showToast(`Intrusion detected: ${preset.name} on ${chosenSide} sector!`);
  }

  function reviewEvent(id) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'Reviewed' } : e))
    );
    showToast('Alert marked as reviewed');
  }

  function reviewAllEvents() {
    setEvents((prev) => prev.map((e) => ({ ...e, status: 'Reviewed' })));
    showToast('All alerts marked as reviewed');
  }

  function clearReviewedEvents() {
    setEvents((prev) => prev.filter((e) => e.status === 'New'));
    showToast('Reviewed alerts cleared from feed');
  }

  function triggerPanicAlarm() {
    setBuzzerOn(true);
    setLightOn(true);
    if (notificationSettings.soundAlerts) {
      playAcousticAlarm(2.5, 3400);
    }
    showToast('EMERGENCY: Panic Alarm triggered across all 4 field boundaries!');
  }

  function silenceAllDeterrents() {
    setBuzzerOn(false);
    setLightOn(false);
    showToast('All field deterrents silenced');
  }

  function triggerZoneTest(zoneName, type) {
    if (type === 'buzzer') {
      setBuzzerOn(true);
      if (notificationSettings.soundAlerts) playAcousticAlarm(1.2, 2600);
      setTimeout(() => setBuzzerOn(false), 2000);
      showToast(`2-Second Siren test pulse delivered to ${zoneName} sector`);
    } else {
      setLightOn(true);
      setTimeout(() => setLightOn(false), 2000);
      showToast(`Strobe flash test pulse delivered to ${zoneName} sector`);
    }
  }

  function saveDeveloperProfile(newProfile) {
    setDeveloperProfile(newProfile);
    setStoredJson('khetmitra_dev_profile', newProfile);
  }

  function saveFarmProfile(newProfile) {
    setFarmProfile(newProfile);
    setStoredJson('khetmitra_farm_profile', newProfile);
  }

  function saveNotificationSettings(newSettings) {
    setNotificationSettings(newSettings);
    setStoredJson('khetmitra_notify_settings', newSettings);
  }

  function resetSimulatedData() {
    setEvents(INITIAL_EVENTS);
    setSensors(INITIAL_SENSORS);
    setStoredJson('khetmitra_events', INITIAL_EVENTS);
    showToast('Prototype data reset to initial factory presets');
  }

  // Loading Screen
  if (!authChecked) {
    return (
      <div className="loading-screen" role="status">
        <div className="brand-mark">
          <Sprout size={24} />
        </div>
        <p>Loading KhetMitra field monitoring system…</p>
      </div>
    );
  }

  // Auth Screen (if not signed in and not in demo mode)
  if (!session && !demo) {
    return (
      <AuthScreen
        onDemoLogin={() => {
          setDemo(true);
          showToast('Demo mode active — all field sensors and detections are simulated');
        }}
      />
    );
  }

  const userEmail = session?.user?.email || 'demo@khetmitra.local';

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Primary Top Header with all 7 navigation items */}
      <Header
        activeNav={activeNav}
        onNavigate={(nav) => {
          setActiveNav(nav);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        mobileNav={mobileNav}
        setMobileNav={setMobileNav}
        unresolvedCount={unresolvedCount}
        notificationsOpen={notificationsOpen}
        setNotificationsOpen={setNotificationsOpen}
        userEmail={userEmail}
        isDemo={demo}
        isLiveHardware={isLiveHardware}
        onSignOut={handleSignOut}
      />

      {mobileNav && (
        <button
          className="mobile-scrim"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation menu"
        />
      )}

      {/* Main Content Area: Renders the active tab */}
      <main id="main-content" className="main-content">
        {activeNav === 'Overview' && (
          <OverviewTab
            operatingMode={operatingMode}
            setOperatingMode={setOperatingMode}
            isLiveHardware={isLiveHardware}
            espHeartbeatSeconds={espHeartbeatSeconds}
            sensors={sensors}
            events={events}
            buzzerOn={buzzerOn}
            setBuzzerOn={setBuzzerOn}
            buzzerIntensity={buzzerIntensity}
            lightOn={lightOn}
            setLightOn={setLightOn}
            lightIntensity={lightIntensity}
            autoProtection={autoProtection}
            setAutoProtection={setAutoProtection}
            onSimulateDetection={() => simulateDetection()}
            onTriggerAlarm={triggerPanicAlarm}
            onSilenceAll={silenceAllDeterrents}
            onReviewEvent={reviewEvent}
            onNavigate={(nav) => {
              setActiveNav(nav);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectZone={(zone) => setSelectedZone(zone)}
          />
        )}

        {activeNav === 'Live Monitoring' && (
          <LiveMonitoringTab
            events={events}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            onSimulateDetection={(zone) => simulateDetection(zone)}
            onTriggerZoneTest={triggerZoneTest}
            buzzerOn={buzzerOn}
            lightOn={lightOn}
          />
        )}

        {activeNav === 'Alerts' && (
          <AlertsTab
            events={events}
            onReviewEvent={reviewEvent}
            onReviewAll={reviewAllEvents}
            onClearReviewed={clearReviewedEvents}
            onSimulateDetection={() => simulateDetection()}
            onSelectAlert={(alert) => setSelectedAlertForModal(alert)}
          />
        )}

        {activeNav === 'Device & Sensors' && (
          <DeviceSensorsTab
            isLiveHardware={isLiveHardware}
            espHeartbeatSeconds={espHeartbeatSeconds}
            onPingController={() => {
              setEspHeartbeatSeconds(0);
              showToast('ESP32 ping confirmed (simulated loopback)');
            }}
          />
        )}

        {activeNav === 'Controls' && (
          <ControlsTab
            operatingMode={operatingMode}
            setOperatingMode={setOperatingMode}
            buzzerOn={buzzerOn}
            setBuzzerOn={setBuzzerOn}
            buzzerIntensity={buzzerIntensity}
            setBuzzerIntensity={setBuzzerIntensity}
            lightOn={lightOn}
            setLightOn={setLightOn}
            lightIntensity={lightIntensity}
            setLightIntensity={setLightIntensity}
            autoProtection={autoProtection}
            setAutoProtection={setAutoProtection}
            autoDuration={autoDuration}
            setAutoDuration={setAutoDuration}
            onTriggerAlarm={triggerPanicAlarm}
            onSilenceAll={silenceAllDeterrents}
            onTestPulse={(type) => triggerZoneTest(selectedZone, type)}
            isLiveHardware={isLiveHardware}
          />
        )}

        {activeNav === 'History & Reports' && (
          <HistoryReportsTab events={events} />
        )}

        {activeNav === 'Settings' && (
          <SettingsTab
            developerProfile={developerProfile}
            onSaveDeveloperProfile={saveDeveloperProfile}
            farmProfile={farmProfile}
            onSaveFarmProfile={saveFarmProfile}
            notificationSettings={notificationSettings}
            onSaveNotificationSettings={saveNotificationSettings}
            onResetSimulatedData={resetSimulatedData}
            isLiveHardware={isLiveHardware}
            userEmail={userEmail}
          />
        )}
      </main>

      {/* Accessible Compact Mobile Dock */}
      <MobileDock
        activeNav={activeNav}
        onNavigate={(nav) => {
          setActiveNav(nav);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unresolvedCount={unresolvedCount}
      />

      {/* Incident Detail Modal */}
      {selectedAlertForModal && (
        <AlertDetailModal
          alert={selectedAlertForModal}
          onClose={() => setSelectedAlertForModal(null)}
          onReview={reviewEvent}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <Check size={17} />
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast('')}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
