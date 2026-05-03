import { useState } from "react";
import { Palette, X, RotateCcw, Save, Copy } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { THEME_LABELS, type ThemeColors } from "@/lib/theme";

export function ThemeEditorButton() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const { colors, activeDefault, updateColor, resetTheme, overwriteDefaults } = useTheme();

  const keys = Object.keys(THEME_LABELS) as (keyof ThemeColors)[];

  const handleOverwrite = () => {
    overwriteDefaults();
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleCopy = () => {
    const lines = keys.map(k => `  ${k}: "${colors[k]}",`).join("\n");
    const text = `{\n${lines}\n}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        width: 300,
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
            {/* Copy colors for dev */}
            <button
              onClick={handleCopy}
              title="Copy current colors to clipboard"
              style={{
                color: copied ? "#7ECE6A" : "#C8A020",
                opacity: 0.85, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                background: "transparent", border: "none",
                transition: "color 0.3s",
              }}
              className="hover:opacity-100"
            >
              <Copy className="w-3 h-3" />
              {copied ? "Copied!" : "Copy"}
            </button>
            {/* Overwrite defaults */}
            <button
              onClick={handleOverwrite}
              title="Save current colors as new default"
              style={{
                color: saved ? "#7ECE6A" : "#C8A020",
                opacity: 0.85, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                background: "transparent", border: "none",
                transition: "color 0.3s",
              }}
              className="hover:opacity-100"
            >
              <Save className="w-3 h-3" />
              {saved ? "Saved!" : "Overwrite"}
            </button>
            {/* Reset to active default */}
            <button
              onClick={resetTheme}
              title="Reset to saved default"
              style={{
                color: "#C8A020", opacity: 0.75, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                background: "transparent", border: "none",
              }}
              className="hover:opacity-100"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button
              onClick={() => setOpen(false)}
              style={{ color: "#F5EEE0", opacity: 0.6, cursor: "pointer", background: "transparent", border: "none" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Color list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem 0" }}>
          {keys.map((key, i) => {
            const { use } = THEME_LABELS[key];
            const current = colors[key];
            const isDefault = current === activeDefault[key];
            return (
              <div key={key}
                style={{
                  padding: "0.55rem 1.1rem",
                  borderBottom: i < keys.length - 1 ? "1px solid rgba(200,160,32,0.12)" : "none",
                  display: "flex", alignItems: "center", gap: 12,
                }}>

                {/* Color picker swatch */}
                <label style={{ position: "relative", flexShrink: 0, cursor: "pointer" }}>
                  <div style={{
                    width: 34, height: 34,
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

                {/* Use description + hex */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <p style={{
                      fontFamily: "'Outfit', sans-serif", fontSize: "0.68rem",
                      color: "#F5EEE0", opacity: 0.75, lineHeight: 1.3, flex: 1,
                    }}>{use}</p>
                    {!isDefault && (
                      <button
                        onClick={() => updateColor(key, activeDefault[key])}
                        title="Reset this color to default"
                        style={{ color: "#C8A020", opacity: 0.55, cursor: "pointer",
                          background: "transparent", border: "none", lineHeight: 1, flexShrink: 0 }}
                        className="hover:opacity-100"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
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
                      fontFamily: "'Outfit', monospace", fontSize: "0.68rem",
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

        {/* Footer */}
        <div style={{ padding: "0.65rem 1.1rem", borderTop: "1px solid rgba(200,160,32,0.18)" }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.58rem",
            color: "#F5EEE0", opacity: 0.35, textAlign: "center", fontStyle: "italic" }}>
            Changes save automatically · Overwrite to set new default
          </p>
        </div>
      </div>
    </>
  );
}
