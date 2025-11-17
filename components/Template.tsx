"use client";

import { useEffect, useRef, useState } from "react";
import { applySavedStyles, saveStyleFor } from "@/lib/templateStyles";
import Navbar from "./Navbar";

import { auth, db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type LegendItem = {
  id: string;
  name: string;
  var: string;
  cls: string;
  targetSelector: string;
};

const LEGEND: LegendItem[] = [
  { id: "var-red", name: "Color 1", var: "c-red", cls: "red", targetSelector: ".bar.red" },
  { id: "var-green", name: "Color 2", var: "c-green", cls: "green", targetSelector: ".bar.green" },
  { id: "var-blue", name: "Color 3", var: "c-blue", cls: "blue", targetSelector: ".bar.blue" },
  { id: "var-gray", name: "Color 4", var: "c-gray", cls: "gray", targetSelector: ".bar.gray" },
  { id: "var-purple", name: "Color 5", var: "c-purple", cls: "purple", targetSelector: ".bar.purple" },
];

const DEFAULT_VARS: Record<string, string> = {
  "c-red": "#f0322c",
  "c-green": "#64c11a",
  "c-blue": "#0f1e67",
  "c-gray": "#5f5050",
  "c-purple": "#4b2449",
};

function getRootFor(el: HTMLElement | null) {
  if (typeof document === "undefined") return null;
  if (!el) return document.documentElement;
  return el.closest(".tv-wrap") || document.documentElement;
}

function toHex(val: string) {
  if (!val) return "#000000";
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) return val.trim();

  const m = val.match(/\d+/g);
  if (!m) return "#000000";

  return (
    "#" +
    m
      .slice(0, 3)
      .map((n) => Number(n).toString(16).padStart(2, "0"))
      .join("")
  );
}

function randHex() {
  const part = () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  return `#${part()}${part()}${part()}`;
}

export default function Template() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [selectedLegend, setSelectedLegend] = useState<string | null>(null);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);

  const [user, setUser] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Template");

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (canvasRef.current) applySavedStyles(canvasRef.current);
  }, []);

  useEffect(() => {
    const root = canvasRef.current;
    if (!root) return;

    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("[data-edit-id]") as HTMLElement | null;
      if (!el) return;

      e.preventDefault();
      e.stopPropagation();

      if (selectedEl) selectedEl.classList.remove("is-selected");
      el.classList.add("is-selected");
      setSelectedEl(el);

      const cls = el.className || "";
      const hit = LEGEND.find((x) => cls.includes(x.cls));
      if (hit) setSelectedLegend(hit.id);
    };

    root.addEventListener("click", handler, true);
    return () => root.removeEventListener("click", handler, true);
  }, [selectedEl]);

  const readVar = (varName: string) => {
    const dom = getRootFor(canvasRef.current);
    if (!dom) return DEFAULT_VARS[varName] ?? "#000000";
    return getComputedStyle(dom).getPropertyValue(`--${varName}`).trim();
  };

  const pulseBar = (varName: string) => {
    const root = canvasRef.current;
    if (!root) return;

    const item = LEGEND.find((l) => l.var === varName);
    if (!item) return;

    const bar = root.querySelector(item.targetSelector) as HTMLElement | null;
    if (!bar) return;

    bar.classList.remove("color-pulse");
    void bar.offsetWidth;
    bar.classList.add("color-pulse");
  };

  const writeVar = (varName: string, value: string) => {
    const dom = getRootFor(canvasRef.current);
    if (!(dom instanceof HTMLElement)) return;

    dom.style.setProperty(`--${varName}`, value);

    try {
      saveStyleFor(dom, `--${varName}`, value);
    } catch {}

    pulseBar(varName);
  };

  const handleLegendClick = (item: LegendItem, e: React.MouseEvent) => {
    setSelectedLegend(item.id);

    const root = canvasRef.current!;
    const bar = root.querySelector(item.targetSelector) as HTMLElement | null;

    if (bar) {
      if (selectedEl) selectedEl.classList.remove("is-selected");
      bar.classList.add("is-selected");
      setSelectedEl(bar);
    }
  };

  const resetAll = () => {
    Object.entries(DEFAULT_VARS).forEach(([k, v]) => writeVar(k, v));
  };

  const randomizeAll = () => {
    LEGEND.forEach((l) => writeVar(l.var, randHex()));
  };

  const savePaletteToFirestore = async () => {
    if (!user) return alert("Please login first!");

    const colors = LEGEND.map((l) => toHex(readVar(l.var)));

    const payload = {
      title,
      description,
      category,
      colors,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, `users/${user.uid}/palleteList`), payload);
      await addDoc(collection(db, "palleteList"), payload);
      alert("Palette saved!");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <>
      <Navbar />

      <div className="template-container tv-wrap">
        {/* CANVAS */}
        <div ref={canvasRef} className="page-wrap">
          <div className="tv" data-edit-id="frame">
            <div className="tv-inner" data-edit-id="inner">
              <div className="bars">
                <div className="bar red" data-edit-id="var-red" />
                <div className="bar green" data-edit-id="var-green" />
                <div className="bar blue" data-edit-id="var-blue" />
                <div className="bar gray" data-edit-id="var-gray" />
                <div className="bar purple" data-edit-id="var-purple" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="editor-panel">
          <div className="editor-header">
            <h3>Edit Colors</h3>
          </div>

          {/* LIST WARNA */}
          <div className="legend">
            {LEGEND.map((item) => {
              const current = toHex(readVar(item.var));
              return (
                <div
                  key={item.id}
                  className={`legend-item ${selectedLegend === item.id ? "is-selected" : ""}`}
                  onClick={(e) => handleLegendClick(item, e)}
                >
                  <span className={`legend-swatch ${item.cls}`} />
                  <span>{item.name}</span>
                  <input
                    type="color"
                    className="legend-picker"
                    value={current}
                    onChange={(e) => writeVar(item.var, e.target.value)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLegend(item.id);
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* FORM PALETTE */}
          <div className="editor-form">
            <label className="input-label">Title</label>
            <input
              className="input-field"
              placeholder="Palette Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="input-label">Description</label>
            <textarea
              className="input-field textarea"
              placeholder="Description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* BUTTONS */}
          <div className="editor-actions">
            <button onClick={randomizeAll}>Random</button>
            <button onClick={resetAll} className="ghost">
              Reset
            </button>
            <button className="save-btn" onClick={savePaletteToFirestore}>
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
