import React from 'react';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, Bell, Check, ChevronDown, Clock3, Cloud,
  Compass, Leaf, LogOut, Menu, Plus, Radio, ShieldCheck, Sprout,
  ThermometerSun, Wifi, X, Zap
} from 'lucide-react';
import { hasSupabaseConfig, supabase } from './supabase';

const initialEvents = [
  { id: 1, animal: 'Wild boar', side: 'East', time: new Date(Date.now() - 1000 * 60 * 4), severity: 'high', status: 'New' },
  { id: 2, animal: 'Possible movement', side: 'North', time: new Date(Date.now() - 1000 * 60 * 38), severity: 'medium', status: 'Reviewed' },
  { id: 3, animal: 'Stray cattle', side: 'South', time: new Date(Date.now() - 1000 * 60 * 60 * 3), severity: 'medium', status: 'Reviewed' },
  { id: 4, animal: 'Possible movement', side: 'West', time: new Date(Date.now() - 1000 * 60 * 60 * 7), severity: 'low', status: 'Reviewed' },
];

const zones = [
  { name: 'North', note: 'Main entrance', state: 'Secure' },
  { name: 'East', note: 'Near the water line', state: 'Alert' },
  { name: 'South', note: 'Crop boundary', state: 'Secure' },
  { name: 'West', note: 'Storage-side boundary', state: 'Secure' },
];

function timeAgo(date) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  return `${Math.floor(hours / 24)} day(s) ago`;
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
    setBusy(true); setError(''); setMessage('');
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

  return <div className="auth-page">
    <div className="auth-visual">
      <div className="brand brand-light"><div className="brand-mark"><Sprout size={23}/></div><span>FieldGuard</span></div>
      <div className="visual-copy">
        <span className="eyebrow light-eyebrow">SMART CROP PROTECTION</span>
        <h1>Protect what<br/>you <em>grow.</em></h1>
        <p>One clear view of your field, your boundaries, and every alert that matters.</p>
        <div className="visual-stats"><div><strong>4</strong><span>Field zones</span></div><div><strong>24/7</strong><span>Monitoring ready</span></div><div><strong>1 view</strong><span>Peace of mind</span></div></div>
      </div>
      <div className="field-art" aria-hidden="true">
        <div className="sun"></div><div className="hill hill-back"></div><div className="hill hill-front"></div>
        <div className="crop-row row-one"></div><div className="crop-row row-two"></div><div className="crop-row row-three"></div>
        <div className="art-label"><span className="pulse-dot"></span> Field monitoring, simplified</div>
      </div>
    </div>
    <div className="auth-panel">
      <div className="mobile-brand brand"><div className="brand-mark"><Sprout size={23}/></div><span>FieldGuard</span></div>
      <div className="auth-form-wrap">
        <span className="eyebrow">WELCOME TO FIELDGUARD</span>
        <h2>{mode === 'login' ? 'Good to have you back.' : 'Create your account.'}</h2>
        <p className="muted">{mode === 'login' ? 'Sign in to check on your field.' : 'Set up your farmer monitoring account.'}</p>
        <form onSubmit={submit} className="auth-form">
          <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email"/></label>
          <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'}/></label>
          {error && <div className="form-message error"><AlertTriangle size={16}/><span>{error}</span></div>}
          {message && <div className="form-message success"><Check size={16}/><span>{message}</span></div>}
          <button className="btn btn-primary full-btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button>
        </form>
        <div className="auth-switch">{mode === 'login' ? 'New to FieldGuard?' : 'Already have an account?'} <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');setMessage('')}}>{mode==='login'?'Create account':'Sign in'}</button></div>
        <div className="divider-label"><span></span> OR <span></span></div>
        <button className="btn btn-outline full-btn" onClick={onDemoLogin}><Activity size={17}/> Preview demo dashboard</button>
        <p className="auth-foot"><ShieldCheck size={15}/> Your field data should stay private and protected.</p>
      </div>
      <div className="auth-bottom">© 2026 FieldGuard <span>Built for better growing.</span></div>
    </div>
  </div>;
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
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!hasSupabaseConfig) return;
    supabase.auth.getSession().then(({data}) => { setSession(data.session); setAuthChecked(true); setDemo(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession); setAuthChecked(true); setDemo(false);
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

  const unresolved = events.filter(e => e.status === 'New').length;
  const todayCount = events.filter(e => new Date(e.time).toDateString() === new Date().toDateString()).length;
  const latestEvent = events[0];

  async function signOut() {
    if (hasSupabaseConfig && session) await supabase.auth.signOut();
    setSession(null); setDemo(false); setEvents(initialEvents); setActiveNav('Overview');
  }

  function simulateDetection() {
    const sides = ['North', 'East', 'South', 'West'];
    const animals = ['Possible movement', 'Wild boar', 'Stray cattle', 'Deer'];
    const side = sides[Math.floor(Math.random() * sides.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    setEvents(old => [{ id: Date.now(), animal, side, time: new Date(), severity: animal === 'Wild boar' ? 'high' : 'medium', status: 'New' }, ...old]);
    setToast(`Simulated detection added — ${side} zone`);
    setActiveNav('Overview');
  }

  function reviewEvent(id) {
    setEvents(old => old.map(e => e.id === id ? {...e, status: 'Reviewed'} : e));
    setToast('Alert marked as reviewed');
  }

  if (!authChecked) return <div className="loading-screen"><div className="brand-mark"><Sprout size={23}/></div><p>Checking your session…</p></div>;
  if (!session && !demo) return <AuthScreen onDemoLogin={() => { setDemo(true); setToast('Demo mode enabled — all events are simulated'); }}/>;

  const userEmail = session?.user?.email || 'demo@fieldguard.local';
  const visibleEvents = showAll ? events : events.slice(0, 4);

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'sidebar-open':''}`}>
      <div className="brand"><div className="brand-mark"><Sprout size={23}/></div><span>FieldGuard</span></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>
        <button className={`nav-item ${activeNav==='Overview'?'active':''}`} onClick={()=>{setActiveNav('Overview');setMobileNav(false)}}><Activity size={18}/> Overview</button>
        <button className={`nav-item ${activeNav==='Field zones'?'active':''}`} onClick={()=>{setActiveNav('Field zones');setMobileNav(false)}}><Compass size={18}/> Field zones <span className="nav-count">4</span></button>
        <button className={`nav-item ${activeNav==='Alert history'?'active':''}`} onClick={()=>{setActiveNav('Alert history');setShowAll(true);setMobileNav(false)}}><Bell size={18}/> Alert history <span className="nav-count">{events.length}</span></button>
      </nav>
      <div className="sidebar-spacer"></div>
      <div className="help-card"><div className="help-icon"><Leaf size={18}/></div><strong>Growing with confidence</strong><p>Your field's first line of digital protection.</p><div className="help-progress"><span></span></div><small>Prototype · Phase 1 of 3</small></div>
      <div className="profile-row"><div className="avatar">{userEmail.slice(0,1).toUpperCase()}</div><div className="profile-info"><strong>{demo?'Demo Farmer':userEmail.split('@')[0]}</strong><span>{demo?'Preview mode':userEmail}</span></div><button className="icon-button logout" title="Sign out" onClick={signOut}><LogOut size={17}/></button></div>
    </aside>
    {mobileNav && <button className="mobile-scrim" onClick={()=>setMobileNav(false)} aria-label="Close menu"/>}
    <main className="main-content">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button menu-button" onClick={()=>setMobileNav(!mobileNav)}><Menu size={20}/></button><div><div className="breadcrumb">Workspace <span>/</span> <strong>{activeNav}</strong></div><div className="date-line">{now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div></div></div>
        <div className="topbar-actions"><div className="demo-pill"><span className="pulse-dot"></span> SIMULATION MODE</div><div className="notification-wrap"><button className="icon-button notification-button" onClick={()=>setNotificationsOpen(!notificationsOpen)} aria-label="Notifications"><Bell size={19}/>{unresolved>0&&<i/>}</button>{notificationsOpen&&<div className="notification-popover"><strong>Notifications</strong><p>{unresolved ? `${unresolved} alert${unresolved>1?'s':''} need review.` : 'You are all caught up.'}</p><button onClick={()=>{setActiveNav('Alert history');setShowAll(true);setNotificationsOpen(false)}}>View alert history →</button></div>}</div><button className="user-chip" onClick={()=>setNotificationsOpen(!notificationsOpen)}><span className="avatar small-avatar">{userEmail.slice(0,1).toUpperCase()}</span><ChevronDown size={15}/></button></div>
      </header>

      {activeNav==='Field zones' ? <section className="page-section">
        <div className="page-heading"><div><span className="eyebrow">FIELD LAYOUT</span><h1>Field zones</h1><p>Monitor each boundary of your farm at a glance.</p></div><button className="btn btn-primary" onClick={simulateDetection}><Plus size={17}/> Simulate detection</button></div>
        <FieldMap events={events}/>
        <div className="zone-grid">{zones.map(z=><ZoneCard key={z.name} zone={z} active={events[0]?.side===z.name&&events[0]?.status==='New'} onClick={()=>setToast(`${z.name} zone selected (simulation)`)} />)}</div>
      </section> : activeNav==='Alert history' ? <section className="page-section">
        <div className="page-heading"><div><span className="eyebrow">EVENT LOG</span><h1>Alert history</h1><p>Review simulated detections from your field zones.</p></div><button className="btn btn-primary" onClick={simulateDetection}><Plus size={17}/> Simulate detection</button></div>
        <EventsTable events={events} onReview={reviewEvent} showAll/>
      </section> : <section className="page-section">
        <div className="welcome-row"><div><span className="eyebrow">FIELD OVERVIEW</span><h1>Good {now.getHours()<12?'morning':now.getHours()<18?'afternoon':'evening'}, Farmer <span className="wave">✳</span></h1><p>Here’s what’s happening around your field today.</p></div><button className="btn btn-primary" onClick={simulateDetection}><Plus size={17}/> Simulate detection</button></div>
        {demo && <div className="demo-banner"><div className="demo-banner-icon"><Activity size={19}/></div><div><strong>You’re exploring the live preview</strong><p>Sensor readings and alerts are sample data. No ESP32 is connected yet.</p></div><button onClick={()=>setToast('When hardware is ready, we will connect real sensor events here.')}>What’s next?</button></div>}
        <div className="stats-grid">
          <StatCard icon={<ShieldCheck size={20}/>} tone="green" label="Field status" value={latestEvent?.status==='New'?'Attention needed':'All clear'} caption={latestEvent?.status==='New'?`${latestEvent.side} zone needs review`:'No new alerts right now'} />
          <StatCard icon={<AlertTriangle size={20}/>} tone="amber" label="Alerts today" value={String(todayCount)} caption={`${unresolved} need review`} />
          <StatCard icon={<Compass size={20}/>} tone="blue" label="Zones monitored" value="4 / 4" caption="North · East · South · West" />
          <StatCard icon={<Wifi size={20}/>} tone="purple" label="Device connection" value="Demo mode" caption="ESP32 not connected yet" />
        </div>
        <div className="dashboard-grid">
          <div className="panel field-panel"><div className="panel-heading"><div><h3>Field monitoring</h3><p>Illustrative layout · four boundary zones</p></div><button className="text-button" onClick={()=>setActiveNav('Field zones')}>View zones <span>→</span></button></div><FieldMap events={events}/><div className="map-legend"><span><i className="legend-secure"></i> Secure zone</span><span><i className="legend-alert"></i> Recent alert</span><span><i className="legend-sensor"></i> Simulated sensor</span></div></div>
          <div className="panel status-panel"><div className="panel-heading"><div><h3>System health</h3><p>Prototype status</p></div><span className="status-tag status-demo"><span className="pulse-dot"></span> Demo</span></div><div className="health-list"><HealthRow icon={<Cloud size={18}/>} label="Cloud connection" value="Not connected" state="neutral"/><HealthRow icon={<Radio size={18}/>} label="ESP32 controller" value="Awaiting setup" state="neutral"/><HealthRow icon={<Zap size={18}/>} label="Buzzer / alarm" value="Simulated" state="neutral"/><HealthRow icon={<ThermometerSun size={18}/>} label="Sensor readings" value="Sample data" state="neutral"/></div><div className="health-note"><Clock3 size={16}/><span>Real-time monitoring will activate after hardware integration.</span></div></div>
        </div>
        <div className="panel events-panel"><div className="panel-heading"><div><h3>Recent detections</h3><p>Latest simulated activity around the field</p></div><button className="text-button" onClick={()=>{setActiveNav('Alert history');setShowAll(true)}}>View all activity <span>→</span></button></div><EventsTable events={visibleEvents} onReview={reviewEvent}/>{events.length>4&&!showAll&&<button className="load-more" onClick={()=>setShowAll(true)}>Load older events</button>}</div>
        <div className="footer-note"><ShieldCheck size={15}/> FieldGuard is in prototype mode. Do not rely on simulated alerts for real-world crop protection.</div>
      </section>}
    </main>
    {toast&&<div className="toast"><Check size={17}/>{toast}<button onClick={()=>setToast('')}><X size={15}/></button></div>}
  </div>;
}

function StatCard({icon,tone,label,value,caption}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-caption">{caption}</div></div>;
}
function HealthRow({icon,label,value}) {
  return <div className="health-row"><div className="health-icon">{icon}</div><div className="health-label">{label}</div><span className="health-value">{value}</span></div>;
}
function ZoneCard({zone,active,onClick}) {
  return <button className={`zone-card ${active?'zone-card-alert':''}`} onClick={onClick}><div className={`zone-icon ${active?'zone-icon-alert':''}`}><Compass size={18}/></div><div className="zone-main"><strong>{zone.name} zone</strong><span>{zone.note}</span></div><span className={`zone-status ${active?'zone-status-alert':''}`}><i/>{active?'Alert':'Secure'}</span></button>;
}
function FieldMap({events}) {
  const latestBySide = Object.fromEntries(['North','East','South','West'].map(side=>[side,events.find(e=>e.side===side&&e.status==='New')]));
  return <div className="field-map">
    <div className="map-top-label">N <span>↑</span></div><div className="map-side-label map-west">W</div><div className="map-side-label map-east">E</div><div className="map-bottom-label">S <span>↓</span></div>
    <div className="map-zone zone-north"><span className="zone-direction">NORTH</span>{latestBySide.North&&<span className="map-alert"><AlertTriangle size={13}/> Alert</span>}<span className="sensor-point point-a"><Radio size={12}/></span><span className="sensor-point point-b"><Radio size={12}/></span></div>
    <div className="map-zone zone-east"><span className="zone-direction">EAST</span>{latestBySide.East&&<span className="map-alert"><AlertTriangle size={13}/> Alert</span>}<span className="sensor-point point-c"><Radio size={12}/></span></div>
    <div className="map-zone zone-south"><span className="zone-direction">SOUTH</span>{latestBySide.South&&<span className="map-alert"><AlertTriangle size={13}/> Alert</span>}<span className="sensor-point point-d"><Radio size={12}/></span><span className="sensor-point point-e"><Radio size={12}/></span></div>
    <div className="map-zone zone-west"><span className="zone-direction">WEST</span>{latestBySide.West&&<span className="map-alert"><AlertTriangle size={13}/> Alert</span>}<span className="sensor-point point-f"><Radio size={12}/></span></div>
    <div className="map-crop"><div className="crop-title"><Sprout size={19}/><span>YOUR FIELD</span></div><div className="crop-lines">{Array.from({length:7},(_,i)=><span key={i}></span>)}</div><div className="crop-caption">Crop area · illustrative</div></div>
  </div>;
}
function EventsTable({events,onReview,showAll=false}) {
  if (!events.length) return <div className="empty-state"><ShieldCheck size={28}/><strong>No detections yet</strong><p>Simulate a detection to see it appear here.</p></div>;
  return <div className="events-list"><div className="events-head"><span>DETECTION</span><span>FIELD SIDE</span><span>TIME</span><span>STATUS</span><span></span></div>{events.map(e=><div className="event-row" key={e.id}><div className="event-name"><div className={`event-symbol ${e.severity}`}><AlertTriangle size={17}/></div><div><strong>{e.animal}</strong><span>{e.severity==='high'?'High priority':e.severity==='medium'?'Movement detected':'Low priority'}</span></div></div><div><span className="side-pill"><Compass size={13}/>{e.side}</span></div><div className="event-time">{timeAgo(e.time)}</div><div><span className={`event-status ${e.status==='New'?'event-new':'event-reviewed'}`}><i/>{e.status}</span></div><div>{e.status==='New'?<button className="review-btn" onClick={()=>onReview(e.id)} title="Mark as reviewed"><Check size={16}/><span>Review</span></button>:<span className="reviewed-check"><Check size={16}/></span>}</div></div>)}</div>;
}

export default App;