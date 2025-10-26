"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Italian-food “Goby-style” landing page
 * - All text: lorem ipsum
 * - Edit Colors Mode A: toggle, lalu klik elemen ber-outline untuk recolor
 * - Simpan perubahan per-element di localStorage (goby:styles)
 * - Gambar HD/2K/4K via Unsplash
 */

type CSSProp = "background" | "color" | "borderColor";

/* ---------- persistence helpers ---------- */
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
        (el.style as any)[prop] = val;
      }
    }
  } catch {}
}
function saveStyleFor(el: HTMLElement, prop: CSSProp, value: string) {
  const id = el.dataset.editId!;
  const raw = localStorage.getItem("goby:styles");
  const dict: Record<string, Record<string, string>> = raw ? JSON.parse(raw) : {};
  dict[id] = { ...(dict[id] || {}), [prop]: value };
  localStorage.setItem("goby:styles", JSON.stringify(dict));
}

/* ---------- tiny utils ---------- */
function applyToTarget(el: HTMLElement, prop: CSSProp, value: string) {
  if (prop === "background") el.style.background = value;
  else if (prop === "color") el.style.color = value;
  else if (prop === "borderColor") el.style.borderColor = value;
}
function normalizeHex(x: string) { return x.startsWith("#") ? x : `#${x}`; }
function rgbToHex(rgb: string) {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb);
  if (!m) return "";
  const toHex = (n: string) => (parseInt(n,10) | (1<<8)).toString(16).slice(1);
  return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
}

/* ---------- color editor popover ---------- */
function ColorEditor({
  target,
  onClose,
}: { target: HTMLElement | null; onClose: () => void }) {
  const box = target?.getBoundingClientRect();
  const [prop, setProp] = useState<CSSProp>("background");
  const [val, setVal] = useState("#ffffff");

  useEffect(() => {
    if (!target) return;
    const cs = getComputedStyle(target);
    const current =
      prop === "color" ? cs.color : prop === "borderColor" ? cs.borderColor : cs.backgroundColor;
    setVal(rgbToHex(current) || "#ffffff");
  }, [target, prop]);

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
        <select value={prop} onChange={e => setProp(e.target.value as CSSProp)}>
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
            if (target) applyToTarget(target, prop, e.target.value);
          }}
        />
        <input
          className="hex"
          value={val}
          onChange={e => {
            const v = normalizeHex(e.target.value);
            setVal(v);
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v) && target) applyToTarget(target, prop, v);
          }}
        />
      </label>

      <div className="actions">
        <button
          className="btn primary"
          onClick={() => { if (target) saveStyleFor(target, prop, val); onClose(); }}
        >Save</button>
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* ---------- main page ---------- */
export default function GobyFoodPage() {
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
      const el = (e.target as HTMLElement).closest("[data-edit-id]") as HTMLElement | null;
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
    <div ref={rootRef} className={`food-page ${editMode ? "is-editing" : ""}`}>
      {/* floating toggle */}
      <button
        className="edit-toggle"
        onClick={() => { setEditMode(v => !v); setTarget(null); }}
        aria-pressed={editMode}
      >
        {editMode ? "Editing Colors: ON" : "Edit Colors"}
      </button>
      {editMode && <div className="hint">Klik area ber-outline untuk ganti warna. Esc untuk tutup.</div>}

      {/* header */}
      <header className="bar" data-edit-id="nav" data-edit-name="Top Bar">
        <div className="brand" data-edit-id="brand" data-edit-name="Brand">TRATTORIA</div>
        <div className="actions">
          <a href="#menu" className="link">menu</a>
          <a href="#cta" className="btn" data-edit-id="nav-cta" data-edit-name="Top CTA">book now</a>
        </div>
      </header>

      {/* hero */}
      <section className="hero" id="templates" data-edit-id="hero-bg" data-edit-name="Hero Background">
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 data-edit-id="hero-title" data-edit-name="Hero Title">AUTHENTIC ITALIAN. PERFECTED.</h1>
            <p data-edit-id="hero-sub" data-edit-name="Hero Sub">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec id elit non mi porta gravida at eget metus.
            </p>
            <a href="#cta" className="cta" data-edit-id="hero-cta" data-edit-name="Hero CTA">RESERVE A TABLE</a>
          </div>

          <div className="hero-art">
            <div
              className="product left"
              data-edit-id="prod-left"
              data-edit-name="Dish Left"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?auto=format&fit=crop&w=2200&q=80)" /* pasta */
              }}
            />
            <div
              className="product right"
              data-edit-id="prod-right"
              data-edit-name="Dish Right"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1546549039-9ef1c7a7b21f?auto=format&fit=crop&w=2200&q=80)" /* pizza */
              }}
            />
          </div>
        </div>

        <div className="hero-band" data-edit-id="hero-band" data-edit-name="Hero Blue Band">
          <div>Best Handmade Pasta <b>ROMA WEEKLY</b></div>
          <div>Top Neapolitan Pizza <b>GUIDA ITALIANA</b></div>
          <div>Chef’s Choice 2025 <b>FOOD CRITICS</b></div>
        </div>
      </section>

      {/* icon strip */}
      <section className="icons" data-edit-id="icons" data-edit-name="Feature Icons">
        <div className="icon-item"><span className="dot" /> fresh handmade pasta</div>
        <div className="icon-item"><span className="dot" /> wood-fired oven</div>
        <div className="icon-item"><span className="dot" /> seasonal ingredients</div>
        <div className="icon-item"><span className="dot" /> italian desserts</div>
      </section>

      {/* benefits */}
      <section className="benefits">
        <h2 data-edit-id="benefit-title" data-edit-name="Benefits Title">A HEALTHIER APPETITE, DELIVERED.</h2>
        <p className="lead" data-edit-id="benefit-lead" data-edit-name="Benefits Lead">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras mattis consectetur purus sit amet fermentum.
        </p>
        <div className="benefit-cards">
          <article className="card" data-edit-id="card1" data-edit-name="Benefit 1">
            <div className="emoji">🍝</div>
            <h3>SUBSCRIBE</h3>
            <p>and we’ll send you fresh pasta kits weekly.</p>
          </article>
          <article className="card" data-edit-id="card2" data-edit-name="Benefit 2">
            <div className="emoji">💸</div>
            <h3>SAVE</h3>
            <p>enjoy member pricing on our best sellers.</p>
          </article>
          <article className="card" data-edit-id="card3" data-edit-name="Benefit 3">
            <div className="emoji">✋</div>
            <h3>CANCEL ANYTIME</h3>
            <p>pause or cancel anytime, no questions asked.</p>
          </article>
        </div>
      </section>

      {/* testimonial */}
      <section className="testimonial">
        <h2 data-edit-id="testi-title" data-edit-name="Testimonial Title">THE BUZZ ON TRATTORIA</h2>
        <blockquote data-edit-id="quote" data-edit-name="Quote">
          “Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sagittis lacus vel augue laoreet.”
        </blockquote>
        <cite data-edit-id="cite" data-edit-name="Quote Source">— VOGUE</cite>
        <div className="navs"><button>‹</button><button>›</button></div>
        <a className="cta small" href="#">SEE REVIEWS</a>
      </section>

      {/* gives back */}
      <section className="gives">
        <div className="panel" data-edit-id="gives-panel" data-edit-name="Gives Back Panel">
          <h2>TRATTORIA GIVES BACK</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis.
            Etiam porta sem malesuada magna mollis euismod.
          </p>
        </div>
        <div
          className="gives-img"
          data-edit-id="gives-img"
          data-edit-name="Gives Image"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=2400&q=80)"
          }}
        />
      </section>

      {/* gallery */}
      <section className="gram" id="menu">
        <h2>#TRATTORIAGRAM</h2>
        <p>See who’s already shared their perfect plates.</p>
        <div className="grid">
          {[
            "https://images.unsplash.com/photo-1541782814455-3a8e5f822d72?auto=format&fit=crop&w=1600&q=80", // tiramisu
            "https://images.unsplash.com/photo-1543352634-8730b13c05ea?auto=format&fit=crop&w=1600&q=80", // bruschetta
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80", // table spread
            "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1600&q=80", // pizza slice
            "https://images.unsplash.com/photo-1512058564366-9a4316dc9f54?auto=format&fit=crop&w=1600&q=80", // pasta twirl
            "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=1600&q=80", // caprese
            "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?auto=format&fit=crop&w=1600&q=80", // pasta again
            "https://images.unsplash.com/photo-1546549039-9ef1c7a7b21f?auto=format&fit=crop&w=1600&q=80"  // pizza
          ].map((src, i) => (
            <div
              key={i}
              className="ph"
              data-edit-id={`gram-${i}`}
              data-edit-name={`Gallery ${i + 1}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
      </section>

      {/* guarantee */}
      <section className="guarantee" data-edit-id="guarantee" data-edit-name="Guarantee Block" id="cta">
        <h2>UNLIMITED COMPLIMENTS. GUARANTEED.</h2>
        <p>If you don’t love your order within 60 days, we’ll take it back for a full refund. Lorem ipsum dolor sit amet.</p>
        <a href="#" className="cta ghost" data-edit-id="guarantee-cta" data-edit-name="Guarantee CTA">GET YOUR FEAST</a>
      </section>

      {/* color editor */}
      {editMode && <ColorEditor target={target} onClose={() => setTarget(null)} />}

      {/* --------------- styled-jsx --------------- */}
      <style jsx>{`
        :global(html) { scroll-behavior: smooth; }
        .food-page.is-editing [data-edit-id] { outline: 2px dashed rgba(6,182,212,.85); outline-offset: 2px; cursor: crosshair; }

        .edit-toggle {
          position: fixed; right: 16px; bottom: 16px; z-index: 10000;
          padding: .7rem 1rem; border-radius: 999px; border: 0;
          font-weight: 900; background: linear-gradient(135deg, #06B6D4, #8B5CF6);
          color: #fff; box-shadow: 0 15px 40px rgba(0,0,0,.3); cursor: pointer;
        }
        .hint {
          position: fixed; right: 16px; bottom: 64px; z-index: 10000;
          background: #0b0d1c; color: #fff; padding: .5rem .75rem;
          border-radius: 8px; border: 1px solid rgba(255,255,255,.15);
        }

        .editor-pop {
          position: absolute; z-index: 9999; width: 260px;
          background: #0b0d1c; color: #fff; border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.4); padding: .75rem;
        }
        .editor-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: .5rem; }
        .x { background: transparent; border: 0; color: #fff; font-size: 1.2rem; cursor: pointer; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem; align-items: center; margin: .5rem 0; }
        .row span { color: #aab; font-size: .9rem; }
        select, .hex { height: 36px; border-radius: 8px; border: 1px solid rgba(255,255,255,.15);
          background: rgba(255,255,255,.06); color: #fff; padding: 0 .5rem; }
        input[type="color"] { width: 100%; height: 36px; border: 0; background: transparent; }
        .actions { display: flex; gap: .5rem; justify-content: flex-end; margin-top: .5rem; }
        .btn { padding: .5rem .8rem; border-radius: 999px; border: 1px solid rgba(255,255,255,.2);
          background: rgba(255,255,255,.05); color: #fff; cursor: pointer; font-weight: 700; }
        .btn.primary { background: linear-gradient(135deg, #06B6D4, #8B5CF6); border-color: transparent; }

        .bar {
          display: flex; justify-content: space-between; align-items: center;
          padding: .9rem 5%; border-bottom: 1px solid #eee; background: #fff;
          position: sticky; top: 0; z-index: 20;
        }
        .brand { font-weight: 900; letter-spacing: .06em; }
        .actions { display: flex; gap: 1rem; align-items: center; }
        .link { text-transform: uppercase; font-weight: 800; color: #0b0d1c; text-decoration: none; }
        .btn { background: #ff2d91; color: #fff; text-decoration: none; padding: .6rem 1rem; border-radius: 999px; font-weight: 900; }

        .hero { background: linear-gradient(90deg, #f7bfc5 0%, #f5f5f5 60%); position: relative; padding: 3rem 5% 0; }
        .hero-inner { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 1.1fr .9fr; gap: 2rem; align-items: end; }
        .hero-copy h1 {
          font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
          letter-spacing: .02em; font-size: clamp(2.5rem, 7vw, 5rem); line-height: .95; margin: 0 0 .5rem;
        }
        .hero-copy p { max-width: 46ch; color: #222; margin-bottom: 1.2rem; }
        .cta { display: inline-block; background: #3B82F6; color: #fff; padding: .9rem 1.2rem; border-radius: 8px; text-decoration: none; font-weight: 900; box-shadow: 0 10px 30px rgba(59,130,246,.3); }
        .cta.small { padding: .7rem 1rem; border-radius: 999px; }
        .cta.ghost { background: #fff; color: #0b0d1c; border: 2px solid #0b0d1c; }

        .hero-art { position: relative; height: 360px; }
        .product {
          position: absolute; width: 220px; height: 320px; border-radius: 12px;
          box-shadow: 0 40px 80px rgba(0,0,0,.25); border: 6px solid #fff;
          background-size: cover; background-position: center;
        }
        .product.left { left: 0; bottom: 0; }
        .product.right { right: 0; bottom: 0; }

        .hero-band {
          margin-top: 2rem; background: #3B82F6; color: #fff; padding: .9rem 5%;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-weight: 700;
        }

        .icons { background: #fafafa; padding: 2rem 5%; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
        .icon-item { font-weight: 800; text-transform: uppercase; }
        .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #3B82F6; margin-right: .6rem; }

        .benefits { background: #fff; padding: 4rem 5%; text-align: center; }
        .benefits .lead { max-width: 70ch; margin: .75rem auto 2rem; color: #444; }
        .benefit-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 1100px; margin: 0 auto; }
        .card { background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.06); padding: 1.25rem; border: 1px solid #eee; }
        .emoji { font-size: 1.6rem; }

        .testimonial { padding: 4rem 5%; text-align: center; background: #f6f6f8; border-top: 1px solid #eee; border-bottom: 1px solid #eee; }
        blockquote { font-size: 1.2rem; max-width: 60ch; margin: .75rem auto; color: #333; }
        .navs { display: flex; gap: .5rem; justify-content: center; margin: .5rem 0 1rem; }
        .navs button { width: 36px; height: 36px; border-radius: 999px; border: 1px solid #222; background: #fff; font-weight: 900; cursor: pointer; }

        .gives { position: relative; }
        .panel { max-width: 840px; margin: -40px auto 0; background: #fff; border-radius: 12px; padding: 2rem; box-shadow: 0 20px 60px rgba(0,0,0,.12); position: relative; z-index: 2; text-align: center; border: 1px solid #eee; }
        .gives-img { height: 280px; background-size: cover; background-position: center; }

        .gram { padding: 4rem 5% 2rem; text-align: center; }
        .grid { margin-top: 1rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: .75rem; }
        .ph { height: 160px; background-size: cover; background-position: center; border: 1px solid #ddd; border-radius: 8px; }

        .guarantee { padding: 4rem 5%; background: #44566c; color: #fff; text-align: center; }
        .guarantee .cta { margin-top: 1rem; }

        @media (max-width: 1024px) {
          .hero-inner { grid-template-columns: 1fr; }
          .hero-art { height: 300px; }
          .product.right { right: 20px; }
          .product.left { left: 20px; }
          .hero-band { grid-template-columns: 1fr; text-align: center; }
          .icons { grid-template-columns: repeat(2, 1fr); }
          .benefit-cards { grid-template-columns: 1fr; }
          .grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
