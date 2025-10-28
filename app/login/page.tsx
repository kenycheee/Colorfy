'use client';

import BackHome from '@/components/BackHome';
import { showNotification } from '@/components/ClientEffects';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const f = new FormData(e.currentTarget);
    const user = String(f.get('username') || '').trim();
    const pass = String(f.get('password') || '').trim();

    try {
      // Login ke Firebase Authentication
      await signInWithEmailAndPassword(auth, `${user}@demo.com`, pass);

      showNotification(`Welcome back, ${user}!`);
      setTimeout(() => (window.location.href = '/profile'), 1200);
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || '⚠️ Incorrect username or password!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <BackHome />
      <div className="auth-card">
        <h1 className="auth-title">
          Welcome <span className="grad">Back</span>
        </h1>
        <p className="auth-subtitle">
          Log in to continue your website projects with the color palettes you love.
        </p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="input-group">
            <span className="icon">👤</span>
            <input
              className="input"
              type="text"
              name="username"
              placeholder="Username"
              required
            />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input
              className="input"
              id="login-pass"
              type="password"
              name="password"
              placeholder="Password"
              required
            />
            <button
              type="button"
              className="toggle-pass"
              aria-label="Show Password"
              onClick={() => {
                const inp = document.getElementById('login-pass') as HTMLInputElement;
                inp.type = inp.type === 'password' ? 'text' : 'password';
              }}
            >
              👁️
            </button>
          </div>

          <div className="form-row">
            <label className="checkbox">
              <input type="checkbox" /> <span>Remember me</span>
            </label>
            <a href="#" aria-disabled="true">Forgot password?</a>
          </div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="divider">or</div>
        <p className="auth-switch">
          Don't have an account? <a href="/register">Sign up</a>
        </p>
      </div>
    </section>
  );
}