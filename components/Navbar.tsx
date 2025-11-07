'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Navbar() {
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const HIDE_ON = ['/login', '/register', '/editprofile', '/templates'];

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onScroll = () => {
      const y = window.scrollY;
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

  // Cek login realtime
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (HIDE_ON.includes(pathname)) return null;

  return (
    <nav className="nav" ref={navRef}>
      <div className="logo">
        <div className="logo-icon">🎨</div>
        Colorfy
      </div>

      <ul className="nav-links">
        <li><Link href="/">Home</Link></li>
        <li><Link href="/search">Search</Link></li>
        <li>
          <Link
            href={isLoggedIn ? '/profile' : '/login'}
            className="text-slate-400 hover:text-cyan-300 transition-colors duration-200"
          >
            Profile
          </Link>
        </li>
      </ul>
    </nav>
  );
}