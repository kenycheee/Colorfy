'use client';

import { useEffect, useState } from 'react';
import BackHome from '@/components/BackHome';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

interface ColorTemplate {
  id: string;
  title: string;
  colors: string[];
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ColorTemplate[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
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

      // 🔹 dummy data templates — nanti diganti ambil dari Firestore
      const dummyTemplates: ColorTemplate[] = [
        {
          id: '1',
          title: 'Sunset Glow',
          colors: ['#FF9A8B', '#FF6A88', '#FF99AC', '#FFD3B5'],
        },
        {
          id: '2',
          title: 'Ocean Breeze',
          colors: ['#00B4DB', '#0083B0', '#74EBD5', '#ACB6E5'],
        },
        {
          id: '3',
          title: 'Forest Calm',
          colors: ['#355C7D', '#6C5B7B', '#C06C84', '#F8B195'],
        },
      ];
      setTemplates(dummyTemplates);
      setLoading(false);
    });
    

    return () => unsubscribe();
  }, [router]);

  // ✨ fungsi copy warna ke clipboard
  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 1500);
    } catch (err) {
      console.error('Gagal menyalin warna:', err);
    }
  };
  if (loading) return <p>Loading...</p>;

  return (
    <main className="auth-section" style={{ textAlign: 'center', color: 'white' }}>
      <BackHome />

      <div
        className="auth-card"
        style={{
          maxWidth: '400px',
          margin: '0 auto',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '20px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        }}
      >
        {/* FOTO PROFIL */}
        <div className="profile-avatar">
          <img
            src={
              userData?.photoURL ||
              'https://cdn-icons-png.flaticon.com/512/149/149071.png'
            }
            alt="Profile"
          />
        </div>

        {/* NAMA DAN EMAIL */}
        <h1 className="auth-title" style={{ fontSize: '1.5rem', marginBottom: '5px' }}>
          {userData?.username || 'Anonymous User'}
        </h1>
        <p className="auth-subtitle" style={{ marginBottom: '20px', color: '#bbb' }}>
          {userData?.email}
        </p>

        {/* DETAIL INFORMASI */}
        <div className="profile-info">
          <p>
            <strong>Bio:</strong> {userData?.bio || 'Belum ada bio.'}
          </p>
          <p>
            <strong>Nomor HP:</strong> {userData?.phone || 'Belum ditambahkan.'}
          </p>
          <p>
            <strong>Bergabung sejak:</strong>{' '}
            {userData?.createdAt
              ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString()
              : 'Tidak diketahui'}
          </p>
        </div>

        {/* BAGIAN TEMPLATE WARNA */}
        <div className="profile-templates">
          <h2>🎨 Templates</h2>
          {templates.length > 0 ? (
            <div className="template-list">
              {templates.map((tpl) => (
                <div key={tpl.id} className="template-item">
                  <p className="template-title">{tpl.title}</p>
                  <div className="color-row">
                    {tpl.colors.map((c, idx) => (
                      <div
                        key={idx}
                        className={`color-box ${
                          copiedColor === c ? 'copied' : ''
                        }`}
                        style={{ background: c }}
                        onClick={() => handleCopyColor(c)}
                        title={`Klik untuk copy ${c}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-template">Kamu belum membuat template warna.</p>
          )}
        </div>

        {/* NOTIF COPY */}
        {copiedColor && (
          <div className="copy-notif">✅ {copiedColor} copied!</div>
        )}

        {/* TOMBOL AKSI */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          <button
            className="btn-primary"
            onClick={() => router.push('/editprofile')}
            style={{
              background: '#007bff',
              border: 'none',
              padding: '10px',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Edit Profile
          </button>

          <button
            className="btn-primary"
            onClick={() => {
              auth.signOut().then(() => router.push('/login'));
            }}
            style={{
              background: '#dc3545',
              border: 'none',
              padding: '10px',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}
