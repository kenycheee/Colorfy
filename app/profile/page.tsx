'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { FaHeart } from 'react-icons/fa'; // ❤️ icon filled
import '@/app/css/profile.css';

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
        router.push('/login');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());

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

  // Ambil liked templates ketika tab like aktif
  useEffect(() => {
    if (activeTab !== 'like') return;
    if (!auth.currentUser) return;

    const fetchLiked = async () => {
      try {
        const likedRef = collection(
          db,
          'users',
          auth.currentUser!.uid,
          'likedPalettes'
        );
        const likedSnap = await getDocs(likedRef);
        const likedData: ColorTemplate[] = likedSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ColorTemplate, 'id'>),
        }));
        setLikedTemplates(likedData);
      } catch (err) {
        console.error('Error fetching liked templates:', err);
      }
    };

    fetchLiked();
  }, [activeTab, userData]);

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 1500);
    } catch (err) {
      console.error('Failed to Copy:', err);
    }
  };

  const unlikeFromProfile = async (tplId: string) => {
    if (!auth.currentUser) {
      alert('Please login to modify likes.');
      return;
    }
    try {
      await deleteDoc(
        doc(db, 'users', auth.currentUser.uid, 'likedPalettes', tplId)
      );
      setLikedTemplates((prev) => prev.filter((t) => t.id !== tplId));
    } catch (err) {
      console.error('Error unliking from profile:', err);
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
          {/* === TAB BUTTONS === */}
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

          {/* === POST TAB === */}
          {activeTab === 'post' && (
            <div className="profile-templates">
              <h2 className="template-title-section">🎨 Your Templates</h2>

              <div className="template-grid">
                {templates.length > 0 ? (
                  templates.map((tpl) => (
                    <div key={tpl.id} className="template-card">
                      <div className="mockup-search">
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
          )}

          {/* === LIKE TAB === */}
          {activeTab === 'like' && (
            <div className="profile-liked">
              <h2 className="template-title-section">❤️ Liked Templates</h2>

              <div className="template-grid">
                {likedTemplates.length > 0 ? (
                  likedTemplates.map((tpl) => (
                    <div key={tpl.id} className="template-card">
                      <button
                        className="like-btn liked"
                        onClick={() => unlikeFromProfile(tpl.id)}
                        title="Unlike"
                        aria-label="Unlike"
                      >
                        <FaHeart color="#ff4b5c" size={22} />
                      </button>

                      <div className="mockup">
                        <div className="mockup-bar short"></div>
                        <div className="mockup-bar long"></div>
                        <div className="mockup-button"></div>
                      </div>

                      <div className="color-row">
                        {tpl.colors.map((color, i) => (
                          <div
                            key={i}
                            className="color-box"
                            style={{ background: color }}
                          />
                        ))}
                      </div>

                      <p className="template-title">{tpl.title}</p>
                    </div>
                  ))
                ) : (
                  <p>You haven't liked any templates yet.</p>
                )}
              </div>
            </div>
          )}

          {copiedColor && (
            <div className="copy-notif">✅ {copiedColor} copied!</div>
          )}
        </section>
      </div>
    </main>
  );
}
