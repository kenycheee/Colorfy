'use client';

import { useEffect, useState } from 'react';
import BackHome from '@/components/BackHome';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // 🔒 kalau belum login → redirect ke /login
        router.push('/login');
        return;
      }

      // ✅ kalau sudah login → ambil data user dari Firestore
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) setUserData(snap.data());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <p>Loading...</p>;

  return (
    <main className="auth-section" style={{ textAlign: 'center', color: 'white' }}>
      <BackHome />
      <div className="auth-card">
        <h1 className="auth-title">
          Welcome, <span className="grad">{userData?.username}</span>
        </h1>
        <p className="auth-subtitle">{userData?.email}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
          <button
            className="btn-primary"
            onClick={() => {
              auth.signOut().then(() => router.push('/login'));
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
