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
import {
  fetchRemoteAlerts,
  pushAlertToRemote,
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
import DinuvoxModal from './components/DinuvoxModal';

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
  const [demo, setDemo] = useState(false);
  const [userRole, setUserRole] = useState(() => getStoredJson('khetmitra_user_role', 'customer')); // 'customer' or 'admin'
  const [activeUserEmail, setActiveUserEmail] = useState('');

  // Navigation state
  const [activeNav, setActiveNav] = useState('Overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Dinuvox Profile Modal State
  const [dinuvoxModalOpen, setDinuvoxModalOpen] = useState(false);

  // Core Farm System State
  const [operatingMode, setOperatingMode] = useState('ARMED'); // 'ARMED', 'ALERT', 'DISARMED'
  const [events, setEvents] = useState(() => getStoredJson('khetmitra_events', INITIAL_EVENTS));
  const [sensors, setSensors] = useState(INITIAL_SENSORS);
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
  const [espHeartbeatSeconds, setEspHeartbeatSeconds] = useState(3);

  // Developer Profile for Dinuvox
  const [developerProfile] = useState(() =>
    getStoredJson('khetmitra_dev_profile', {
      name: 'Dinuvox',
      bio: 'Lead Full-Stack, IoT & UI/UX Systems Architect. Architect of the KhetMitra agricultural field defense platform.',
      photo: '',
      linkedin: 'https://linkedin.com',
      instagram: 'https://instagram.com',
      github: 'https://github.com',
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
      if (data.session) {
        setDemo(false);
        const email = data.session.user?.email || '';
        setActiveUserEmail(email);
        const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
        setUserRole(role);
        setStoredJson('khetmitra_user_role', role);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthChecked(true);
      if (nextSession) {
        setDemo(false);
        const email = nextSession.user?.email || '';
        setActiveUserEmail(email);
        const role = email.toLowerCase().includes('admin') ? 'admin' : 'customer';
        setUserRole(role);
        setStoredJson('khetmitra_user_role', role);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch remote alerts if Supabase is connected
  useEffect(() => {
    if (!hasSupabaseConfig || !session) return;
    fetchRemoteAlerts().then((remoteData) => {
      if (remoteData && remoteData.length > 0) {
        setEvents(remoteData);
      }
    });

    const unsubscribe = subscribeToRealtimeAlerts(
      (newAlert) => {
        setEvents((prev) => [newAlert, ...prev]);
        showToast(`Intrusion Alert: ${newAlert.animal} at ${newAlert.side}!`);
        if (notificationSettings.soundAlerts) {
          playAcousticAlarm(2, 3200);
        }
      },
      (updatedRow) => {
        setEvents((prev) =>
          prev.map((e) => (e.id === updatedRow.id ? { ...e, status: updatedRow.status } : e))
        );
      }
    );

    return () => unsubscribe();
  }, [session, notificationSettings.soundAlerts]);

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

  function toggleMasterSound() {
    setNotificationSettings((prev) => {
      const next = { ...prev, soundAlerts: !prev.soundAlerts };
      setStoredJson('khetmitra_notify_settings', next);
      showToast(next.soundAlerts ? 'Acoustic siren alarms unmuted' : 'Acoustic siren alarms muted');
      return next;
    });
  }

  function handleDemoLogin(email, role) {
    setDemo(true);
    setActiveUserEmail(email);
    setUserRole(role);
    setStoredJson('khetmitra_user_role', role);
    setActiveNav('Overview');
    showToast(
      role === 'admin'
        ? 'Signed in to Administrator Hardware Console'
        : 'Signed in to Customer Farmer Dashboard'
    );
  }

  function handleSwitchRole(newRole) {
    setUserRole(newRole);
    setStoredJson('khetmitra_user_role', newRole);
    setActiveNav('Overview');
    showToast(`Switched view to ${newRole === 'admin' ? 'Admin Console' : 'Customer View'}`);
  }

  async function handleSignOut() {
    if (hasSupabaseConfig && session) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setDemo(false);
    setActiveUserEmail('');
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

    if (autoProtection && operatingMode !== 'DISARMED') {
      deterrentResponse = preset.deterrentPreset || `Autonomous Buzzer (${buzzerIntensity}%) + Strobe (${lightIntensity}%) for ${autoDuration}s`;

      setBuzzerOn(true);
      setLightOn(true);

      if (notificationSettings.soundAlerts) {
        playAcousticAlarm(1.6, preset.soundFrequency || 2800);
      }

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
      notes: `${preset.threatDesc} Detected on ${chosenSide} sector boundary. AI confidence score: ${preset.confidence || '92%'}.`,
    };

    setEvents((prev) => [newEvent, ...prev]);
    pushAlertToRemote(newEvent);
    showToast(`Intrusion detected: ${preset.name} on ${chosenSide} sector!`);
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
    setBuzzerOn(true);
    setLightOn(true);
    if (notificationSettings.soundAlerts) {
      playAcousticAlarm(2.8, 3400);
    }
    showToast('EMERGENCY: Panic Alarm triggered across all 4 field boundaries!');
  }

  function silenceAllDeterrents() {
    setBuzzerOn(false);
    setLightOn(false);
    showToast('All field deterrents silenced');
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
        onLoginSuccess={handleDemoLogin}
      />
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
            onOpenDinuvoxModal={() => setDinuvoxModalOpen(true)}
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
            onOpenDinuvoxModal={() => setDinuvoxModalOpen(true)}
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

      {/* Graffiti "Designed by Dinuvox" label */}
      <div
        className="dinuvox-graffiti-label"
        onClick={() => setDinuvoxModalOpen(true)}
        title="Tap to view architect credentials"
        role="button"
        tabIndex={0}
      >
        <span className="graffiti-text" aria-label="Designed by Dinuvox">
          {'Designed by '.split('').map((ch, i) => (
            <span key={i} className="graffiti-char" style={{ animationDelay: `${i * 0.07}s` }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
          <span className="graffiti-dinuvox">
            {'Dinuvox'.split('').map((ch, i) => (
              <span key={i} className="graffiti-char graffiti-bold" style={{ animationDelay: `${(i + 12) * 0.07}s` }}>
                {ch}
              </span>
            ))}
          </span>
        </span>
        <span className="graffiti-spray" />
        <span className="graffiti-spray graffiti-spray-2" />
      </div>

      {/* Dinuvox Profile Modal */}
      <DinuvoxModal
        isOpen={dinuvoxModalOpen}
        onClose={() => setDinuvoxModalOpen(false)}
        developerProfile={developerProfile}
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
