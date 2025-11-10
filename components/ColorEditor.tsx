"use client";
import { useEffect, useState } from "react";
import "@/app/css/colorEditor.css";
import { saveStyleFor } from "@/lib/templateStyles";

type PropKey = "background" | "color" | "borderColor";

function rgbToHex(rgb: string) {
  if (!rgb) return "";
  const res = rgb.match(/\d+/g);
  return res
    ? "#" +
        res
          .slice(0, 3)
          .map((x) => {
            const n = parseInt(x).toString(16);
            return n.length === 1 ? "0" + n : n;
          })
          .join("")
    : rgb;
}

function normalizeHex(hex: string) {
  if (!hex) return "";
  hex = hex.trim();
  if (hex.startsWith("#")) return hex;
  if (/^[0-9a-f]{3}$/i.test(hex)) return "#" + hex;
  if (/^[0-9a-f]{6}$/i.test(hex)) return "#" + hex;
  return hex;
}

// ambil root untuk CSS variable global
function getRootFor(el: HTMLElement) {
  return (el.closest(".tv-wrap") as HTMLElement) || document.documentElement;
}

interface Props {
  target: HTMLElement;
  onClose: () => void;
}

export default function ColorEditor({ target, onClose }: Props) {
  const [vals, setVals] = useState({
    background: "#ffffff",
    color: "#000000",
    borderColor: "#000000",
  });

  // ambil warna awal (support data-edit-var)
  useEffect(() => {
    if (!target) return;
    const varName = target.dataset.editVar;
    if (varName) {
      const root = getRootFor(target);
      const v = getComputedStyle(root).getPropertyValue(`--${varName}`).trim();
      setVals({
        background: normalizeHex(rgbToHex(v) || v) || "#ffffff",
        color: "#000000",
        borderColor: "#000000",
      });
      return;
    }
    const cs = getComputedStyle(target);
    setVals({
      background: rgbToHex(cs.backgroundColor) || "#ffffff",
      color: rgbToHex(cs.color) || "#000000",
      borderColor: rgbToHex(cs.borderColor) || "#000000",
    });
  }, [target]);

  const setVal = (k: PropKey, v: string) => {
    setVals((old) => ({ ...old, [k]: v }));
  };

  const applyToTarget = (el: HTMLElement, prop: PropKey, val: string) => {
    el.style[prop] = val;
  };

  const applyAndSave = (prop: PropKey) => {
    const v = vals[prop];
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) return;

    const varName = target?.dataset.editVar;
    if (prop === "background" && target && varName) {
      const root = getRootFor(target);
      root.style.setProperty(`--${varName}`, v);
      try {
        saveStyleFor(root as any, `--${varName}` as any, v);
      } catch {}
      return;
    }

    if (target) {
      applyToTarget(target, prop, v);
      saveStyleFor(target, prop, v);
    }
  };

  const saveAll = () => {
    (["background", "color", "borderColor"] as PropKey[]).forEach(applyAndSave);
    onClose();
  };

  return (
    <div className="color-editor">
      <div className="color-editor-header">
        <strong>{target.dataset.editName || "Element"}</strong>
        <button onClick={onClose}>×</button>
      </div>

      {(["background", "color", "borderColor"] as PropKey[]).map((prop) => (
        <div key={prop} className="color-row">
          <label>{prop}</label>
          <input
            type="color"
            value={vals[prop]}
            onChange={(e) => setVal(prop, e.target.value)}
          />
          <input
            type="text"
            value={vals[prop]}
            onChange={(e) => setVal(prop, normalizeHex(e.target.value))}
            onBlur={() => applyAndSave(prop)}
          />
        </div>
      ))}

      <div className="color-editor-actions">
        <button onClick={saveAll}>Save all</button>
        <button onClick={onClose} className="cancel">
          Cancel
        </button>
      </div>
    </div>
  );
}
