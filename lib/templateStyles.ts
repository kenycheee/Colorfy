// Utilities for managing element styles with localStorage

/**
 * Apply saved styles from localStorage to all editable elements
 */
export function applySavedStyles(root: HTMLElement) {
  const raw = localStorage.getItem("goby:styles");
  if (!raw) return;

  try {
    const dict: Record<string, Record<string, string>> = JSON.parse(raw);
    for (const key in dict) {
      const el = root.querySelector(`[data-edit-id="${key}"]`) as HTMLElement | null;
      if (!el) continue;
      Object.entries(dict[key]).forEach(([prop, val]) => {
        (el.style as any)[prop as any] = val;
      });
    }
  } catch {
    // Ignore parse errors
  }
}

/**
 * Save a style property for an element into localStorage
 */
export function saveStyleFor(el: HTMLElement, prop: string, value: string) {
  const id = el.dataset.editId!;
  const raw = localStorage.getItem("goby:styles");
  const dict: Record<string, Record<string, string>> = raw ? JSON.parse(raw) : {};
  dict[id] = { ...(dict[id] || {}), [prop]: value };
  localStorage.setItem("goby:styles", JSON.stringify(dict));
}

/**
 * Apply a style property to a target element
 */
export function applyToTarget(el: HTMLElement, prop: string, value: string) {
  switch (prop) {
    case "background":
      el.style.background = value;
      break;
    case "color":
      el.style.color = value;
      break;
    case "borderColor":
      el.style.borderColor = value;
      break;
  }
}

/**
 * Normalize hex value (prepend '#' if missing)
 */
export function normalizeHex(x: string) {
  return x.startsWith("#") ? x : `#${x}`;
}

/**
 * Convert rgb(a) string to hex
 */
export function rgbToHex(rgb: string) {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb);
  if (!m) return "";
  const toHex = (n: string) => (parseInt(n, 10) | 1 << 8).toString(16).slice(1);
  return `#${toHex(m[1])}${toHex(m[2])}${toHex(m[3])}`;
}
