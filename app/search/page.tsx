'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    const fetchPalettes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'palleteList'));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching palettes:', error);
      }
    };

    fetchPalettes();
  }, []);

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
        {filtered.map((tpl) => (
          <div key={tpl.id} className="template-card">
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
        ))}
      </div>
    </main>
  );
}
