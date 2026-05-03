import { useState } from "react";
import { Palette, X, RotateCcw } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { THEME_LABELS, DEFAULT_THEME, type ThemeColors } from "@/lib/theme";

export function ThemeEditorButton() {
  const [open, setOpen] = useState(false);
  const { colors, updateColor, resetTheme } = useTheme();

  const keys = Object.keys(THEME_LABELS) as (keyof ThemeColors)[];

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Customize colors"
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "0.25rem 0.6rem",
          border: `1px solid rgba(255,255,255,0.25)`,
          color: "#F5EEE0",
          opacity: 0.65,
          fontFamily: "'Outfit', sans-serif",
          fontSize: "0.62rem",
          letterSpacing: "0.08em",
          background: "transparent",
          cursor: "pointer",
          transition: "opacity 0.15s",
        }}
        className="hover:opacity-100"
      >
        <Palette className="w-3.5 h-3.5" />
        Colors
      </button>

      {/* Backdrop */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 49, background: "rgba(0,0,0,0.35)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 50,
        width: 320,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s ease",
        display: "flex", flexDirection: "column",
        backgroundColor: "#1E0E04",
        borderLeft: "3px solid #C8A020",
        boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
      }}>

        {/* Panel header */}
        <div style={{
          backgroundColor: "#5E7A58",
          padding: "0.85rem 1.1rem",
          borderBottom: "3px solid #C8A020",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: "#F5EEE0" }} />
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900, fontSize: "1rem",
              textTransform: "uppercase", letterSpacing: "0.12em",
              color: "#F5EEE0",
              textShadow: "1px 1px 0 #0A1A08, 2px 2px 0 rgba(0,0,0,0.3)",
            }}>
              Site Colors
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetTheme}
              title="Reset to defaults"
              style={{ color: "#C8A020", opacity: 0.75, cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", background: "transparent", border: "none" }}
              className="hover:opacity-100"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button onClick={() => setOpen(false)} style={{ color: "#F5EEE0", opacity: 0.6, cursor: "pointer", background: "transparent", border: "none" }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Color list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem 0" }}>
          {keys.map((key, i) => {
            const { name, use } = THEME_LABELS[key];
            const current = colors[key];
            const isDefault = current === DEFAULT_THEME[key];
            return (
              <div key={key}
                style={{
                  padding: "0.65rem 1.1rem",
                  borderBottom: i < keys.length - 1 ? "1px solid rgba(200,160,32,0.12)" : "none",
                  display: "flex", alignItems: "center", gap: 12,
                }}>

                {/* Color picker */}
                <label style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}>
                  <div style={{
                    width: 36, height: 36,
                    backgroundColor: current,
                    border: isDefault ? "2px solid rgba(200,160,32,0.35)" : "2px solid #C8A020",
                    boxShadow: isDefault ? "none" : "0 0 0 1px #C8A020",
                    cursor: "pointer",
                  }} />
                  <input
                    type="color"
                    value={current}
                    onChange={e => updateColor(key, e.target.value)}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                  />
                </label>

                {/* Label + hex */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.82rem",
                      fontWeight: 700, color: "#F5EEE0" }}>{name}</span>
                    {!isDefault && (
                      <button
                        onClick={() => updateColor(key, DEFAULT_THEME[key])}
                        title="Reset this color"
                        style={{ color: "#C8A020", opacity: 0.6, cursor: "pointer",
                          background: "transparent", border: "none", lineHeight: 1 }}
                        className="hover:opacity-100"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                    color: "#F5EEE0", opacity: 0.45, marginBottom: 3, lineHeight: 1.3 }}>{use}</p>
                  <input
                    type="text"
                    value={current}
                    onChange={e => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) updateColor(key, v.length === 7 ? v : current);
                    }}
                    onBlur={e => {
                      if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) updateColor(key, current);
                    }}
                    style={{
                      fontFamily: "'Outfit', monospace", fontSize: "0.7rem",
                      color: "#C8A020", background: "transparent",
                      border: "none", borderBottom: "1px solid rgba(200,160,32,0.3)",
                      width: 72, padding: "0 0 1px", outline: "none",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <div style={{ padding: "0.75rem 1.1rem", borderTop: "1px solid rgba(200,160,32,0.18)" }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem",
            color: "#F5EEE0", opacity: 0.4, textAlign: "center", fontStyle: "italic" }}>
            Changes save automatically and persist between visits
          </p>
        </div>
      </div>
    </>
  );
}
