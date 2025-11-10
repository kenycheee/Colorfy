"use client";

import { useEffect, useRef, useState } from "react";
import { applySavedStyles, saveStyleFor } from "@/lib/templateStyles";
import Navbar from "./Navbar";

type LegendItem = {
  id: string;
  name: string;
  var: string;
  cls: string;
  targetSelector: string;
};

const LEGEND: LegendItem[] = [
  { id: "var-red", name: "Red", var: "c-red", cls: "red", targetSelector: ".bar.red" },
  { id: "var-green", name: "Green", var: "c-green", cls: "green", targetSelector: ".bar.green" },
  { id: "var-blue", name: "Blue", var: "c-blue", cls: "blue", targetSelector: ".bar.blue" },
  { id: "var-gray", name: "Gray", var: "c-gray", cls: "gray", targetSelector: ".bar.gray" },
  { id: "var-purple", name: "Purple", var: "c-purple", cls: "purple", targetSelector: ".bar.purple" },
];

const DEFAULT_VARS: Record<string, string> = {
  "c-red": "#f0322c",
  "c-green": "#64c11a",
  "c-blue": "#0f1e67",
  "c-gray": "#5f5050",
  "c-purple": "#4b2449",
};

function getRootFor(el: HTMLElement | null) {
  if (!el) return document.documentElement;
  return (el.closest(".tv-wrap") as HTMLElement) || document.documentElement;
}

function toHex(val: string) {
  if (!val) return "#000000";
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) return val.trim();
  const m = val.match(/\d+/g);
  if (!m) return "#000000";
  const hex =
    "#" +
    m
      .slice(0, 3)
      .map((n) => {
        const h = Number(n).toString(16);
        return h.length === 1 ? "0" + h : h;
      })
      .join("");
  return hex;
}

function randHex() {
  const r = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  const g = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  const b = Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

export default function Template() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const [selectedLegend, setSelectedLegend] = useState<string | null>(null);

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
    const root = getRootFor(canvasRef.current as unknown as HTMLElement);
    return getComputedStyle(root).getPropertyValue(`--${varName}`).trim();
  };

  const pulseBar = (varName: string) => {
    const root = canvasRef.current!;
    const item = LEGEND.find((l) => l.var === varName);
    if (!item) return;
    const bar = root.querySelector(item.targetSelector) as HTMLElement | null;
    if (!bar) return;
    bar.classList.remove("color-pulse");
    void bar.offsetWidth;
    bar.classList.add("color-pulse");
  };

  const writeVar = (varName: string, value: string) => {
    const root = getRootFor(canvasRef.current as unknown as HTMLElement);
    root.style.setProperty(`--${varName}`, value);
    try {
      saveStyleFor(root as any, `--${varName}` as any, value);
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

  return (
    <>
      <Navbar />
      <div className="template-container tv-wrap">
        <div ref={canvasRef} className="page-wrap">
          <div className="tv" data-edit-id="frame" data-edit-name="Frame">
            <div className="tv-inner" data-edit-id="inner" data-edit-name="Inner">
              <div className="bars" aria-label="Color Bars">
                <div className="bar red" data-edit-id="var-red" data-edit-name="Merah" data-edit-var="c-red" />
                <div className="bar green" data-edit-id="var-green" data-edit-name="Hijau" data-edit-var="c-green" />
                <div className="bar blue" data-edit-id="var-blue" data-edit-name="Biru" data-edit-var="c-blue" />
                <div className="bar gray" data-edit-id="var-gray" data-edit-name="Abu" data-edit-var="c-gray" />
                <div className="bar purple" data-edit-id="var-purple" data-edit-name="Ungu" data-edit-var="c-purple" />
              </div>
            </div>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-header">
            <h3>Edit Colors</h3>
            <div className="editor-actions">
              <button onClick={randomizeAll}>Random</button>
              <button onClick={resetAll} className="ghost">Reset</button>
            </div>
          </div>
          <div className="legend">
            {LEGEND.map((item) => {
              const current = toHex(readVar(item.var));
              return (
                <div
                  key={item.id}
                  className={`legend-item ${selectedLegend === item.id ? "is-selected" : ""}`}
                  onClick={(e) => handleLegendClick(item, e)}
                  role="button"
                  data-edit-id={item.id}
                  data-edit-name={item.name}
                  data-edit-var={item.var}
                  title={item.name}
                >
                  <span className={`legend-swatch ${item.cls}`} aria-hidden />
                  <span>{item.name}</span>
                  <input
                    className="legend-picker"
                    type="color"
                    value={current}
                    onChange={(e) => writeVar(item.var, e.target.value)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLegend(item.id);
                      handleLegendClick(item, e as any);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
