'use client';

import { useState } from 'react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  
  const templates = [
    {
      id: 1,
      title: 'Sunset Glow',
      colors: ['#FF9A8B', '#FF6A88', '#FF99AC', '#FFD3B5'],
    },
    {
      id: 2,
      title: 'Ocean Breeze',
      colors: ['#00B4DB', '#0083B0', '#74EBD5', '#ACB6E5'],
    },
    {
      id: 3,
      title: 'Forest Calm',
      colors: ['#355C7D', '#6C5B7B', '#C06C84', '#F8B195'],
    },
    {
      id: 4,
      title: 'Pastel Dream',
      colors: ['#A1C4FD', '#C2E9FB', '#FAD0C4', '#FFD1FF'],
    },
  ];

  const filtered = templates.filter(t =>
    t.title.toLowerCase().includes(query.toLowerCase())
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
        ))}
      </div>
    </main>
  );
}
