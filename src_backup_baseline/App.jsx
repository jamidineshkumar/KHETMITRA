import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  Check,
  Clock3,
  Cloud,
  Compass,
  Leaf,
  LogOut,
  Menu,
  Plus,
  Radio,
  ShieldCheck,
  Sprout,
  ThermometerSun,
  Wifi,
  X,
  Zap,
  Settings,
  Lightbulb,
  Volume2,
  SlidersHorizontal,
  Radar,
  UserRound,
  Instagram,
  ExternalLink,
} from 'lucide-react';
import { hasSupabaseConfig, supabase } from './supabase';

const initialEvents = [
  { id: 1, animal: 'Wild boar', side: 'East', time: new Date(Date.now() - 1000 * 60 * 4), severity: 'high', status: 'New' },
  { id: 2, animal: 'Possible movement', side: 'North', time: new Date(Date.now() - 1000 * 60 * 38), severity: 'medium', status: 'Reviewed' },
  { id: 3, animal: 'Stray cattle', side: 'South', time: new Date(Date.now() - 1000 * 60 * 60 * 3), severity: 'medium', status: 'Reviewed' },
  { id: 4, animal: 'Possible movement', side: 'West', time: new Date(Date.now() - 1000 * 60 * 60 * 7), severity: 'low', status: 'Reviewed' },
];

const zones = [
  { name: 'North', note: 'Main entrance' },
  { name: 'East', note: 'Near the water line' },
  { name: 'South', note: 'Crop boundary' },
  { name: 'West', note: 'Storage-side boundary' },
];

function timeAgo(date) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  return `${Math.floor(hours / 24)} day(s) ago`;
}

function FarmScene({ compact = false }) {
  return (
    <div className={`farm-scene ${compact ? 'farm-scene-compact' : ''}`} aria-hidden="true">
      <div className="farm-sky">
        <div className="farm-sun" />
        <div className="farm-cloud farm-cloud-1" />
        <div className="farm-cloud farm-cloud-2" />
        <div className="farm-cloud farm-cloud-3" />
        <span className="farm-bird farm-bird-1" />
        <span className="farm-bird farm-bird-2" />
      </div>
      <div className="farm-hill farm-hill-far" />
      <div className="farm-hill farm-hill-near" />
      <div className="farm-barn">
        <span className="barn-roof" />
        <span className="barn-wall" />
        <span className="barn-door" />
      </div>
      <div className="farm-tree">
        <span className="farm-canopy farm-canopy-back" />
        <span className="farm-canopy" />
        <span className="farm-trunk" />
      </div>
      <div className="farm-crops">
        {Array.from({ length: 14 }, (_, i) => (
          <span key={i} className="farm-stalk" style={{ '--delay': `${i * 0.12}s` }} />
        ))}
      </div>
      <div className="farm-farmer">
        <span className="farmer-hat" />
        <span className="farmer-head" />
        <span className="farmer-torso" />
        <span className="farmer-arm farmer-arm-l" />
        <span className="farmer-arm farmer-arm-r" />
        <span className="farmer-leg farmer-leg-l" />
        <span className="farmer-leg farmer-leg-r" />
      </div>
      <div className="farm-ground" />
    </div>
  );
}

function Brand({ light = false }) {
  return (
    <div className={`brand ${light ? 'brand-light' : ''}`}>
      <div className="brand-mark" aria-hidden="true">
        <Sprout size={22} />
      </div>
      <div className="brand-copy">
        <span className="brand-name">KhetMitra</span>
        <span className="brand-tag">Smart Crop Protection</span>
      </div>
    </div>
  );
}

function AuthScreen({ onDemoLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (!hasSupabaseConfig) {
        setError('Real login is not configured yet. Use “Preview demo” to explore the interface, or connect Supabase using the setup guide.');
        return;
      }
      const result = mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
      if (result.error) throw result.error;
      if (mode === 'signup' && !result.data.session) {
        setMessage('Account created. Check your email to confirm the account, then sign in.');
      } else {
        setMessage('Signed in successfully.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <Brand light />
        <div className="visual-copy">
          <span className="eyebrow">A friend for every field</span>
          <h1>Your Farm, Protected</h1>
          <p>Watch every boundary, review alerts, and keep growing with a calm, clear view of your land.</p>
        </div>
        <FarmScene />
      </section>
      <section className="auth-panel">
        <div className="mobile-brand">
          <Brand />
        </div>
        <div className="auth-form-wrap">
          <span className="eyebrow">Welcome to KhetMitra</span>
          <h2>{mode === 'login' ? 'Good to see you again.' : 'Create your farmer account.'}</h2>
          <p className="muted">
            {mode === 'login' ? 'Sign in to check on your field.' : 'Set up a monitoring account for your farm.'}
          </p>
          <form onSubmit={submit} className="auth-form">
            <label htmlFor="auth-email">
              Email address
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </label>
            <label htmlFor="auth-password">
              Password
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </label>
            {error && (
              <div className="form-message error" role="alert">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}
            {message && (
              <div className="form-message success" role="status">
                <Check size={16} />
                <span>{message}</span>
              </div>
            )}
            <button className="btn btn-primary full-btn" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <div className="auth-switch">
            {mode === 'login' ? 'New to KhetMitra?' : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setMessage('');
              }}
            >
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </button>
          </div>
          <div className="divider-label" role="separator">
            <span /> OR <span />
          </div>
          <button type="button" className="btn btn-outline full-btn" onClick={onDemoLogin}>
            <Activity size={17} /> Preview demo dashboard
          </button>
          <p className="auth-foot">
            <ShieldCheck size={15} /> Demo alerts are simulated. Hardware sensors are not connected yet.
          </p>
        </div>
        <div className="auth-bottom">
          <span>© 2026 KhetMitra</span>
          <span>Built for better growing.</span>
        </div>
      </section>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [authChecked, setAuthChecked] = useState(!hasSupabaseConfig);
  const [demo, setDemo] = useState(false);
  const [events, setEvents] = useState(initialEvents);
  const [activeNav, setActiveNav] = useState('Overview');
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [now, setNow] = useState(new Date());
  const [buzzerOn, setBuzzerOn] = useState(false);
  const [buzzerIntensity, setBuzzerIntensity] = useState(60);
  const [lightOn, setLightOn] = useState(false);
  const [lightIntensity, setLightIntensity] = useState(75);
  const [autoProtection, setAutoProtection] = useState(false);
  const [developerName, setDeveloperName] = useState('App Developer');
  const [developerPhoto, setDeveloperPhoto] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [developerBio, setDeveloperBio] = useState('');

  useEffect(() => {
    if (!hasSupabaseConfig) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthChecked(true);
      setDemo(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthChecked(true);
      setDemo(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const unresolved = events.filter((e) => e.status === 'New').length;
  const todayCount = events.filter((e) => new Date(e.time).toDateString() === new Date().toDateString()).length;
  const latestEvent = events[0];
  const latestBySide = useMemo(
    () => Object.fromEntries(['North', 'East', 'South', 'West'].map((side) => [side, events.find((e) => e.side === side)])),
    [events],
  );

  async function signOut() {
    if (hasSupabaseConfig && session) await supabase.auth.signOut();
    setSession(null);
    setDemo(false);
    setEvents(initialEvents);
    setActiveNav('Overview');
    setSelectedZone(null);
  }

  function simulateDetection() {
    const sides = ['North', 'East', 'South', 'West'];
    const animals = ['Possible movement', 'Wild boar', 'Stray cattle', 'Deer'];
    const side = sides[Math.floor(Math.random() * sides.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    setEvents((old) => [{
      id: Date.now(),
      animal,
      side,
      time: new Date(),
      severity: animal === 'Wild boar' ? 'high' : 'medium',
      status: 'New',
    }, ...old]);
    setToast(`Simulated detection added — ${side} zone`);
    setActiveNav('Overview');
  }

  function reviewEvent(id) {
    setEvents((old) => old.map((e) => (e.id === id ? { ...e, status: 'Reviewed' } : e)));
    setToast('Alert marked as reviewed');
  }

  function goTo(nav, extra = {}) {
    setActiveNav(nav);
    setMobileNav(false);
    setNotificationsOpen(false);
    if (nav === 'Alert history') setShowAll(true);
    if (extra.zone) setSelectedZone(extra.zone);
  }

  if (!authChecked) {
    return (
      <div className="loading-screen" role="status">
        <div className="brand-mark"><Sprout size={23} /></div>
        <p>Checking your session…</p>
      </div>
    );
  }

  if (!session && !demo) {
    return (
      <AuthScreen
        onDemoLogin={() => {
          setDemo(true);
          setToast('Demo mode enabled — all events are simulated');
        }}
      />
    );
  }

  const userEmail = session?.user?.email || 'demo@khetmitra.local';
  const visibleEvents = showAll ? events : events.slice(0, 4);
  const fieldNeedsAttention = latestEvent?.status === 'New';
  const greeting = now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening';

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <button
          className="icon-button menu-button"
          onClick={() => setMobileNav(!mobileNav)}
          aria-expanded={mobileNav}
          aria-controls="app-nav"
          aria-label={mobileNav ? 'Close menu' : 'Open menu'}
        >
          {mobileNav ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Brand />
        <nav id="app-nav" className={`primary-nav ${mobileNav ? 'primary-nav-open' : ''}`} aria-label="Main">
          <button className={`nav-item ${activeNav === 'Overview' ? 'active' : ''}`} onClick={() => goTo('Overview')} aria-current={activeNav === 'Overview' ? 'page' : undefined}>
            <Activity size={18} /> Overview
          </button>
          <button className={`nav-item ${activeNav === 'Field zones' ? 'active' : ''}`} onClick={() => goTo('Field zones')} aria-current={activeNav === 'Field zones' ? 'page' : undefined}>
            <Compass size={18} /> Field zones
          </button>
          <button className={`nav-item ${activeNav === 'Alert history' ? 'active' : ''}`} onClick={() => goTo('Alert history')} aria-current={activeNav === 'Alert history' ? 'page' : undefined}>
            <Bell size={18} /> Alert history
            {unresolved > 0 && <span className="nav-count">{unresolved}</span>}
          </button>
          <button className={`nav-item ${activeNav === 'Device controls' ? 'active' : ''}`} onClick={() => goTo('Device controls')} aria-current={activeNav === 'Device controls' ? 'page' : undefined}>
            <SlidersHorizontal size={18} /> Device controls
          </button>
          <button className={`nav-item ${activeNav === 'Settings' ? 'active' : ''}`} onClick={() => goTo('Settings')} aria-current={activeNav === 'Settings' ? 'page' : undefined}>
            <Settings size={18} /> Settings
          </button>
          <div className="mobile-nav-extra">
            <div className="profile-row">
              <div className="avatar">{userEmail.slice(0, 1).toUpperCase()}</div>
              <div className="profile-info">
                <strong>{demo ? 'Demo Farmer' : userEmail.split('@')[0]}</strong>
                <span>{demo ? 'Preview mode' : userEmail}</span>
              </div>
            </div>
            <button type="button" className="btn btn-outline full-btn" onClick={signOut}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </nav>
        <div className="header-actions">
          <div className="status-chip" title="Hardware sensors are not connected. This dashboard is using simulated data.">
            <span className="pulse-dot" />
            <Wifi size={14} />
            <span>Simulation</span>
          </div>
          <div className="notification-wrap">
            <button
              className="icon-button notification-button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              aria-expanded={notificationsOpen}
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unresolved > 0 && <i />}
            </button>
            {notificationsOpen && (
              <div className="notification-popover" role="dialog" aria-label="Notifications">
                <strong>Notifications</strong>
                <p>{unresolved ? `${unresolved} simulated alert${unresolved > 1 ? 's' : ''} need review.` : 'You are all caught up.'}</p>
                <button type="button" onClick={() => goTo('Alert history')}>View alert history →</button>
              </div>
            )}
          </div>
          <button type="button" className="user-chip" onClick={signOut} title="Sign out">
            <span className="avatar small-avatar">{userEmail.slice(0, 1).toUpperCase()}</span>
            <LogOut size={15} />
          </button>
        </div>
      </header>
      {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Close menu" />}

      <main id="main-content" className="main-content">
        {activeNav === 'Overview' && (
          <section className="hero-section">
            <div className="hero-copy">
              <span className="eyebrow">Good {greeting}</span>
              <h1>Your Farm, Protected</h1>
              <p>KhetMitra keeps a friendly watch on all four sides of your field so you can grow with more peace of mind.</p>
              <div className="hero-actions">
                <button type="button" className="btn btn-primary" onClick={simulateDetection}>
                  <Plus size={17} /> Simulate a detection
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => goTo('Field zones')}>
                  View field zones
                </button>
              </div>
              <p className="hero-note">Buttons add sample alerts only. This is not live ESP32 data.</p>
            </div>
            <FarmScene />
          </section>
        )}

        {activeNav === 'Overview' && (
          <section className="page-section">
            {demo && (
              <div className="demo-banner" role="status">
                <div className="demo-banner-icon"><Activity size={19} /></div>
                <div>
                  <strong>You are exploring simulated sample data</strong>
                  <p>No ESP32 device is connected. Alerts, times, and zone activity are for demonstration only.</p>
                </div>
                <button type="button" onClick={() => setToast('When hardware is ready, real sensor events can appear here.')}>What’s next?</button>
              </div>
            )}

            <div className="stats-grid">
              <StatCard
                icon={<ShieldCheck size={20} />}
                tone="green"
                label="Protection status"
                value={fieldNeedsAttention ? 'Needs review' : 'Farm is calm'}
                caption={fieldNeedsAttention ? `${latestEvent.side} zone has a new simulated alert` : 'No new alerts right now'}
              />
              <StatCard
                icon={<Wifi size={20} />}
                tone="blue"
                label="Sensor connectivity"
                value="Not connected"
                caption="ESP32 hardware is not linked yet"
              />
              <StatCard
                icon={<AlertTriangle size={20} />}
                tone="amber"
                label="Recent activity"
                value={`${todayCount} today`}
                caption={`${unresolved} simulated alert${unresolved === 1 ? '' : 's'} waiting`}
              />
            </div>

            <DirectionGrid
              events={events}
              latestBySide={latestBySide}
              selectedZone={selectedZone}
              onSelect={(zone) => {
                setSelectedZone(zone);
                setToast(`${zone} zone selected (simulation)`);
              }}
            />

            <AlertsPanel
              title="Detection alerts"
              subtitle="Direction, time, and review status for the latest simulated events"
              events={visibleEvents}
              onReview={reviewEvent}
              onViewAll={() => goTo('Alert history')}
              showViewAll={events.length > 4 && !showAll}
              onLoadMore={() => setShowAll(true)}
            />

            <SystemHealth />
            <p className="footer-note">
              <ShieldCheck size={15} /> KhetMitra is in prototype mode. Do not rely on simulated alerts for real-world crop protection.
            </p>
          </section>
        )}

        {activeNav === 'Field zones' && (
          <section className="page-section">
            <div className="page-heading">
              <div>
                <span className="eyebrow">Four sides of your farm</span>
                <h1>Field zones</h1>
                <p>North, East, South, and West — each boundary at a glance. Status below is simulated.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={simulateDetection}>
                <Plus size={17} /> Simulate detection
              </button>
            </div>
            <FieldMap events={events} />
            <DirectionGrid
              events={events}
              latestBySide={latestBySide}
              selectedZone={selectedZone}
              onSelect={(zone) => {
                setSelectedZone(zone);
                setToast(`${zone} zone selected (simulation)`);
              }}
            />
          </section>
        )}

        {activeNav === 'Alert history' && (
          <section className="page-section">
            <div className="page-heading">
              <div>
                <span className="eyebrow">Event log</span>
                <h1>Alert history</h1>
                <p>Every entry is labelled as simulated until live sensors are connected.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={simulateDetection}>
                <Plus size={17} /> Simulate detection
              </button>
            </div>
            <AlertsPanel
              title="Recent detection history"
              subtitle="Review direction, event time, and status"
              events={events}
              onReview={reviewEvent}
              history
            />
          </section>
        )}

        {activeNav === 'Device controls' && (
          <section className="page-section">
            <div className="page-heading"><div><span className="eyebrow">Remote field equipment</span><h1>Device controls</h1><p>Controls are in demo mode until an ESP32 backend is connected.</p></div><span className="status-tag status-demo"><span className="pulse-dot" /> Demo only</span></div>
            <div className="demo-banner" role="note"><div className="demo-banner-icon"><AlertTriangle size={19} /></div><div><strong>Hardware is not connected</strong><p>These controls change only the local preview. They do not operate a physical buzzer or light yet.</p></div></div>
            <div className="control-grid">
              <article className="control-card">
                <div className="control-card-head"><div className="control-icon"><Volume2 size={22}/></div><div><h3>Field buzzer</h3><p>Sound deterrent</p></div><label className="switch-label"><input type="checkbox" checked={buzzerOn} onChange={e => {setBuzzerOn(e.target.checked); setToast(`Demo buzzer ${e.target.checked ? 'enabled' : 'disabled'}`)}}/><span className="switch-ui"/><span className="sr-only">Toggle buzzer</span></label></div>
                <div className="slider-heading"><label htmlFor="buzzer-intensity">Sound intensity</label><strong>{buzzerIntensity}%</strong></div>
                <input id="buzzer-intensity" className="intensity-slider" type="range" min="0" max="100" step="5" value={buzzerIntensity} onChange={e => setBuzzerIntensity(Number(e.target.value))}/>
                <div className="slider-ends"><span>Low</span><span>High</span></div>
                <button className="btn btn-outline full-btn" type="button" onClick={() => setToast('Demo buzzer test only — no physical buzzer connected')}><Volume2 size={17}/> Test buzzer</button>
                <p className="control-footnote">Intensity control requires compatible buzzer and driver hardware.</p>
              </article>
              <article className="control-card">
                <div className="control-card-head"><div className="control-icon light"><Lightbulb size={22}/></div><div><h3>Scarecrow light</h3><p>Visual deterrent</p></div><label className="switch-label"><input type="checkbox" checked={lightOn} onChange={e => {setLightOn(e.target.checked); setToast(`Demo light ${e.target.checked ? 'enabled' : 'disabled'}`)}}/><span className="switch-ui"/><span className="sr-only">Toggle light</span></label></div>
                <div className="slider-heading"><label htmlFor="light-intensity">Light brightness</label><strong>{lightIntensity}%</strong></div>
                <input id="light-intensity" className="intensity-slider" type="range" min="0" max="100" step="5" value={lightIntensity} onChange={e => setLightIntensity(Number(e.target.value))}/>
                <div className="slider-ends"><span>Dim</span><span>Bright</span></div>
                <button className="btn btn-outline full-btn" type="button" onClick={() => setToast('Demo light test only — no physical light connected')}><Lightbulb size={17}/> Test light</button>
                <p className="control-footnote">Brightness control requires a dimmable light and compatible driver.</p>
              </article>
              <article className="control-card control-card-wide">
                <div className="control-card-head"><div className="control-icon"><ShieldCheck size={22}/></div><div><h3>Automatic protection</h3><p>Configure the intended field response</p></div><label className="switch-label"><input type="checkbox" checked={autoProtection} onChange={e => {setAutoProtection(e.target.checked); setToast(`Demo automatic protection ${e.target.checked ? 'enabled' : 'disabled'}`)}}/><span className="switch-ui"/><span className="sr-only">Toggle automatic protection</span></label></div>
                <p className="control-footnote">When real hardware is connected, the ESP32 should run local detection and deterrent logic even when internet access is unavailable. This preview switch does not arm physical equipment.</p>
                <button type="button" className="btn btn-primary" onClick={() => {setBuzzerOn(true); setLightOn(true); setToast('Manual alert simulated. No physical devices were activated.')}}><Bell size={17}/> Trigger manual alert</button>
              </article>
            </div>
            <section className="panel radar-panel"><div className="panel-heading"><div><h3>Field radar</h3><p>Animated interface preview, not a physical radar sensor</p></div><span className="status-tag status-demo"><span className="pulse-dot"/> Demo sweep</span></div><div className="radar-stage"><div className="radar-ring ring-one"/><div className="radar-ring ring-two"/><div className="radar-ring ring-three"/><div className="radar-sweep"/><span className="radar-label north">NORTH</span><span className="radar-label east">EAST</span><span className="radar-label south">SOUTH</span><span className="radar-label west">WEST</span><div className="radar-center"><Radar size={25}/></div></div><p className="radar-caption">The sweep is a visual animation. Directional alerts will reflect real events only after the sensor and backend integration is completed.</p></section>
          </section>
        )}

        {activeNav === 'Settings' && (
          <section className="page-section">
            <div className="page-heading"><div><span className="eyebrow">Personalize your experience</span><h1>Settings</h1><p>Configure your profile and prepare device integration.</p></div></div>
            <div className="settings-grid">
              <section className="panel settings-panel"><div className="panel-heading"><div><h3>Device setup</h3><p>Hardware integration status</p></div><Settings size={20}/></div><div className="settings-note"><Radio size={19}/><div><strong>ESP32 not connected</strong><p>Device ID, sensor health, live events, and remote commands will become available after backend and firmware setup.</p></div></div><div className="health-list"><HealthRow icon={<Radio size={18}/>} label="ESP32 controller" value="Not connected"/><HealthRow icon={<Activity size={18}/>} label="Sensors" value="Awaiting setup"/><HealthRow icon={<Bell size={18}/>} label="Push notifications" value="Not configured"/></div></section>
              <section className="panel settings-panel developer-panel"><div className="panel-heading"><div><h3>App developer</h3><p>Customize the developer profile shown in the app</p></div><UserRound size={20}/></div><div className="developer-preview">{developerPhoto ? <img src={developerPhoto} alt="Developer profile" onError={e => {e.currentTarget.style.display='none'}}/> : <div className="developer-placeholder"><UserRound size={30}/></div>}<div><strong>{developerName || 'App Developer'}</strong><p>{developerBio || 'KhetMitra application developer'}</p></div></div><label className="settings-field">Display name<input value={developerName} onChange={e => setDeveloperName(e.target.value)} placeholder="Your name"/></label><label className="settings-field">Profile photo URL<input value={developerPhoto} onChange={e => setDeveloperPhoto(e.target.value)} placeholder="https://…" type="url"/></label><label className="settings-field">Short description<input value={developerBio} onChange={e => setDeveloperBio(e.target.value)} placeholder="A short developer bio"/></label><label className="settings-field">LinkedIn URL<input value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/…" type="url"/></label><label className="settings-field">Instagram URL<input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/…" type="url"/></label><button className="btn btn-primary full-btn" type="button" onClick={() => setToast('Developer profile updated for this session')}>Save developer profile</button><div className="developer-links">{linkedinUrl && <a href={linkedinUrl} target="_blank" rel="noreferrer"><ExternalLink size={15}/> LinkedIn</a>}{instagramUrl && <a href={instagramUrl} target="_blank" rel="noreferrer"><Instagram size={15}/> Instagram</a>}</div><p className="control-footnote">Currently saved for this browser session only. Persistent profile settings can be added with Supabase.</p></section>
            </div>
          </section>
        )}
      </main>

      <nav className="mobile-dock" aria-label="Mobile">
        <button className={activeNav === 'Overview' ? 'active' : ''} onClick={() => goTo('Overview')}>
          <Activity size={18} /> Overview
        </button>
        <button className={activeNav === 'Field zones' ? 'active' : ''} onClick={() => goTo('Field zones')}>
          <Compass size={18} /> Zones
        </button>
        <button className={activeNav === 'Alert history' ? 'active' : ''} onClick={() => goTo('Alert history')}>
          <Bell size={18} /> Alerts
          {unresolved > 0 && <span className="dock-badge">{unresolved}</span>}
        </button>
      </nav>

      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button type="button" onClick={() => setToast('')} aria-label="Dismiss message">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, tone, label, value, caption }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-caption">{caption}</div>
    </article>
  );
}

function DirectionGrid({ latestBySide, selectedZone, onSelect }) {
  return (
    <section className="direction-section" aria-labelledby="direction-heading">
      <div className="section-heading">
        <h2 id="direction-heading">Directional monitoring</h2>
        <p>Each card shows the latest simulated activity for that side of the field.</p>
      </div>
      <div className="direction-grid">
        {zones.map((zone) => {
          const latest = latestBySide[zone.name];
          const alert = latest?.status === 'New';
          const selected = selectedZone === zone.name;
          return (
            <button
              key={zone.name}
              type="button"
              className={`direction-card ${alert ? 'is-alert' : ''} ${selected ? 'is-selected' : ''}`}
              onClick={() => onSelect(zone.name)}
            >
              <div className="direction-compass" aria-hidden="true">
                <Compass size={18} />
              </div>
              <div className="direction-copy">
                <strong>{zone.name}</strong>
                <span>{zone.note}</span>
              </div>
              <span className={`zone-status ${alert ? 'zone-status-alert' : ''}`}>
                <i />
                {alert ? 'New alert' : 'Secure'}
              </span>
              <p className="direction-meta">
                {latest
                  ? `${latest.animal} · ${timeAgo(latest.time)} · Simulated`
                  : 'No simulated activity yet'}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SystemHealth() {
  return (
    <section className="panel status-panel">
      <div className="panel-heading">
        <div>
          <h3>System health</h3>
          <p>Honest prototype status — nothing here is claimed as live hardware</p>
        </div>
        <span className="status-tag status-demo"><span className="pulse-dot" /> Demo data</span>
      </div>
      <div className="health-list">
        <HealthRow icon={<Cloud size={18} />} label="Cloud connection" value="Not connected" />
        <HealthRow icon={<Radio size={18} />} label="ESP32 controller" value="Awaiting setup" />
        <HealthRow icon={<Zap size={18} />} label="Buzzer / alarm" value="Simulated" />
        <HealthRow icon={<ThermometerSun size={18} />} label="Sensor readings" value="Sample data only" />
      </div>
      <div className="health-note">
        <Clock3 size={16} />
        <span>Real-time monitoring can start after hardware integration. Until then, every reading stays labelled as demo.</span>
      </div>
    </section>
  );
}

function HealthRow({ icon, label, value }) {
  return (
    <div className="health-row">
      <div className="health-icon">{icon}</div>
      <div className="health-label">{label}</div>
      <span className="health-value">{value}</span>
    </div>
  );
}

function FieldMap({ events }) {
  const latestBySide = Object.fromEntries(
    ['North', 'East', 'South', 'West'].map((side) => [side, events.find((e) => e.side === side && e.status === 'New')]),
  );
  return (
    <div className="field-map" role="img" aria-label="Illustrative map of north, east, south, and west field boundaries">
      <div className="map-top-label">N <span>↑</span></div>
      <div className="map-side-label map-west">W</div>
      <div className="map-side-label map-east">E</div>
      <div className="map-bottom-label">S <span>↓</span></div>
      {['North', 'East', 'South', 'West'].map((side) => (
        <div key={side} className={`map-zone zone-${side.toLowerCase()}`}>
          <span className="zone-direction">{side}</span>
          {latestBySide[side] && (
            <span className="map-alert"><AlertTriangle size={13} /> Alert</span>
          )}
        </div>
      ))}
      <div className="map-crop">
        <div className="crop-title"><Sprout size={19} /><span>Your field</span></div>
        <div className="crop-caption">Illustrative layout · simulated sensors</div>
      </div>
    </div>
  );
}

function AlertsPanel({ title, subtitle, events, onReview, onViewAll, showViewAll, onLoadMore, history = false }) {
  return (
    <section className="panel events-panel">
      <div className="panel-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <div className="panel-heading-actions">
          <span className="status-tag status-demo"><span className="pulse-dot" /> Simulated</span>
          {onViewAll && (
            <button type="button" className="text-button" onClick={onViewAll}>
              View all activity <span>→</span>
            </button>
          )}
        </div>
      </div>
      <EventsTable events={events} onReview={onReview} />
      {showViewAll && (
        <button type="button" className="load-more" onClick={onLoadMore}>Load older events</button>
      )}
      {history && events.length > 0 && (
        <p className="history-footnote">Showing {events.length} simulated detection{events.length === 1 ? '' : 's'}.</p>
      )}
    </section>
  );
}

function EventsTable({ events, onReview }) {
  if (!events.length) {
    return (
      <div className="empty-state">
        <Leaf size={28} />
        <strong>No detections yet</strong>
        <p>Simulate a detection to see it appear here. Live sensors are not connected.</p>
      </div>
    );
  }

  return (
    <div className="events-list">
      <div className="events-head">
        <span>Detection</span>
        <span>Direction</span>
        <span>Event time</span>
        <span>Status</span>
        <span />
      </div>
      {events.map((e) => (
        <div className="event-row" key={e.id}>
          <div className="event-name">
            <div className={`event-symbol ${e.severity}`}><AlertTriangle size={17} /></div>
            <div>
              <strong>{e.animal}</strong>
              <span>Simulated · {e.severity === 'high' ? 'High priority' : e.severity === 'medium' ? 'Movement detected' : 'Low priority'}</span>
            </div>
          </div>
          <div>
            <span className="side-pill"><Compass size={13} />{e.side}</span>
          </div>
          <div className="event-time">{timeAgo(e.time)}</div>
          <div>
            <span className={`event-status ${e.status === 'New' ? 'event-new' : 'event-reviewed'}`}>
              <i />
              {e.status}
            </span>
          </div>
          <div>
            {e.status === 'New' ? (
              <button type="button" className="review-btn" onClick={() => onReview(e.id)}>
                <Check size={16} />
                <span>Review</span>
              </button>
            ) : (
              <span className="reviewed-check" title="Reviewed"><Check size={16} /></span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
