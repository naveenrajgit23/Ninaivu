// ============================================================
// நினைவு (Ninaivu) — Login Page
// ============================================================

import { useState } from 'react';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { signIn, signUp, isDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(username, password, fullName);
        if (error) setError(error);
      } else {
        const { error } = await signIn(username, password);
        if (error) setError(error);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // In demo mode, auto-redirect
  if (isDemo) return null;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-4)',
      background: 'var(--bg-primary)',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="sidebar-logo" style={{
            width: 64, height: 64, borderRadius: 'var(--radius-xl)',
            fontSize: 'var(--font-size-2xl)', margin: '0 auto var(--space-4)',
          }}>
            நி
          </div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', letterSpacing: 'var(--letter-spacing-tight)' }}>
            நினைவு
          </h1>
          <p className="text-muted text-sm" style={{ marginTop: 'var(--space-1)' }}>Your personal second brain</p>
        </div>

        {/* Form */}
        <form className="card animate-fadeInUp stagger-2" onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold mb-6">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>

          {error && (
            <div style={{ padding: 'var(--space-3)', background: 'var(--color-error-light)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
              {error}
            </div>
          )}

          {isSignUp && (
            <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="input-label">Full Name</label>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" required id="login-name" />
            </div>
          )}

          <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="input-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" type="text" value={username} onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())} placeholder="e.g. naveen123" required style={{ paddingLeft: 40 }} id="login-username" />
            </div>
          </div>

          <div className="input-group" style={{ marginBottom: 'var(--space-6)' }}>
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ paddingLeft: 40, paddingRight: 40 }} id="login-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading} id="btn-login">
            {loading ? <span className="spinner spinner-sm" /> : <>{isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={18} /></>}
          </button>

          <div className="text-center mt-6">
            <button
              type="button"
              className="btn btn-ghost text-sm"
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
