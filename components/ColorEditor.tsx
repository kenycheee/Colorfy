"use client";
import { useEffect, useState } from "react";
import { applyToTarget, saveStyleFor, normalizeHex, rgbToHex } from "@/lib/templateStyles";

interface ColorEditorProps {
  target: HTMLElement | null;
  onClose: () => void;
}

/**
 * ColorEditor component — allows editing background, text, or border color of a target element
 */
export default function ColorEditor({ target, onClose }: ColorEditorProps) {
  const [prop, setProp] = useState<"background" | "color" | "borderColor">("background");
  const [val, setVal] = useState("#ffffff");

  useEffect(() => {
    if (!target) return;
    const cs = getComputedStyle(target);
    const current =
      prop === "color"
        ? cs.color
        : prop === "borderColor"
        ? cs.borderColor
        : cs.backgroundColor;
    setVal(rgbToHex(current) || "#ffffff");
  }, [target, prop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!target) return null;

  return (
    <div style={{ marginTop: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <strong>{target.dataset.editName || "Element"}</strong>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Property</label>
        <select
          value={prop}
          onChange={(e) => setProp(e.target.value as any)}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <option value="background">background</option>
          <option value="color">color</option>
          <option value="borderColor">borderColor</option>
        </select>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>Color</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="color"
            value={val}
            onChange={(e) => {
              setVal(e.target.value);
              applyToTarget(target, prop, e.target.value);
            }}
            style={{ flex: "0 0 50px", height: "40px", border: "none" }}
          />
          <input
            type="text"
            value={val}
            onChange={(e) => {
              const v = normalizeHex(e.target.value);
              setVal(v);
              if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v))
                applyToTarget(target, prop, v);
            }}
            style={{
              flex: 1,
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => {
            applyToTarget(target, prop, val);
            saveStyleFor(target, prop, val);
            onClose();
          }}
          style={{
            flex: 1,
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "0.5rem",
            cursor: "pointer",
          }}
        >
          Save
        </button>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            background: "transparent",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "0.5rem",
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
