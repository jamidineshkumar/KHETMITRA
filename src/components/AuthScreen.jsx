import React, { useState } from 'react';
import { AlertTriangle, Check, ShieldCheck } from 'lucide-react';
import { hasSupabaseConfig, supabase } from '../supabase';
import Brand from './Brand';
import FarmScene from './FarmScene';

const RESEND_COOLDOWN_SECONDS = 60;

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendWait, setResendWait] = useState(0);

  React.useEffect(() => {
    if (resendWait <= 0) return undefined;
    const timer = window.setTimeout(() => setResendWait((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [resendWait]);

  function resetMessages() {
    setError('');
    setMessage('');
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setOtp('');
    resetMessages();
  }

  async function submit(e) {
    e.preventDefault();
    resetMessages();

    if (!hasSupabaseConfig || !supabase) {
      setError('Authentication is unavailable because Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your deployment environment.');
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    setBusy(true);
    try {
      if (mode === 'signup') {
        if (name.trim().length < 2) {
          setError('Enter your full name.');
          return;
        }
        const { data, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (authError) throw authError;

        // Email confirmation must be enabled in Supabase. If the project returns a
        // session immediately, do not present that as proof that OTP verification ran.
        if (data.session && data.user?.email_confirmed_at) {
          setMessage('Your email is already verified. You can sign in.');
          setMode('login');
          return;
        }
        if (data.session && !data.user?.email_confirmed_at) {
          await supabase.auth.signOut();
        }
        setMode('verify');
        setOtp('');
        setResendWait(RESEND_COOLDOWN_SECONDS);
        setMessage('If this address can be registered, Supabase has sent a verification code. Enter the code from your email to finish creating your account.');
        return;
      }

      if (mode === 'verify') {
        const token = otp.replace(/\s/g, '');
        if (!/^\d{6}$/.test(token)) {
          setError('Enter the 6-digit code from your email.');
          return;
        }
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email: normalizedEmail,
          token,
          type: 'signup',
        });
        if (verifyError) throw verifyError;
        setPassword('');
        setOtp('');
        setMode('login');
        setMessage('Email verified successfully. Sign in with your email and password.');
        return;
      }

      if (mode === 'forgot') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: window.location.origin,
        });
        if (resetError) throw resetError;
        setMessage('If an account exists for this email, password recovery instructions have been sent.');
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInError) throw signInError;

      if (!data.user?.email_confirmed_at) {
        await supabase.auth.signOut();
        setMode('verify');
        setMessage('Verify your email before signing in. Request a new code if the previous one expired.');
        return;
      }
      // The root app listens to Supabase's auth state; no frontend/demo login is used.
    } catch (authError) {
      const msg = authError?.message || 'Authentication failed. Please try again.';
      if (/already registered|already exists/i.test(msg)) {
        setError('An account may already exist for this email. Try signing in or use password recovery.');
      } else if (/invalid.*otp|otp.*expired|token.*invalid|token.*expired/i.test(msg)) {
        setError('That code is invalid or expired. Request a new code and try again.');
      } else if (/invalid login credentials/i.test(msg)) {
        setError('Email or password is incorrect. If you have not verified your email, verify it first.');
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    resetMessages();
    if (!hasSupabaseConfig || !supabase) {
      setError('Supabase is not configured.');
      return;
    }
    if (resendWait > 0 || busy) return;
    setBusy(true);
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      if (resendError) throw resendError;
      setResendWait(RESEND_COOLDOWN_SECONDS);
      setMessage('If verification is available for this address, a new code has been sent.');
    } catch (resendError) {
      setError(resendError?.message || 'Could not resend the code. Please wait and try again.');
    } finally {
      setBusy(false);
    }
  }

  const isPasswordMode = mode === 'login' || mode === 'signup';
  const title = mode === 'login'
    ? 'Sign in to KhetMitra'
    : mode === 'signup'
      ? 'Create an Account'
      : mode === 'verify'
        ? 'Verify your email'
        : 'Reset your password';

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <Brand light />
        <div className="visual-copy">
          <span className="eyebrow">Smart Field Security</span>
          <h1>Your Farm, Protected</h1>
          <p>Autonomous perimeter protection and directional deterrent monitoring for your crops.</p>
        </div>
        <FarmScene />
      </section>

      <section className="auth-panel">
        <div className="mobile-brand"><Brand /></div>
        <div className="auth-form-wrap">
          <span className="eyebrow">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Get Started' : mode === 'verify' ? 'Email confirmation' : 'Account recovery'}
          </span>
          <h2>{title}</h2>
          <p className="muted">
            {mode === 'login'
              ? 'Sign in with your verified email and password.'
              : mode === 'signup'
                ? 'Create an account. You must verify your email before signing in.'
                : mode === 'verify'
                  ? 'Enter the 6-digit verification code sent to your email address.'
                  : 'Request a password recovery email for your account.'}
          </p>

          <form onSubmit={submit} className="auth-form">
            {mode === 'signup' && (
              <label htmlFor="auth-name">
                Full Name
                <input id="auth-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required minLength={2} autoComplete="name" />
              </label>
            )}

            <label htmlFor="auth-email">
              Email address
              <input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" readOnly={mode === 'verify'} />
            </label>

            {isPasswordMode && (
              <label htmlFor="auth-password">
                Password
                <input id="auth-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'login' ? 'Your password' : 'At least 8 characters'} required minLength={mode === 'login' ? 1 : 8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              </label>
            )}

            {mode === 'verify' && (
              <label htmlFor="auth-otp">
                Email verification code
                <input id="auth-otp" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" autoComplete="one-time-code" required />
              </label>
            )}

            {error && <div className="form-message error" role="alert"><AlertTriangle size={16} /><span>{error}</span></div>}
            {message && <div className="form-message success" role="status"><Check size={16} /><span>{message}</span></div>}

            <button className="btn btn-primary full-btn" disabled={busy || !hasSupabaseConfig}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'verify' ? 'Verify email' : 'Send recovery email'}
            </button>
          </form>

          {mode === 'verify' && (
            <div className="auth-switch">
              <button type="button" disabled={busy || resendWait > 0} onClick={resendCode}>
                {resendWait > 0 ? `Resend code in ${resendWait}s` : 'Resend verification code'}
              </button>
              <button type="button" onClick={() => changeMode('signup')}>Change email</button>
            </div>
          )}

          {mode !== 'verify' && (
            <div className="auth-switch">
              {mode === 'login' ? "Don't have an account?" : mode === 'signup' ? 'Already have an account?' : 'Remember your password?'}
              <button type="button" onClick={() => changeMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
              {mode === 'login' && <button type="button" onClick={() => changeMode('forgot')}>Forgot password?</button>}
            </div>
          )}
          {!hasSupabaseConfig && (
            <div className="form-message error" role="alert">
              <ShieldCheck size={16} />
              <span>Live authentication is disabled until Supabase URL and publishable key are configured. Demo sign-in is unavailable.</span>
            </div>
          )}
        </div>
        <div className="auth-bottom"><span>© 2026 KhetMitra</span><span>Smart Crop Protection</span></div>
      </section>
    </div>
  );
}
