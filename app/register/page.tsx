'use client';

import { useState } from 'react';
import BackHome from '@/components/BackHome';

// ✅ IMPORT FIREBASE DAN FUNGSI YANG DIPERLUKAN
import { auth, db } from '@/lib/firebase'; // pastikan path ini sesuai dengan tempat kamu inisialisasi Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const f = new FormData(e.currentTarget);
    const user = String(f.get('username') || '').trim();
    const pass = String(f.get('password') || '').trim();

    try {
      // 1️⃣ Daftarkan user ke Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, `${user}@demo.com`, pass);
      const uid = userCredential.user.uid;

      // 2️⃣ Simpan data tambahan ke Firestore
      await setDoc(doc(db, 'users', uid), {
        username: user,
        email: `${user}@demo.com`,
        createdAt: new Date().toISOString(),
      });

      // ✅ Ganti showNotification dengan alert sementara
      alert('Account created successfully!');
      setTimeout(() => (window.location.href = '/login'), 1200);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Registration failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <BackHome />
      <div className="auth-card">
        <h1 className="auth-title">
          Create <span className="grad">Account</span>
        </h1>
        <p className="auth-subtitle">
          Join and start building beautiful websites in minutes. Your colors, your style.
        </p>

        <form className="auth-form" onSubmit={onSubmit} noValidate>
          <div className="input-group">
            <span className="icon">👤</span>
            <input className="input" type="text" name="username" placeholder="Username" required />
          </div>

          <div className="input-group">
            <span className="icon">🔒</span>
            <input
              className="input"
              id="reg-pass"
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
                const inp = document.getElementById('reg-pass') as HTMLInputElement;
                inp.type = inp.type === 'password' ? 'text' : 'password';
              }}
            >
              👁️
            </button>
          </div>

          <label className="checkbox">
            <input type="checkbox" required /> <span>I agree to the Terms and Privacy Policy.</span>
          </label>
          <div className="form-hint">For demo only. Don't use a real password.</div>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="divider">or</div>
        <p className="auth-switch">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </section>
  );
}
