import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "myg-theme";
const EVENT_NAME = "myg:theme-change";
const DEFAULT: Theme = "dark";

function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {
    /* ignore */
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "dark" ? "#0a0a0a" : "#fafafa");
}

export default function ThemeToggle() {
  const [active, setActive] = useState<Theme>(DEFAULT);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    const t: Theme = stored === "light" || stored === "dark" ? stored : DEFAULT;
    setActive(t);
    applyTheme(t);

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent<Theme>).detail;
      if (detail === "dark" || detail === "light") setActive(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
        applyTheme(e.newValue);
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

  const handleClick = (t: Theme) => {
    applyTheme(t);
    setActive(t);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: t }));
  };

  return (
    <div className="theme-toggle" role="group" aria-label="Tema">
      <span className="lbl">— Tema</span>
      <button
        type="button"
        className={`theme-btn${active === "dark" ? " active" : ""}`}
        onClick={() => handleClick("dark")}
        data-cursor="oscuro"
        aria-label="Tema oscuro"
        title="Oscuro"
      >
        <span className="theme-dot dark" />
      </button>
      <button
        type="button"
        className={`theme-btn${active === "light" ? " active" : ""}`}
        onClick={() => handleClick("light")}
        data-cursor="claro"
        aria-label="Tema claro"
        title="Claro"
      >
        <span className="theme-dot light" />
      </button>
    </div>
  );
}
