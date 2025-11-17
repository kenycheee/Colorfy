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
import { FaHeart } from 'react-icons/fa';

import Modal from '@/components/Modal';
import '@/app/css/profile.css';

interface ColorTemplate {
  id: string;
  title?: string;
  description?: string;
  colors: string[];
  userId?: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ColorTemplate[]>([]);
  const [likedTemplates, setLikedTemplates] = useState<ColorTemplate[]>([]);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'post' | 'like'>('post');
  const router = useRouter();

  // ==========================
  // 🔥 MODAL STATE
  // ==========================
  const [showModal, setShowModal] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<ColorTemplate | null>(null);

  const openModal = (tpl: ColorTemplate) => {
    setSelectedPalette(tpl);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedPalette(null);
    setShowModal(false);
  };

  // ==========================
  // Fetch user + user's palettes
  // ==========================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        setUserData(
          userSnap.exists()
            ? userSnap.data()
            : { username: 'Anonymous User', email: user.email }
        );

        const palleteRef = collection(userRef, 'palleteList');
        const palSnap = await getDocs(palleteRef);

        const userPalettes: ColorTemplate[] = palSnap.docs.map((d) => ({
          id: d.id,
          title: d.data().title || '',
          description: d.data().description || '',
          colors: d.data().colors || [],
          userId: user.uid,
        }));

        setTemplates(userPalettes);
      } catch (err) {
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  // Fetch liked when tab active
  useEffect(() => {
    if (activeTab !== 'like') return;

    const fetchLiked = async () => {
      if (!auth.currentUser) return;

      try {
        const likedRef = collection(
          db,
          'users',
          auth.currentUser.uid,
          'likedPalettes'
        );
        const snap = await getDocs(likedRef);

        const liked: ColorTemplate[] = snap.docs.map((d) => ({
          id: d.id,
          title: d.data().title || '',
          description: d.data().description || '',
          colors: d.data().colors || [],
          userId: d.data().userId || '',
        }));

        setLikedTemplates(liked);
      } catch (err) {
        console.error('Error fetching liked templates:', err);
      }
    };

    fetchLiked();
  }, [activeTab]);

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

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <main className="profile-page">
      <div className="profile-layout">
        {/* SIDEBAR */}
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

          <h2 className="profile-username">
            {userData?.username || 'Anonymous User'}
          </h2>

          <p className="user-email">{userData?.email}</p>
          <p className="user-bio">{userData?.bio || 'No bio provided.'}</p>

          <div className="user-meta">
            <p>
              <strong>Joined:</strong>{' '}
              {userData?.createdAt
                ? new Date(userData.createdAt).toLocaleDateString()
                : 'Unknown'}
            </p>
          </div>

          <div className="sidebar-actions">
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
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <section className="profile-content">
          {/* Tabs */}
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

          {/* POST TAB */}
          {activeTab === 'post' && (
            <div className="profile-templates">
              <h2 className="template-title-section">🎨 Your Templates</h2>

              <div className="template-grid">
                {templates.length > 0 ? (
                  templates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="template-card"
                      onClick={() => openModal(tpl)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="mockup-search">
                        <p className="mockup-title">
                          {tpl.title || 'Untitled Palette'}
                        </p>
                        {tpl.description && (
                          <p className="mockup-description">
                            {tpl.description}
                          </p>
                        )}

                        <p className="mockup-creator">
                          By {userData?.username || 'You'}
                        </p>

                        <div
                          className="mockup-button-search"
                          style={{
                            background:
                              tpl.colors.length > 1
                                ? `linear-gradient(90deg, ${tpl.colors.join(
                                    ','
                                  )})`
                                : tpl.colors[0] || '#888',
                          }}
                        ></div>
                      </div>

                      <div className="color-row">
                        {tpl.colors.map((color, i) => (
                          <div
                            key={i}
                            className={`color-box ${
                              copiedColor === color ? 'copied' : ''
                            }`}
                            style={{ background: color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyColor(color);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No palettes yet.</p>
                )}
              </div>
            </div>
          )}

          {/* LIKE TAB */}
          {activeTab === 'like' && (
            <div className="profile-liked">
              <h2 className="template-title-section">❤️ Liked Templates</h2>

              <div className="template-grid">
                {likedTemplates.length > 0 ? (
                  likedTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="template-card"
                      onClick={() => openModal(tpl)}
                      style={{ cursor: 'pointer' }}
                    >
                      <button
                        className="like-btn liked"
                        onClick={(e) => {
                          e.stopPropagation();
                          unlikeFromProfile(tpl.id);
                        }}
                      >
                        <FaHeart color="#ff4b5c" />
                      </button>

                      <div className="mockup-search">
                        <p className="mockup-title">
                          {tpl.title || 'Untitled Palette'}
                        </p>

                        {tpl.description && (
                          <p className="mockup-description">
                            {tpl.description}
                          </p>
                        )}

                        <p className="mockup-creator">
                          By {tpl.userId || 'Unknown'}
                        </p>

                        <div
                          className="mockup-button-search"
                          style={{
                            background:
                              tpl.colors.length > 1
                                ? `linear-gradient(90deg, ${tpl.colors.join(
                                    ','
                                  )})`
                                : tpl.colors[0] || '#888',
                          }}
                        ></div>
                      </div>

                      <div className="color-row">
                        {tpl.colors.map((color, i) => (
                          <div
                            key={i}
                            className={`color-box ${
                              copiedColor === color ? 'copied' : ''
                            }`}
                            style={{ background: color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyColor(color);
                            }}
                          />
                        ))}
                      </div>
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

      {/* MODAL */}
      <Modal open={showModal} onClose={closeModal} palette={selectedPalette} />
    </main>
  );
}
