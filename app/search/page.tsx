'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
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

  // ✅ Ambil user login + realtime favorites
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);

        const favRef = collection(db, 'users', user.uid, 'likedPalettes');
        const unsubFav = onSnapshot(favRef, (snap) => {
          setLikedIds(snap.docs.map((d) => d.id));
        });

        return () => unsubFav(); // cleanup listener
      } else {
        setUserId(null);
        setLikedIds([]);
      }
    });

    return () => unsubAuth();
  }, []);

  // ✅ Ambil semua palette dari global palleteList (realtime)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'palleteList'), (snap) => {
      const data = snap.docs.map((d) => {
        const docId = d.id; // selalu string
        const docData = d.data();
        return { docId, ...docData };
      });
      setTemplates(data);
    });

    return () => unsub();
  }, []);

  // ❤ Like / Unlike palette (dengan fix tipe aman)
  const toggleLike = async (tpl: any) => {
    if (!userId) {
      alert('Please login first!');
      return;
    }

    // pastikan ID-nya valid string
    const paletteId = typeof tpl.docId === 'string' ? tpl.docId : String(tpl.id || '').trim();
    if (!paletteId) {
      console.error('❌ Invalid paletteId:', tpl);
      return;
    }

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
          const paletteId =
            typeof tpl.docId === 'string' ? tpl.docId : String(tpl.id || '').trim();
          const isLiked = likedIds.includes(paletteId);

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

              <div className="mockup">
                <div className="mockup-bar short"></div>
                <div className="mockup-bar long"></div>
                <div className="mockup-button"></div>
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

              <p className="template-title">{tpl.title}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}