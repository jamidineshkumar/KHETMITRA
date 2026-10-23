import React, { useState } from 'react';
import { Activity, AlertTriangle, Check, ShieldCheck } from 'lucide-react';
import { hasSupabaseConfig, supabase } from '../supabase';
import Brand from './Brand';
import FarmScene from './FarmScene';

export default function AuthScreen({ onDemoLogin }) {
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
        setMessage('Account created! Check your email to confirm the account, then sign in.');
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
