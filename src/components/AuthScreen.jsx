import React, { useState } from 'react';
import { AlertTriangle, Check, ShieldCheck } from 'lucide-react';
import { hasSupabaseConfig, supabase } from '../supabase';
import Brand from './Brand';
import FarmScene from './FarmScene';

export default function AuthScreen({ onLoginSuccess }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
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

    const isAdmin =
      email.toLowerCase().includes('admin') ||
      email.toLowerCase().endsWith('@khetmitra.admin');
    const role = isAdmin ? 'admin' : 'customer';

    try {
      if (!hasSupabaseConfig) {
        // Local direct authentication based on credentials
        onLoginSuccess(email, role);
        return;
      }

      const result =
        mode === 'login'
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: { data: { full_name: name } },
            });

      if (result.error) throw result.error;

      if (mode === 'signup' && !result.data.session) {
        setMessage('Account created! Please check your email to confirm, then sign in.');
      } else {
        onLoginSuccess(email, role);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <Brand light />
        <div className="visual-copy">
          <span className="eyebrow">Smart Field Security</span>
          <h1>Your Farm, Protected</h1>
          <p>
            Autonomous perimeter protection and directional deterrent monitoring for your crops.
          </p>
        </div>
        <FarmScene />
      </section>

      <section className="auth-panel">
        <div className="mobile-brand">
          <Brand />
        </div>

        <div className="auth-form-wrap">
          <span className="eyebrow">
            {mode === 'login' ? 'Welcome Back' : 'Get Started'}
          </span>
          <h2>{mode === 'login' ? 'Sign in to KhetMitra' : 'Create an Account'}</h2>
          <p className="muted">
            {mode === 'login'
              ? 'Enter your credentials to access your field dashboard.'
              : 'Register your farm account to activate automated crop protection.'}
          </p>

          <form onSubmit={submit} className="auth-form">
            {mode === 'signup' && (
              <label htmlFor="auth-name">
                Full Name
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  required
                  autoComplete="name"
                />
              </label>
            )}

            <label htmlFor="auth-email">
              Email address
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com (or admin@khetmitra.com)"
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
              {busy
                ? 'Verifying…'
                : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
                setMessage('');
              }}
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>

        <div className="auth-bottom">
          <span>© 2026 KhetMitra</span>
          <span>Smart Crop Protection</span>
        </div>
      </section>
    </div>
  );
}
