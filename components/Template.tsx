"use client";
import { useEffect, useRef, useState } from "react";
import ColorEditor from "./ColorEditor";
import { applySavedStyles } from "@/lib/templateStyles";

/**
 * Main Template component with editable elements
 * Layout: left = template, right = editor panel
 */
export default function Template() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  // Apply saved styles on mount
  useEffect(() => {
    if (!rootRef.current) return;
    applySavedStyles(rootRef.current);
  }, []);

  // Handle clicks on editable elements
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        "[data-edit-id]"
      ) as HTMLElement | null;
      if (el && root.contains(el)) {
        e.preventDefault();
        e.stopPropagation();
        setTarget(el);
      }
    };

    root.addEventListener("click", onClick, true);
    return () => root.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div
      className="template-container"
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* LEFT COLUMN: Template content */}
      <div
        ref={rootRef}
        className="page-wrap"
        style={{
          flex: 1,
          overflow: "hidden", // biar tidak scroll
          height: "100%",
        }}
      >
        {/* --- CONTENT TEMPLATE (tidak diubah sama sekali) --- */}
        <header className="bar" data-edit-id="nav" data-edit-name="Top Bar">
          <div className="brand" data-edit-id="brand" data-edit-name="Brand">
            GOBY
          </div>
          <div className="actions">
            <a href="#" className="link">
              subscribe & save →
            </a>
            <a
              href="#cta"
              className="btn"
              data-edit-id="nav-cta"
              data-edit-name="Top CTA"
            >
              shop now
            </a>
          </div>
        </header>

        {/* Hero */}
        <section
          className="hero"
          id="templates"
          data-edit-id="hero-bg"
          data-edit-name="Hero Background"
        >
          <div className="hero-inner">
            <div className="hero-copy">
              <h1 data-edit-id="hero-title" data-edit-name="Hero Title">
                BRUSHING PERFECTED
              </h1>
              <p data-edit-id="hero-sub" data-edit-name="Hero Sub">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <a
                href="#cta"
                className="cta"
                data-edit-id="hero-cta"
                data-edit-name="Hero CTA"
              >
                SHOP NOW
              </a>
            </div>
            <div className="hero-art">
              <div
                className="product left"
                data-edit-id="prod-left"
                data-edit-name="Product Left"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-wgq8NVyXsYY?auto=format&fit=crop&w=2000&q=80)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div
                className="product right"
                data-edit-id="prod-right"
                data-edit-name="Product Right"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-L4W1uX1xwlQ?auto=format&fit=crop&w=2000&q=80)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
          </div>
          <div
            className="hero-band"
            data-edit-id="hero-band"
            data-edit-name="Hero Blue Band"
          >
            <div>
              Top Electric Toothbrush <b>ASK THE DENTIST</b>
            </div>
            <div>
              Best Subscription Toothbrush <b>WIRECUTTER</b>
            </div>
            <div>
              2017 Grooming Award <b>MEN&apos;S HEALTH</b>
            </div>
          </div>
        </section>
        {/* ICON STRIP, BENEFITS, TESTIMONIAL, GIVES, GRID, GUARANTEE */}
      </div>

      {/* RIGHT COLUMN: Editor panel */}
      <div
        className="editor-panel"
        style={{
          width: "320px",
          borderLeft: "1px solid #ccc",
          padding: "1.5rem",
          background: "#f9f9f9",
          height: "100vh",
          overflowY: "auto",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Edit Element</h3>
        {target ? (
          <ColorEditor target={target} onClose={() => setTarget(null)} />
        ) : (
          <p>Select an element on the left to edit</p>
        )}
      </div>
    </div>
  );
}
