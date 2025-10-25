'use client';

import { showNotification } from '../ClientEffects';

export default function RegisterPage() {
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const user = String(f.get('username') || '').trim();
    const pass = String(f.get('password') || '').trim();
    if (!user || !pass) {
      showNotification('Please fill out all fields!');
      return;
    }
    localStorage.setItem('username', user);
    localStorage.setItem('password', pass);
    showNotification('🎉 Account created successfully!');
    setTimeout(() => (window.location.href = '/login'), 1200);
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <h1 className="auth-title">Create <span className="grad">Account</span></h1>
        <p className="auth-subtitle">Join us and start building beautiful websites in minutes — your colors, your style.</p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="input-group">
            <span className="icon">👤</span>
            <input className="input" type="text" name="username" placeholder="Username" required />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input className="input" id="reg-pass" type="password" name="password" placeholder="Password" required />
            <button type="button" className="toggle-pass" aria-label="Show Password"
              onClick={() => {
                const inp = document.getElementById('reg-pass') as HTMLInputElement;
                inp.type = inp.type === 'password' ? 'text' : 'password';
              }}>👁️</button>
          </div>

          <label className="checkbox">
            <input type="checkbox" required /> <span>I agree to the Terms of Service and Privacy Policy.</span>
          </label>
          <div className="form-hint">Your account is stored locally on this device for demo purposes. Don’t use a real password.</div>

          <button className="btn-primary" type="submit">Register</button>
        </form>

        <div className="divider">or</div>
        <p className="auth-switch">Already have an account? <a href="/login">Login</a></p>
      </div>
    </section>
  );
}
