"use client";

import { useEffect, useRef, useState } from "react";

function applySavedStyles(root: HTMLElement) {
  const raw = localStorage.getItem("goby:styles");
  if (!raw) return;
  try {
    const dict: Record<string, Record<string, string>> = JSON.parse(raw);
    for (const key of Object.keys(dict)) {
      const el = root.querySelector(`[data-edit-id="${key}"]`) as HTMLElement | null;
      if (!el) continue;
      const styles = dict[key];
      for (const [prop, val] of Object.entries(styles)) {
        (el.style as any)[prop as any] = val;
      }
    }
  } catch {}
}

function saveStyleFor(el: HTMLElement, prop: string, value: string) {
  const id = el.dataset.editId!;
  const raw = localStorage.getItem("goby:styles");
  const dict: Record<string, Record<string, string>> = raw ? JSON.parse(raw) : {};
  dict[id] = { ...(dict[id] || {}), [prop]: value };
  localStorage.setItem("goby:styles", JSON.stringify(dict));
}

function applyToTarget(el: HTMLElement, prop: string, value: string) {
  if (prop === "background") el.style.background = value;
  else if (prop === "color") el.style.color = value;
  else if (prop === "borderColor") el.style.borderColor = value;
}

function normalizeHex(x: string) { return x.startsWith("#") ? x : `#${x}`; }
function rgbToHex(rgb: string) {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb);
  if (!m) return "";
  const toHex = (n: string) => (parseInt(n,10) | 1 << 8).toString(16).slice(1);
  return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
}

// ---------- Color Editor ----------
function ColorEditor({
  target,
  onClose,
}: {
  target: HTMLElement | null;
  onClose: () => void;
}) {
  const box = target?.getBoundingClientRect();
  const [prop, setProp] = useState("background");
  const [val, setVal] = useState("#ffffff");

  useEffect(() => {
    if (!target) return;
    const cs = getComputedStyle(target);
    const current = prop === "color" ? cs.color : prop === "borderColor" ? cs.borderColor : cs.backgroundColor;
    setVal(rgbToHex(current) || "#ffffff");
  }, [target]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!target || !box) return null;
  const top = Math.max(12, box.top + window.scrollY - 10);
  const left = Math.max(12, box.left + window.scrollX + Math.min(0, box.width - 280));

  return (
    <div className="editor-pop" style={{ top, left }}>
      <div className="editor-head">
        <strong>{target.dataset.editName || "Element"}</strong>
        <button className="x" onClick={onClose}>×</button>
      </div>

      <label className="row">
        <span>Property</span>
        <select value={prop} onChange={e => setProp(e.target.value)}>
          <option value="background">background</option>
          <option value="color">color</option>
          <option value="borderColor">borderColor</option>
        </select>
      </label>

      <label className="row">
        <span>Color</span>
        <input
          type="color"
          value={val}
          onChange={e => {
            setVal(e.target.value);
            applyToTarget(target, prop, e.target.value);
          }}
        />
        <input
          className="hex"
          value={val}
          onChange={e => {
            const v = normalizeHex(e.target.value);
            setVal(v);
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) applyToTarget(target, prop, v);
          }}
        />
      </label>

      <div className="actions">
        <button
          className="btn primary"
          onClick={() => {
            applyToTarget(target, prop, val);
            saveStyleFor(target, prop, val);
            onClose();
          }}
        >Save</button>
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ---------- Main Template ----------
export default function Template() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    applySavedStyles(rootRef.current);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      if (!editMode) return;
      const el = (e.target as HTMLElement).closest('[data-edit-id]') as HTMLElement | null;
      if (el && root.contains(el)) {
        e.preventDefault();
        e.stopPropagation();
        setTarget(el);
      }
    };
    root.addEventListener("click", onClick, true);
    return () => root.removeEventListener("click", onClick, true);
  }, [editMode]);

  return (
    <div ref={rootRef} className={`page-wrap ${editMode ? "is-editing" : ""}`}>
      {/* floating edit toggle */}
      <button
        className="edit-toggle"
        onClick={() => { setEditMode(v => !v); setTarget(null); }}
        aria-pressed={editMode}
      >{editMode ? "Editing Colors: ON" : "Edit Colors"}</button>

      {editMode && <div className="hint">Click any highlighted area to recolor. Press Esc to close panel.</div>}

      {/* HEADER / NAV */}
      <header className="bar" data-edit-id="nav" data-edit-name="Top Bar">
        <div className="brand" data-edit-id="brand" data-edit-name="Brand">GOBY</div>
        <div className="actions">
          <a href="#" className="link">subscribe & save →</a>
          <a href="#cta" className="btn" data-edit-id="nav-cta" data-edit-name="Top CTA">shop now</a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="templates" data-edit-id="hero-bg" data-edit-name="Hero Background">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 data-edit-id="hero-title" data-edit-name="Hero Title">BRUSHING PERFECTED</h1>
            <p data-edit-id="hero-sub" data-edit-name="Hero Sub">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <a href="#cta" className="cta" data-edit-id="hero-cta" data-edit-name="Hero CTA">SHOP NOW</a>
          </div>

          <div className="hero-art">
            <div className="product left" data-edit-id="prod-left" data-edit-name="Product Left" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-wgq8NVyXsYY?auto=format&fit=crop&w=2000&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div className="product right" data-edit-id="prod-right" data-edit-name="Product Right" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-L4W1uX1xwlQ?auto=format&fit=crop&w=2000&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          </div>
        </div>
        <div className="hero-band" data-edit-id="hero-band" data-edit-name="Hero Blue Band">
          <div>Top Electric Toothbrush <b>ASK THE DENTIST</b></div>
          <div>Best Subscription Toothbrush <b>WIRECUTTER</b></div>
          <div>2017 Grooming Award <b>MEN'S HEALTH</b></div>
        </div>
      </section>

      {/* ICON STRIP */}
      <section className="icons" data-edit-id="icons" data-edit-name="Feature Icons">
        <div className="icon-item"><span className="dot"/> Soft, premium bristles</div>
        <div className="icon-item"><span className="dot"/> Oscillating brush head</div>
        <div className="icon-item"><span className="dot"/> Built-in timer</div>
        <div className="icon-item"><span className="dot"/> Soft-touch handle</div>
      </section>

      {/* BENEFITS */}
      <section className="benefits">
        <h2 data-edit-id="benefit-title" data-edit-name="Benefits Title">A HEALTHIER SMILE, DELIVERED.</h2>
        <p className="lead" data-edit-id="benefit-lead" data-edit-name="Benefits Lead">Rotationally oscillating brush heads are proven to clean better. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        <div className="benefit-cards">
          <article className="card" data-edit-id="card1" data-edit-name="Benefit 1">
            <div className="emoji">👍</div>
            <h3>SUBSCRIBE</h3>
            <p>and we'll automatically send you new brush heads.</p>
          </article>
          <article className="card" data-edit-id="card2" data-edit-name="Benefit 2">
            <div className="emoji">💸</div>
            <h3>SAVE $15</h3>
            <p>on your brush kit when you subscribe.</p>
          </article>
          <article className="card" data-edit-id="card3" data-edit-name="Benefit 3">
            <div className="emoji">✋</div>
            <h3>CANCEL ANYTIME</h3>
            <p>or change your subscription, no questions asked.</p>
          </article>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="testimonial">
        <h2 data-edit-id="testi-title" data-edit-name="Testimonial Title">THE BUZZ ON GOBY</h2>
        <blockquote data-edit-id="quote" data-edit-name="Quote">“The company has revamped the business of teeth-cleaning... sleek packaging.”</blockquote>
        <cite data-edit-id="cite" data-edit-name="Quote Source">— VOGUE</cite>
        <div className="navs"><button>‹</button><button>›</button></div>
        <a className="cta small" href="#">SEE REVIEWS</a>
      </section>

      {/* GIVES BACK */}
      <section className="gives">
        <div className="panel" data-edit-id="gives-panel" data-edit-name="Gives Back Panel">
          <h2>GOBY GIVES BACK</h2>
          <p>We're on a mission to make great oral care accessible to all. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
        </div>
        <div className="gives-img" data-edit-id="gives-img" data-edit-name="Gives Image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-0P5xJ9AR0eE?auto=format&fit=crop&w=2200&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      </section>

      {/* GRID / #GOBYGRAM */}
      <section className="gram">
        <h2>#GOBYGRAM</h2>
        <p>See who's already had their routine electrified.</p>
        <div className="grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="ph" data-edit-id={`gram-${i}`} data-edit-name={`Gallery ${i+1}`} />
          ))}
        </div>
      </section>

      {/* GUARANTEE CTA */}
      <section className="guarantee" data-edit-id="guarantee" data-edit-name="Guarantee Block">
        <h2>UNLIMITED COMPLIMENTS. GUARANTEED.</h2>
        <p>If you don’t love your Goby within 60 days, we’ll take it back for a full refund. Lorem ipsum dolor sit amet.</p>
        <a href="#" className="cta ghost" data-edit-id="guarantee-cta" data-edit-name="Guarantee CTA">GET YOUR GOBY</a>
      </section>

      {/* Color editor popover */}
      {editMode && <ColorEditor target={target} onClose={() => setTarget(null)} />}
    </div>
  );
}
