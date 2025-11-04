"use client";
import { useEffect, useState } from "react";
import "../app/css/colorEditor.css";
import {
  applyToTarget,
  saveStyleFor,
  normalizeHex,
  rgbToHex,
} from "@/lib/templateStyles";

type PropKey = "background" | "color" | "borderColor";

interface ColorEditorProps {
  target: HTMLElement | null;
  onClose: () => void;
}

export default function ColorEditor({ target, onClose }: ColorEditorProps) {
  const [vals, setVals] = useState<Record<PropKey, string>>({
    background: "#ffffff",
    color: "#000000",
    borderColor: "#000000",
  });

  // load current computed styles to hex
  useEffect(() => {
    if (!target) return;
    const cs = getComputedStyle(target);
    setVals({
      background: rgbToHex(cs.backgroundColor) || "#ffffff",
      color: rgbToHex(cs.color) || "#000000",
      borderColor: rgbToHex(cs.borderColor) || "#000000",
    });
  }, [target]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!target) return null;

  const handleChange = (prop: PropKey, raw: string) => {
    const v = normalizeHex(raw);
    setVals((s) => ({ ...s, [prop]: v }));
  };

  const applyAndSave = (prop: PropKey) => {
    const v = vals[prop];
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return;
    applyToTarget(target, prop, v);
    saveStyleFor(target, prop, v);
  };

  return (
    <div className="ce-wrap">
      <div className="ce-head">
        <strong className="ce-title">
          {target.dataset.editName || "Element"}
        </strong>
        <button className="ce-x" onClick={onClose} aria-label="Close">×</button>
      </div>

      <div className="ce-list">
        {/* Row: Background */}
        <div className="ce-row">
          <div className="ce-label">Background</div>
          <div className="ce-controls">
            <input
              type="color"
              value={vals.background}
              onChange={(e) => {
                handleChange("background", e.target.value);
                applyToTarget(target, "background", e.target.value);
              }}
              className="ce-color"
              aria-label="Background color"
            />
            <input
              type="text"
              value={vals.background}
              onChange={(e) => handleChange("background", e.target.value)}
              className="ce-hex"
              placeholder="#ffffff"
              spellCheck={false}
            />
            <button
              className="ce-apply"
              onClick={() => applyAndSave("background")}
            >
              Apply
            </button>
          </div>
        </div>

        {/* Row: Text Color */}
        <div className="ce-row">
          <div className="ce-label">Text</div>
          <div className="ce-controls">
            <input
              type="color"
              value={vals.color}
              onChange={(e) => {
                handleChange("color", e.target.value);
                applyToTarget(target, "color", e.target.value);
              }}
              className="ce-color"
              aria-label="Text color"
            />
            <input
              type="text"
              value={vals.color}
              onChange={(e) => handleChange("color", e.target.value)}
              className="ce-hex"
              placeholder="#000000"
              spellCheck={false}
            />
            <button className="ce-apply" onClick={() => applyAndSave("color")}>
              Apply
            </button>
          </div>
        </div>

        {/* Row: Border Color */}
        <div className="ce-row">
          <div className="ce-label">Border</div>
          <div className="ce-controls">
            <input
              type="color"
              value={vals.borderColor}
              onChange={(e) => {
                handleChange("borderColor", e.target.value);
                applyToTarget(target, "borderColor", e.target.value);
              }}
              className="ce-color"
              aria-label="Border color"
            />
            <input
              type="text"
              value={vals.borderColor}
              onChange={(e) => handleChange("borderColor", e.target.value)}
              className="ce-hex"
              placeholder="#000000"
              spellCheck={false}
            />
            <button
              className="ce-apply"
              onClick={() => applyAndSave("borderColor")}
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      <div className="ce-footer">
        <button className="ce-saveall" onClick={() => {
          (["background","color","borderColor"] as PropKey[]).forEach(applyAndSave);
          onClose();
        }}>
          Save all
        </button>
        <button className="ce-cancel" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
