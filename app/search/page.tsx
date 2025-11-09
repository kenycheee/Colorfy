'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  collectionGroup,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import '@/app/css/search.css';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Record<string, string>>({});

  // 🔹 Ambil user login + realtime favorites
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

  // 🔹 Ambil semua palette dari setiap user (pakai collectionGroup)
  useEffect(() => {
    const unsub = onSnapshot(collectionGroup(db, 'palleteList'), (snap) => {
      const data = snap.docs.map((d) => ({
        docId: d.id,
        userId: d.ref.parent.parent?.id || null,
        ...d.data(),
      }));
      setTemplates(data);
    });

    return () => unsub();
  }, []);

  // 🔹 Ambil nama creator dari Firestore (hanya jika belum di-cache)
  useEffect(() => {
    const missingUserIds = [
      ...new Set(templates.map((t) => t.userId).filter((id) => id && !userCache[id])),
    ] as string[];

    if (missingUserIds.length === 0) return;

    missingUserIds.forEach(async (uid) => {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      const username = snap.exists() ? snap.data().username || 'Anonymous User' : 'Anonymous User';

      setUserCache((prev) => ({
        ...prev,
        [uid]: username,
      }));
    });
  }, [templates]);

  // ❤️ Like / Unlike palette
  const toggleLike = async (tpl: any) => {
    if (!userId) {
      alert('Please login first!');
      return;
    }

    const paletteId = tpl.docId;
    if (!paletteId) return;

    const favRef = doc(db, 'users', userId, 'likedPalettes', paletteId);
    const alreadyLiked = likedIds.includes(paletteId);

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

  // 🔍 Filter pencarian
  const filtered = templates.filter((t) =>
    t.title?.toLowerCase().includes(query.toLowerCase())
  );

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
            <div key={paletteId} className="template-card">
              <button
                className="like-btn"
                onClick={() => toggleLike(tpl)}
                title={isLiked ? 'Unlike' : 'Like'}
              >
                {isLiked ? (
                  <FaHeart color="#ff4b5c" size={24} />
                ) : (
                  <FaRegHeart color="#ddd" size={24} />
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
                <p className='mockup-button' />
              </div>

              <div className="color-row">
                {tpl.colors?.map((color: string, i: number) => (
                  <div
                    key={i}
                    className="color-box"
                    style={{ background: color }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
