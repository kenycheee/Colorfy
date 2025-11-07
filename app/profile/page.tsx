'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ColorTemplate[]>([]);
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
        router.push('/login');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());

        // Ambil semua palette user dari subcollection `palleteList`
        const palleteRef = collection(userRef, 'palleteList');
        const palleteSnap = await getDocs(palleteRef);

        const userPalettes: ColorTemplate[] = palleteSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ColorTemplate, 'id'>),
        }));

        setTemplates(userPalettes);
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
      console.error('Failed to Copy:', err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <main className="profile-page">
      <div className="profile-layout">
        {/* === SIDEBAR === */}
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
          <p className="user-bio">{userData?.bio || 'No Bio.'}</p>

          <div className="user-meta">
            <p>
              <strong>Joined:</strong>{' '}
              {userData?.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : 'Unknown'}
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

        {/* === MAIN CONTENT === */}
        <section className="profile-content fade-in">
          <div className="tab-header">
            <button
              className={activeTab === 'post' ? 'active' : ''}
              onClick={() => setActiveTab('post')}
            >
              Post
            </button>
          </div>

          <div className="profile-templates">
            <h2 className="template-title-section">🎨 Your Templates</h2>

            <div className="template-grid">
              {templates.length > 0 ? (
                templates.map((tpl) => (
                  <div key={tpl.id} className="template-card">
                    <div className="mockup">
                      <div className="mockup-bar short"></div>
                      <div className="mockup-bar long"></div>
                      <div className="mockup-button"></div>
                    </div>

                    <div className="color-row">
                      {tpl.colors.map((color, i) => (
                        <div
                          key={i}
                          className={`color-box ${
                            copiedColor === color ? 'copied' : ''
                          }`}
                          style={{ background: color }}
                          onClick={() => handleCopyColor(color)}
                          title={`Click to Copy ${color}`}
                        />
                      ))}
                    </div>

                    <p className="template-title">{tpl.title}</p>
                  </div>
                ))
              ) : (
                <p>No palettes yet.</p>
              )}
            </div>
          </div>

          {copiedColor && (
            <div className="copy-notif">✅ {copiedColor} copied!</div>
          )}
        </section>
      </div>
    </main>
  );
}
