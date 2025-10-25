'use client';

import BackHome from '@/components/BackHome';

export default function ProfilePage() {
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : 'User';

  return (
    <section className="hero-profile">
      <BackHome />
      <div className="hero-overlay"></div>
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <img src="/favicon.ico" alt="Avatar" />
          </div>
          <h2 className="username">{username || 'User'}</h2>
          <p className="user-tagline">Colors that match your brand, sites that don’t make your eyes cry.</p>
          <div className="profile-actions">
            <a className="btn-primary" href="/#features">Explore Features</a>
            <button
              className="btn-secondary"
              onClick={() => {
                localStorage.removeItem('loggedIn');
                window.location.href = '/';
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
