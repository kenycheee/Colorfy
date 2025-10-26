'use client';

import BackHome from '@/components/BackHome';
import { showNotification } from '../../components/ClientEffects';

export default function RegisterPage() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const user = String(f.get('username') || '').trim();
    const pass = String(f.get('password') || '').trim();

    localStorage.setItem('username', user);
    localStorage.setItem('password', pass);
    showNotification('Account created!');
    setTimeout(() => (window.location.href = '/login'), 1000);
  };

  return (
    <section className="auth-section">
      <BackHome />
      <div className="auth-card">
        <h1 className="auth-title">Create <span className="grad">Account</span></h1>
        <p className="auth-subtitle">Join and start building beautiful websites in minutes. Your colors, your style.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="input-group">
            <span className="icon">👤</span>
            <input className="input" type="text" name="username" placeholder="Username" required />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input className="input" id="reg-pass" type="password" name="password" placeholder="Password" required />
            <button
              type="button"
              className="toggle-pass"
              aria-label="Show Password"
              onClick={() => {
                const inp = document.getElementById('reg-pass') as HTMLInputElement;
                inp.type = inp.type === 'password' ? 'text' : 'password';
              }}
            >👁️</button>
          </div>

          <label className="checkbox">
            <input type="checkbox" required /> <span>I agree to the Terms and Privacy Policy.</span>
          </label>
          <div className="form-hint">For demo only. Don't use a real password.</div>

          <button className="btn-primary" type="submit">Register</button>
        </form>

        <div className="divider">or</div>
        <p className="auth-switch">Already have an account? <a href="/login">Login</a></p>
      </div>
    </section>
  );
}
