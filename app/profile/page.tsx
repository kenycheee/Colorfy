'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '@/components/Navbar';

interface ColorTemplate {
  id: string;
  title: string;
  description?: string;
  colors: string[];
  categories?: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [templates, setTemplates] = useState<ColorTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'post' | 'like'>('post');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }

        const palCol = collection(db, `users/${user.uid}/palleteList`);
        const palSnap = await getDocs(palCol);
        const list: ColorTemplate[] = [];
        palSnap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            title: data.title || 'Untitled',
            description: data.description || '',
            colors: data.colors || [],
            categories: data.categories || 'Uncategorized',
            createdAt: data.createdAt || '',
          });
        });

        setTemplates(list);
      } catch (err) {
        console.error('Error loading profile:', err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

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
    <>
      {/* === FIXED NAVBAR === */}
      <Navbar />

      {/* === PROFILE CONTENT === */}
      <main className="profile-page">
        <div className="profile-layout">
          {/* === LEFT SIDE === */}
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
                  ? new Date(userData.createdAt).toLocaleDateString()
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

          {/* === RIGHT SIDE === */}
          <section className="profile-content fade-in">
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

            <div className="profile-templates">
              {activeTab === 'post' ? (
                <>
                  <h2 className="template-title-section">🎨 Your Palettes</h2>
                  {templates.length > 0 ? (
                    <div className="template-scroll vertical-layout">
                      {templates.map((tpl) => (
                        <div key={tpl.id} className="template-card glass-card">
                          <p className="template-title">{tpl.title}</p>
                          {tpl.description && (
                            <p className="template-desc">{tpl.description}</p>
                          )}
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
                          <p className="template-category">
                            📂 {tpl.categories}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-template">
                      Kamu belum membuat palette warna.
                    </p>
                  )}
                </>
              ) : (
                <p className="no-template">
                  Fitur "Like" belum tersedia di database.
                </p>
              )}
            </div>

            {copiedColor && (
              <div className="copy-notif">✅ {copiedColor} copied!</div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
