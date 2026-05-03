import { useState } from "react";
import mansHeadUrl from "./mans-head.svg";

export function LoginTuner() {
  const [top, setTop]     = useState(40);
  const [width, setWidth] = useState(57);
  const [left, setLeft]   = useState(50);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
      minHeight: "100vh", background: "#b8cdd4", padding: "24px 16px", gap: 24, fontFamily: "sans-serif" }}>

      {/* Controls */}
      <div style={{ background: "white", borderRadius: 10, padding: "16px 24px", width: "100%",
        maxWidth: 560, boxShadow: "0 2px 10px rgba(0,0,0,0.12)", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "#333" }}>
          Login card position tuner
        </div>

        <Slider label="Top" value={top} min={20} max={75} onChange={setTop} unit="%" />
        <Slider label="Width" value={width} min={30} max={90} onChange={setWidth} unit="%" />
        <Slider label="Left" value={left} min={20} max={80} onChange={setLeft} unit="%" />

        <div style={{ marginTop: 8, padding: "8px 12px", background: "#f4f0e8", borderRadius: 6,
          fontSize: 12, fontFamily: "monospace", color: "#555", lineHeight: 1.8 }}>
          top: "{top}%"<br/>
          width: "{width}%"<br/>
          left: "{left}%"
        </div>
      </div>

      {/* Preview */}
      <div style={{ position: "relative", width: "min(100%, 400px)" }}>
        {/* Card behind */}
        <div style={{
          position: "absolute",
          top: `${top}%`,
          left: `${left}%`,
          transform: "translateX(-50%)",
          width: `${width}%`,
          zIndex: 1,
          background: "#4a6741",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
        }}>
          {/* Gold frame border */}
          <div style={{ border: "6px solid #c8a84b", padding: 0 }}>
            {/* Green header */}
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
            {/* Cable band */}
            <div style={{ height: 7, background: "repeating-linear-gradient(90deg,#3d7c6a 0px,#3d7c6a 4px,#c8a84b 4px,#c8a84b 8px)" }} />
            {/* Rose stripe */}
            <div style={{ height: 2, background: "#b06070" }} />
            {/* Form area */}
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

        {/* Man's head on top */}
        <img src={mansHeadUrl} alt=""
          style={{ width: "100%", display: "block", position: "relative", zIndex: 2, pointerEvents: "none" }} />
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
