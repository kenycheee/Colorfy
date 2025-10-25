'use client';

import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const [user, setUser] = useState<string>('User');

  useEffect(() => {
    const u = localStorage.getItem('username');
    if (u) setUser(u);
  }, []);

  const logout = () => {
    localStorage.removeItem('loggedIn');
    window.location.href = '/login';
  };

  return (
    <section className="hero-profile">
      <div className="hero-overlay" />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-avatar">
            <img src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png" alt="Profile Avatar" />
          </div>
          <h1 className="username">Welcome, <span className="highlight">{user}</span></h1>
          <p className="user-tagline">This is your personalized Colorfy space. Customize, explore, and make it yours.</p>
          <div className="profile-actions">
            <a href="#" className="btn-primary">Edit Profile</a>
            <button className="btn-secondary" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
    </section>
  );
}
