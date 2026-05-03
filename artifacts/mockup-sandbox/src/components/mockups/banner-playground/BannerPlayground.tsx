import { useEffect, useRef, useState } from "react";
import bannerSvg from "./banner.svg";

const C = {
  parch: "#f0e6c4", cream: "#faf5e1", sage: "#5a7355", teal: "#2e6263",
  maroon: "#8b2a25", gold: "#c9a04f", rose: "#d97862", ink: "#1a1a1a",
  black: "#0a0a0a", powder: "#bfd7df",
};

type Pos = { leftPct: number; topPct: number; widthPct: number };
type CurvePts = { y1: number; cy: number; y2: number };

export function BannerPlayground() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<Pos>({ leftPct: -12, topPct: -18, widthPct: 70 });
  const [curve, setCurve] = useState<CurvePts>({ y1: 76, cy: 96, y2: 76 });
  const [dragging, setDragging] = useState<null | "move" | "resize">(null);
  const dragStart = useRef<{ mx: number; my: number; pos: Pos } | null>(null);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging || !dragStart.current || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const dxPct = (dx / rect.width) * 100;
      const dyPct = (dy / rect.height) * 100;
      if (dragging === "move") {
        setPos({
          leftPct: dragStart.current.pos.leftPct + dxPct,
          topPct: dragStart.current.pos.topPct + dyPct,
          widthPct: dragStart.current.pos.widthPct,
        });
      } else {
        setPos({
          leftPct: dragStart.current.pos.leftPct,
          topPct: dragStart.current.pos.topPct,
          widthPct: Math.max(20, Math.min(150, dragStart.current.pos.widthPct + dxPct)),
        });
      }
    }
    function onUp() { setDragging(null); dragStart.current = null; }
    if (dragging) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    }
  }, [dragging]);

  function startDrag(e: React.MouseEvent, kind: "move" | "resize") {
    e.preventDefault(); e.stopPropagation();
    dragStart.current = { mx: e.clientX, my: e.clientY, pos };
    setDragging(kind);
  }

  const curvePath = `M 78 ${curve.y1} Q 172 ${curve.cy} 266 ${curve.y2}`;
  const title = "Classic Chocolate Chip Cookie";
  const fontSize = title.length > 28 ? 13 : title.length > 20 ? 15 : 18;

  return (
    <div className="min-h-screen p-8 flex flex-col gap-4" style={{ background: C.powder, fontFamily: "system-ui, sans-serif" }}>
      {/* Live readout */}
      <div style={{ background: C.cream, border: `2px solid ${C.ink}`, padding: "12px 16px",
        fontFamily: "monospace", fontSize: 13, lineHeight: 1.6, color: C.ink }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>📋 Tell the agent these values:</div>
        <div>left: <b>{pos.leftPct.toFixed(1)}%</b> &nbsp; top: <b>{pos.topPct.toFixed(1)}%</b> &nbsp; width: <b>{pos.widthPct.toFixed(1)}%</b></div>
        <div>curve: <b>"M 78 {curve.y1} Q 172 {curve.cy} 266 {curve.y2}"</b></div>
        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7 }}>
          Drag the banner to move • Drag the orange handle (bottom-right) to resize • Use sliders below for curve
        </div>
      </div>

      {/* Curve sliders */}
      <div style={{ background: C.cream, border: `2px solid ${C.ink}`, padding: "10px 16px",
        display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "6px 12px", alignItems: "center",
        fontFamily: "monospace", fontSize: 12 }}>
        <label>Left end Y ({curve.y1})</label>
        <input type="range" min={40} max={120} value={curve.y1} onChange={e => setCurve(v => ({ ...v, y1: +e.target.value }))} />
        <span style={{ width: 30 }}>{curve.y1}</span>
        <label>Middle Y ({curve.cy})</label>
        <input type="range" min={40} max={140} value={curve.cy} onChange={e => setCurve(v => ({ ...v, cy: +e.target.value }))} />
        <span style={{ width: 30 }}>{curve.cy}</span>
        <label>Right end Y ({curve.y2})</label>
        <input type="range" min={40} max={120} value={curve.y2} onChange={e => setCurve(v => ({ ...v, y2: +e.target.value }))} />
        <span style={{ width: 30 }}>{curve.y2}</span>
      </div>

      {/* Mock recipe card */}
      <div ref={cardRef} style={{ position: "relative", maxWidth: 800, margin: "40px auto",
        border: `3px solid ${C.ink}`, background: C.parch, overflow: "visible" }}>
        {/* top accent */}
        <div style={{ height: 8, background: `repeating-linear-gradient(45deg, ${C.gold} 0 6px, ${C.maroon} 6px 12px)` }} />
        <div style={{ height: 3, background: C.rose }} />

        {/* Title zone (sage) */}
        <div style={{ background: C.sage, padding: "1.5rem 2rem", position: "relative",
          overflow: "visible", minHeight: 170 }}>
          {/* Banner overlay */}
          <div
            onMouseDown={(e) => startDrag(e, "move")}
            style={{
              position: "absolute",
              left: `${pos.leftPct}%`,
              top: `${pos.topPct}%`,
              width: `${pos.widthPct}%`,
              cursor: dragging === "move" ? "grabbing" : "grab",
              zIndex: 3,
              userSelect: "none",
            }}>
            <div style={{ position: "relative", width: "100%", aspectRatio: "288 / 144", pointerEvents: "none" }}>
              <img src={bannerSvg} alt="" draggable={false}
                style={{ width: "100%", height: "100%", display: "block",
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.35))" }} />
              <svg viewBox="0 0 288 144" preserveAspectRatio="xMidYMid meet"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                <defs><path id="banner-curve" d={curvePath} fill="none" /></defs>
                <text fontFamily="'Playfair Display', Georgia, serif" fontWeight={700} fontSize={fontSize}
                  fill={C.ink} textAnchor="middle" letterSpacing="0.3">
                  <textPath href="#banner-curve" startOffset="50%">{title}</textPath>
                </text>
                {/* Visualize the curve path itself in red so user can see where text sits */}
                <path d={curvePath} stroke="rgba(255,0,0,0.4)" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
              </svg>
            </div>
            {/* Resize handle (pointer events on this) */}
            <div
              onMouseDown={(e) => startDrag(e, "resize")}
              style={{ position: "absolute", right: -8, bottom: -8, width: 18, height: 18,
                background: C.gold, border: `2px solid ${C.ink}`, borderRadius: "50%",
                cursor: "ew-resize", zIndex: 4 }}
              title="Drag to resize width" />
          </div>

          {/* Right side mock controls (so layout matches real card) */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <div style={{ width: 84, height: 84, borderRadius: "50%", background: C.maroon,
              border: `3px solid rgba(0,0,0,0.4)`, outline: `2px solid ${C.gold}`, outlineOffset: -7,
              transform: "rotate(-10deg)", display: "flex", alignItems: "center", justifyContent: "center",
              color: C.cream, fontSize: 10, fontWeight: 700, fontFamily: "Georgia, serif", textAlign: "center" }}>
              DESSERT<br/>AMERICAN
            </div>
          </div>
        </div>

        {/* Post-title bands */}
        <div style={{ height: 3, background: C.rose }} />
        <div style={{ height: 12, background: `repeating-linear-gradient(90deg, ${C.maroon} 0 6px, ${C.gold} 6px 12px)` }} />

        {/* Info band (teal) */}
        <div style={{ background: C.teal, color: C.cream, padding: "12px 32px",
          display: "flex", gap: 24, fontFamily: "monospace", fontSize: 12 }}>
          <div>COURSE<br/><b>Dessert</b></div>
          <div>CUISINE<br/><b>American</b></div>
          <div>PREP<br/><b>15 min</b></div>
          <div>COOK TIME<br/><b>12 min</b></div>
          <div>YIELD<br/><b>5 dozen cookies</b></div>
        </div>

        {/* Mock body */}
        <div style={{ height: 200, background: C.parch, display: "flex",
          alignItems: "center", justifyContent: "center", color: C.ink, opacity: 0.4 }}>
          (recipe body)
        </div>
      </div>
    </div>
  );
}
