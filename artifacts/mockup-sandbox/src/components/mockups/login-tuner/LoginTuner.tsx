import { useState } from "react";
import mansHeadUrl from "./mans-head.svg";

type Mode = "desktop" | "mobile";

interface Vals { top: number; width: number; left: number; scale: number; }

const DEFAULTS: Record<Mode, Vals> = {
  desktop: { top: 31, width: 57, left: 52, scale: 119 },
  mobile:  { top: 31, width: 57, left: 52, scale: 119 },
};

export function LoginTuner() {
  const [mode, setMode] = useState<Mode>("desktop");
  const [vals, setVals] = useState<Record<Mode, Vals>>(DEFAULTS);

  const v = vals[mode];
  const set = (key: keyof Vals) => (n: number) =>
    setVals(prev => ({ ...prev, [mode]: { ...prev[mode], [key]: n } }));

  const previewWidth = mode === "mobile" ? 390 : 560;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
      minHeight: "100vh", background: "#b8cdd4", padding: "24px 16px", gap: 20, fontFamily: "sans-serif" }}>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 0, border: "2px solid #333", overflow: "hidden", alignSelf: "center" }}>
        {(["desktop", "mobile"] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: "6px 24px", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
            textTransform: "uppercase", cursor: "pointer", border: "none",
            background: mode === m ? "#333" : "white",
            color: mode === m ? "white" : "#333",
            transition: "all 0.15s",
          }}>{m}</button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ background: "white", borderRadius: 10, padding: "16px 24px",
        width: "100%", maxWidth: 560, boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#333" }}>
          {mode === "mobile" ? "Mobile" : "Desktop"} card position
        </div>

        <Slider label="Top"    value={v.top}   min={20}  max={75}  onChange={set("top")}   unit="%" />
        <Slider label="Width"  value={v.width} min={30}  max={95}  onChange={set("width")} unit="%" />
        <Slider label="Left"   value={v.left}  min={20}  max={80}  onChange={set("left")}  unit="%" />
        <Slider label="Height" value={v.scale} min={50}  max={180} onChange={set("scale")} unit="%" />

        <div style={{ marginTop: 4, padding: "8px 12px", background: "#f4f0e8", borderRadius: 6,
          fontSize: 11, fontFamily: "monospace", color: "#555", lineHeight: 2 }}>
          <strong>desktop:</strong> top:{vals.desktop.top}% · width:{vals.desktop.width}% · left:{vals.desktop.left}% · scaleY:{(vals.desktop.scale/100).toFixed(2)}<br/>
          <strong>mobile: </strong> top:{vals.mobile.top}% · width:{vals.mobile.width}% · left:{vals.mobile.left}% · scaleY:{(vals.mobile.scale/100).toFixed(2)}
        </div>
      </div>

      {/* Preview */}
      <div style={{ width: previewWidth, transition: "width 0.3s" }}>
        <div style={{ position: "relative", width: "100%" }}>
          <div style={{
            position: "absolute",
            top: `${v.top}%`,
            left: `${v.left}%`,
            transform: `translateX(-50%) scaleY(${v.scale / 100})`,
            transformOrigin: "top center",
            width: `${v.width}%`,
            zIndex: 1,
            background: "#4a6741",
            borderRadius: 2,
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
          }}>
            <div style={{ border: "6px solid #c8a84b", padding: 0 }}>
              <div style={{ background: "#4a6741", padding: "12px 16px", textAlign: "center",
                borderBottom: "3px solid #1a1a1a" }}>
                <div style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.35em",
                  color: "#e8dfc0", opacity: 0.65, marginBottom: 4 }}>Established 2026</div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 900,
                  letterSpacing: "0.1em", textTransform: "uppercase", color: "#e8dfc0",
                  textShadow: "1px 1px 0 rgba(0,0,0,0.5)", lineHeight: 1 }}>Spencer's</div>
                <div style={{ fontSize: 7, textTransform: "uppercase", letterSpacing: "0.3em",
                  color: "#e8dfc0", opacity: 0.7, marginTop: 4 }}>Recipe Emporium</div>
              </div>
              <div style={{ height: 7, background: "repeating-linear-gradient(90deg,#3d7c6a 0px,#3d7c6a 4px,#c8a84b 4px,#c8a84b 8px)" }} />
              <div style={{ height: 2, background: "#b06070" }} />
              <div style={{ background: "#f5edcc", padding: "10px 12px 12px" }}>
                <div style={{ fontSize: 9, fontStyle: "italic", color: "#333", opacity: 0.65,
                  textAlign: "center", marginBottom: 8 }}>Present your credentials to enter the emporium</div>
                <div style={{ border: "2px solid #222", background: "#fdf6e0",
                  padding: "6px 8px", fontSize: 11, color: "#999", marginBottom: 8 }}>Password</div>
                <div style={{ background: "#7a8d5c", padding: "6px", textAlign: "center",
                  fontSize: 10, color: "#f0ead0", fontWeight: 700, letterSpacing: "0.18em",
                  textTransform: "uppercase" }}>Enter</div>
              </div>
            </div>
          </div>

          <img src={mansHeadUrl} alt=""
            style={{ width: "100%", display: "block", position: "relative", zIndex: 2, pointerEvents: "none" }} />
        </div>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, onChange, unit }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; unit: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 44, fontSize: 12, color: "#666", fontWeight: 600 }}>{label}</div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ flex: 1, cursor: "pointer" }} />
      <div style={{ width: 44, textAlign: "right", fontSize: 13, fontWeight: 700,
        fontFamily: "monospace", color: "#333" }}>
        {value}{unit}
      </div>
    </div>
  );
}
