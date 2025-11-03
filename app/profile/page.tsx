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
  const [templates, setTemplates] = useState<ColorTemplate[]>([]);
  const [likedTemplates, setLikedTemplates] = useState<ColorTemplate[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'post' | 'like'>('post');
  const router = useRouter();

  interface ColorTemplate {
    id: string;
    title: string;
    colors: string[];
  }

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

      const likedDummyTemplates: ColorTemplate[] = [
        {
          id: '4',
          title: 'Candy Pop',
          colors: ['#FDCB82', '#F48FB1', '#F06292', '#CE93D8'],
        },
        {
          id: '5',
          title: 'Midnight Blue',
          colors: ['#232526', '#414345', '#2C3E50', '#4CA1AF'],
        },
      ];

      setTemplates(dummyTemplates);
      setLikedTemplates(likedDummyTemplates);
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
    <main className="profile-page">
      <BackHome />

      {/* === CONTENT WRAPPER === */}
      <div className="profile-layout">
        {/* === LEFT SIDE: PROFILE INFO === */}
        <aside className="profile-sidebar glass-card">
          <div className="profile-avatar-large neon-border">
            <img
              src={
                userData?.photoURL ||
                'https://cdn-icons-png.flaticon.com/512/149/149071.png'
              }
              alt="Profile"
            />
          </div>

          <h2>{userData?.username || 'Anonymous User'}</h2>
          <p className="user-email">{userData?.email}</p>

          <p className="user-bio">
            {userData?.bio || 'Belum ada bio yang ditulis.'}
          </p>

          <div className="user-meta">
            <p>
              <strong>Bergabung:</strong>{' '}
              {userData?.createdAt
                ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString()
                : 'Tidak diketahui'}
            </p>
          </div>

          <button
            className="btn-edit"
            onClick={() => router.push('/editprofile')}
          >
            Edit Profile
          </button>

          <button
            className="btn-logout"
            onClick={() => {
              auth.signOut().then(() => router.push('/login'));
            }}
          >
            Logout
          </button>
        </aside>

        {/* === RIGHT SIDE: CONTENT === */}
        <section className="profile-content fade-in">
          {/* === TAB HEADER (POST / LIKE) === */}
          <div className="tab-header">
            <button
              className={activeTab === 'post' ? 'active' : ''}
              onClick={() => setActiveTab('post')}
            >
              Post
            </button>
            <button
              className={activeTab === 'like' ? 'active' : ''}
              onClick={() => setActiveTab('like')}
            >
              Like
            </button>
          </div>

          {/* === TAB CONTENT === */}
          <div className="profile-templates">
            {activeTab === 'post' ? (
              <>
                <h2 className="template-title-section">🎨 Your Templates</h2>
                {templates.length > 0 ? (
                  <div className="template-scroll vertical-layout">
                    {templates.map((tpl) => (
                      <div key={tpl.id} className="template-card glass-card">
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
              </>
            ) : (
              <>
                <h2 className="template-title-section">⭐ Favorite Templates</h2>
                {likedTemplates.length > 0 ? (
                  <div className="template-scroll vertical-layout">
                    {likedTemplates.map((tpl) => (
                      <div key={tpl.id} className="template-card glass-card">
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
                  <p className="no-template">
                    Kamu belum memberi like pada template mana pun.
                  </p>
                )}
              </>
            )}
          </div>

          {/* NOTIF COPY */}
          {copiedColor && (
            <div className="copy-notif">✅ {copiedColor} copied!</div>
          )}
        </section>
      </div>
    </main>
  );
}
