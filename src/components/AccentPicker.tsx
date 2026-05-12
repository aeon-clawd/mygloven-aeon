import { useEffect, useState } from "react";

const ACCENTS: Record<string, { color: string; hover: string; soft: string; label: string }> = {
  cian: { color: "#33b9fa", hover: "#5cc7fb", soft: "#33b9fa14", label: "Cian" },
  naranja: { color: "#ff4d00", hover: "#ff6a26", soft: "#ff4d0014", label: "Naranja" },
  lima: { color: "#a3e635", hover: "#bef264", soft: "#a3e63514", label: "Lima" },
  rosa: { color: "#ff3da5", hover: "#ff5fb6", soft: "#ff3da514", label: "Rosa" },
  ambar: { color: "#facc15", hover: "#fde047", soft: "#facc1514", label: "Ámbar" },
  lila: { color: "#a78bfa", hover: "#c4b5fd", soft: "#a78bfa14", label: "Lila" },
};

const STORAGE_KEY = "myg-accent";
const EVENT_NAME = "myg:accent-change";
const DEFAULT = "cian";

function applyAccent(name: string) {
  const a = ACCENTS[name] || ACCENTS[DEFAULT];
  const root = document.documentElement.style;
  root.setProperty("--color-accent", a.color);
  root.setProperty("--color-accent-hover", a.hover);
  root.setProperty("--color-accent-soft", a.soft);
  document.documentElement.setAttribute("data-accent", name);
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    /* ignore */
  }
}

export default function AccentPicker() {
  const [active, setActive] = useState<string>(DEFAULT);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    const name = stored && ACCENTS[stored] ? stored : DEFAULT;
    setActive(name);
    applyAccent(name);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail && ACCENTS[detail]) setActive(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && ACCENTS[e.newValue]) {
        applyAccent(e.newValue);
        setActive(e.newValue);
      }
    };
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleClick = (name: string) => {
    applyAccent(name);
    setActive(name);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: name }));
  };

  return (
    <div className="accent-picker">
      <span className="lbl">— Acento</span>
      {Object.entries(ACCENTS).map(([name, a]) => (
        <button
          key={name}
          type="button"
          className={`swatch${name === active ? " active" : ""}`}
          style={{ ["--swatch" as any]: a.color }}
          onClick={() => handleClick(name)}
          data-cursor={a.label.toLowerCase()}
          title={a.label}
          aria-label={`Acento ${a.label}`}
        />
      ))}
    </div>
  );
}
