'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

import Modal from '@/components/Modal';
import '@/app/css/search.css';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Record<string, string>>({});
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<any | null>(null);

  const openModal = (tpl: any) => {
    setSelectedPalette(tpl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPalette(null);
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        const favRef = collection(db, 'users', user.uid, 'likedPalettes');

        const unsubFav = onSnapshot(favRef, (snap) => {
          setLikedIds(snap.docs.map((d) => d.id));
        });

        return () => unsubFav();
      } else {
        setUserId(null);
        setLikedIds([]);
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'palleteList'), (snap) => {
      const data = snap.docs.map((d) => ({
        docId: d.id,
        ...d.data(),
      }));
      setTemplates(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const missingIds = [
      ...new Set(
        templates
          .map((t) => t.userId)
          .filter((id) => id && !userCache[id])
      ),
    ] as string[];

    if (missingIds.length === 0) return;

    missingIds.forEach(async (uid) => {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);

      const username = snap.exists()
        ? snap.data().username || 'Anonymous User'
        : 'Anonymous User';

      setUserCache((prev) => ({ ...prev, [uid]: username }));
    });
  }, [templates]);

  const toggleLike = async (tpl: any) => {
    if (!userId) return alert('Please login first!');

    const paletteId = tpl.docId;
    const alreadyLiked = likedIds.includes(paletteId);
    const favRef = doc(db, 'users', userId, 'likedPalettes', paletteId);

    try {
      if (alreadyLiked) {
        await deleteDoc(favRef);
      } else {
        await setDoc(favRef, {
          title: tpl.title || '',
          description: tpl.description || '',
          categories: tpl.categories || 'Uncategorized',
          colors: tpl.colors || [],
          userId: tpl.userId || '',
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error('🔥 Error toggling like:', err);
    }
  };

  const filtered = templates.filter((t) =>
    t.title?.toLowerCase().includes(query.toLowerCase())
  );

  const handleCopyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(null), 1500);
    } catch (err) {
      console.error('Failed to Copy:', err);
    }
  };

  return (
    <main className="search-page">
      <div className="search-container">
        <input
          type="text"
          className="search-bar"
          placeholder="🔍 Search color templates..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="template-grid">
        {filtered.map((tpl) => {
          const paletteId = tpl.docId;
          const isLiked = likedIds.includes(paletteId);
          const creatorName = userCache[tpl.userId] || 'Loading...';

          return (
            <div
              key={paletteId}
              className="template-card"
              onClick={() => openModal(tpl)}
              style={{ cursor: 'pointer' }}
            >
              <button
                className="like-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(tpl);
                }}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                {isLiked ? (
                  <FaHeart size={22} color="#ff4b5c" />
                ) : (
                  <FaRegHeart size={22} color="#ccc" />
                )}
              </button>

              <div className="mockup-search">
                <p className="mockup-title">{tpl.title || 'Untitled Palette'}</p>

                {tpl.description && (
                  <p className="mockup-description">{tpl.description}</p>
                )}

                {tpl.userId && (
                  <p className="mockup-creator">By {creatorName}</p>
                )}
              </div>

              <div
                className="mockup-button-search"
                style={{
                  background:
                    tpl.colors && tpl.colors.length > 1
                      ? `linear-gradient(90deg, ${tpl.colors.join(',')})`
                      : tpl.colors?.[0] || '#888',
                }}
              ></div>

              <div className="color-row">
                {tpl.colors?.map((color: string, i: number) => (
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
                    title={`Click to Copy ${color}`}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {copiedColor && <div className="copy-notif">✅ {copiedColor} copied!</div>}
      </div>

      {/* ======================= MODAL ======================= */}
      <Modal open={showModal} onClose={closeModal} palette={selectedPalette} />
    </main>
  );
}
