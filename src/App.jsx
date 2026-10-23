import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, Sprout } from 'lucide-react';
import { hasSupabaseConfig, supabase } from './supabase';
import {
  updateRemoteAlertStatus,
  subscribeToRealtimeAlerts,
} from './services/supabaseService';

// Component Imports
import Header from './components/Header';
import MobileDock from './components/MobileDock';
import AuthScreen from './components/AuthScreen';
import CustomerPortal from './components/CustomerPortal';
import AdminPortal from './components/AdminPortal';
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
function playAcousticAlarm(durationSec = 1.2, frequency = 2800) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(frequency + 600, ctx.currentTime + durationSec * 0.4);
    osc.frequency.linearRampToValueAtTime(frequency - 400, ctx.currentTime + durationSec * 0.7);
    osc.frequency.linearRampToValueAtTime(frequency, ctx.currentTime + durationSec);

    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSec);
  } catch {
    // Graceful fallback if audio is autoplay-restricted by browser
  }
}

export default function App() {
  // Supabase & Auth state
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(!hasSupabaseConfig);
  const demo = false; // Demo authentication is intentionally disabled.
  const [userRole] = useState('customer'); // Admin privileges must come from trusted server-side authorization.
  const [activeUserEmail, setActiveUserEmail] = useState('');

  // Navigation state
  const [activeNav, setActiveNav] = useState('Overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Dinuvox Profile Modal State

  // Core Farm System State
  const [operatingMode, setOperatingMode] = useState('DISARMED'); // Hardware is not connected yet
  const [events, setEvents] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [selectedZone, setSelectedZone] = useState('North');
  const [selectedAlertForModal, setSelectedAlertForModal] = useState(null);

  // Actuator controls
  const [buzzerOn, setBuzzerOn] = useState(false);
  const [buzzerIntensity, setBuzzerIntensity] = useState(75);
  const [lightOn, setLightOn] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(85);
  const [autoProtection, setAutoProtection] = useState(true);
  const [autoDuration, setAutoDuration] = useState(10);

  // Heartbeat counter (seconds since last heartbeat)
  const [espHeartbeatSeconds] = useState(null);

  const [farmProfile, setFarmProfile] = useState(() =>
    getStoredJson('khetmitra_farm_profile', {
      name: 'Your farm',
      area: 'Not configured',
      crops: 'Not configured',
      location: 'Not configured',
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
      if (data.session && data.session.user?.email_confirmed_at) {
        setActiveUserEmail(data.session.user.email || '');
      } else if (data.session) {
        await supabase.auth.signOut();
        setSession(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const verifiedSession = nextSession?.user?.email_confirmed_at ? nextSession : null;
      setSession(verifiedSession);
      setAuthChecked(true);
      setActiveUserEmail(verifiedSession?.user?.email || '');
    });

    return () => subscription.unsubscribe();
  }, []);

  // Clear stale sample data; do not persist events locally.
  useEffect(() => {
    try {
      localStorage.removeItem('khetmitra_events');
      localStorage.removeItem('khetmitra_sensor_readings');
      localStorage.removeItem('khetmitra_demo_events');
    } catch {
      // Storage may be unavailable in private browsing.
    }
  }, []);

  // Subscribe only to new backend events. The physical ESP32 integration is still in progress.
  // No historical rows or synthetic heartbeat are presented as live hardware data.
  useEffect(() => {
    if (!hasSupabaseConfig || !session) return;
    const unsubscribe = subscribeToRealtimeAlerts(
      (newAlert) => {
        setEvents((prev) => [newAlert, ...prev]);
        showToast(`New device event received: ${newAlert.side || 'Unknown sector'}`);
      },
      (updatedRow) => {
        setEvents((prev) =>
          prev.map((e) => (e.id === updatedRow.id ? { ...e, status: updatedRow.status } : e))
        );
      }
    );
    return () => unsubscribe();
  }, [session, notificationSettings.soundAlerts]);

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

  function toggleMasterSound() {
    setNotificationSettings((prev) => {
      const next = { ...prev, soundAlerts: !prev.soundAlerts };
      setStoredJson('khetmitra_notify_settings', next);
      showToast(next.soundAlerts ? 'Acoustic siren alarms unmuted' : 'Acoustic siren alarms muted');
      return next;
    });
  }

  function handleSwitchRole() {
    showToast('Roles cannot be changed from the browser. Administrator access requires trusted server-side authorization.');
  }

  async function handleSignOut() {
    if (hasSupabaseConfig && session) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setActiveUserEmail('');
    setActiveNav('Overview');
  }

  function simulateDetection() {
    showToast('Demo detections are disabled. Connect the physical ESP32 module to receive events.');
  }

  function reviewEvent(id) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'Reviewed' } : e))
    );
    updateRemoteAlertStatus(id, 'Reviewed');
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
    showToast('Hardware setup in progress. Alarm control will be available after ESP32 connection.');
  }

  function silenceAllDeterrents() {
    showToast('Hardware setup in progress. Device controls are not connected yet.');
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
    setEvents([]);
    setSensors([]);
    try {
      localStorage.removeItem('khetmitra_events');
      localStorage.removeItem('khetmitra_sensor_readings');
      localStorage.removeItem('khetmitra_demo_events');
    } catch {
      // Storage may be unavailable.
    }
    showToast('Local sample data cleared. Waiting for physical device data.');
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
      <AuthScreen />
    );
  }

  const effectiveEmail =
    activeUserEmail || session?.user?.email || (userRole === 'admin' ? 'admin@khetmitra.com' : 'farmer@khetmitra.com');

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Primary Top Header with role badge, navigation, and mute button */}
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
        userEmail={effectiveEmail}
        userRole={userRole}
        onSwitchRole={handleSwitchRole}
        isDemo={demo}
        isLiveHardware={isLiveHardware}
        soundEnabled={Boolean(notificationSettings.soundAlerts)}
        onToggleSound={toggleMasterSound}
        onSignOut={handleSignOut}
      />

      {mobileNav && (
        <button
          className="mobile-scrim"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation menu"
        />
      )}

      {/* Main Content Area: Renders the appropriate role portal */}
      <main id="main-content" className="main-content">
        {userRole === 'customer' ? (
          /* Customer / Farmer Portal */
          <CustomerPortal
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            operatingMode={operatingMode}
            setOperatingMode={setOperatingMode}
            isLiveHardware={isLiveHardware}
            espHeartbeatSeconds={espHeartbeatSeconds}
            events={events}
            sensors={sensors}
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
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            farmProfile={farmProfile}
            onSaveFarmProfile={saveFarmProfile}
            notificationSettings={notificationSettings}
            onSaveNotificationSettings={saveNotificationSettings}
            onSimulateDetection={simulateDetection}
            onTriggerAlarm={triggerPanicAlarm}
            onSilenceAll={silenceAllDeterrents}
            onReviewEvent={reviewEvent}
            onReviewAll={reviewAllEvents}
            onClearReviewed={clearReviewedEvents}
            onSelectAlert={(alert) => setSelectedAlertForModal(alert)}
            onResetSimulatedData={resetSimulatedData}
            userEmail={effectiveEmail}
          />
        ) : (
          /* Administrator Portal */
          <AdminPortal
            operatingMode={operatingMode}
            setOperatingMode={setOperatingMode}
            isLiveHardware={isLiveHardware}
            espHeartbeatSeconds={espHeartbeatSeconds}
            sensors={sensors}
            events={events}
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
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            farmProfile={farmProfile}
            onSaveFarmProfile={saveFarmProfile}
            notificationSettings={notificationSettings}
            onSaveNotificationSettings={saveNotificationSettings}
            onSimulateDetection={simulateDetection}
            onTriggerAlarm={triggerPanicAlarm}
            onSilenceAll={silenceAllDeterrents}
            onReviewEvent={reviewEvent}
            onReviewAll={reviewAllEvents}
            onClearReviewed={clearReviewedEvents}
            onSelectAlert={(alert) => setSelectedAlertForModal(alert)}
            onResetSimulatedData={resetSimulatedData}
            userEmail={effectiveEmail}
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

      {/* Small, non-interactive CSS-only developer credit */}
      <footer className="dinuvox-graffiti-label" aria-label="Designed by DinuVoX">
        <span className="graffiti-text">Designed by <strong className="graffiti-bold">DinuVoX</strong></span>
      </footer>

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
