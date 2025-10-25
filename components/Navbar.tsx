'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Hide on these routes
  const HIDE_ON = ['/login', '/register', '/profile'];
  if (HIDE_ON.includes(pathname)) return null;

  useEffect(() => {
    const nav = navRef.current!;
    const onScroll = () => {
      const y = window.pageYOffset;
      if (y > 100) {
        nav.style.background = 'rgba(10, 14, 39, 0.95)';
        nav.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.1)';
      } else {
        nav.style.background = 'rgba(10, 14, 39, 0.8)';
        nav.style.boxShadow = 'none';
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goGetStarted = () => {
    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('loggedIn');
    window.location.href = isLoggedIn ? '/profile' : '/login';
  };

  return (
    <nav className="nav" ref={navRef}>
      <div className="logo">
        <div className="logo-icon">🎨</div>
        Colorfy
      </div>
      <ul className="nav-links">
        <li><a href="/#features">Features</a></li>
        <li><a href="/#templates">Templates</a></li>
        <li><a href="/#about">About Us</a></li>
      </ul>
      <button className="cta-button" onClick={goGetStarted} id="getStartedBtn">Get Started</button>
    </nav>
  );
}
