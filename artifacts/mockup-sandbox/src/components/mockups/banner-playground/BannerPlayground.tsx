import { useEffect, useRef, useState } from "react";
import banner1Svg from "./banner-1.svg";
import banner2Svg from "./banner-2.svg";
import banner3Svg from "./banner-3.svg";

const C = {
  parch: "#f0e6c4", cream: "#faf5e1", sage: "#5a7355", teal: "#2e6263",
  maroon: "#8b2a25", gold: "#c9a04f", rose: "#d97862", ink: "#1a1a1a",
  black: "#0a0a0a", powder: "#bfd7df",
};

type Pos = { leftPct: number; topPct: number; widthPct: number };
type CurvePts = { x1: number; y1: number; cx1: number; cy1: number; cx2: number; cy2: number; x2: number; y2: number };
type BannerState = { pos: Pos; curve: CurvePts };

const BANNERS = [
  { label: "Banner 1", src: banner1Svg },
  { label: "Banner 2", src: banner2Svg },
  { label: "Banner 3", src: banner3Svg },
];

const DEFAULT_POS: Pos = { leftPct: -33, topPct: -14.3, widthPct: 87.5 };
const DEFAULT_CURVE_1: CurvePts = { x1: 59.8, y1: 94.9, cx1: 116.2, cy1: 109.2, cx2: 185.1, cy2: 23.1, x2: 237.4, y2: 59.6 };
const DEFAULT_CURVE_FLAT: CurvePts = { x1: 50, y1: 72, cx1: 110, cy1: 72, cx2: 178, cy2: 72, x2: 238, y2: 72 };

const DEFAULT_STATES: BannerState[] = [
  { pos: { ...DEFAULT_POS }, curve: { ...DEFAULT_CURVE_1 } },
  { pos: { ...DEFAULT_POS }, curve: { ...DEFAULT_CURVE_FLAT } },
  { pos: { ...DEFAULT_POS }, curve: { ...DEFAULT_CURVE_FLAT } },
];

export function BannerPlayground() {
  const cardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [states, setStates] = useState<BannerState[]>(() => DEFAULT_STATES.map(s => ({ pos: { ...s.pos }, curve: { ...s.curve } })));
  const [dragging, setDragging] = useState<null | "move" | "resize" | "p1" | "pc1" | "pc2" | "p2" | "curve">(null);
  const dragStart = useRef<{ mx: number; my: number; pos: Pos; curve: CurvePts } | null>(null);

  const active = states[activeIdx];
  const pos = active.pos;
  const curve = active.curve;

  function updateActive(updater: (s: BannerState) => BannerState) {
    setStates(prev => prev.map((s, i) => (i === activeIdx ? updater(s) : s)));
  }
  function setPos(next: Pos) { updateActive(s => ({ ...s, pos: next })); }
  function setCurve(next: CurvePts) { updateActive(s => ({ ...s, curve: next })); }

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging || !dragStart.current || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const dxPct = (dx / rect.width) * 100;
      const dyPct = (dy / rect.height) * 100;
      const svgEl = svgRef.current;
      const svgRect = svgEl?.getBoundingClientRect();
      const dxSvg = svgRect ? (dx / svgRect.width) * 288 : 0;
      const dySvg = svgRect ? (dy / svgRect.height) * 144 : 0;
      const cs = dragStart.current.curve;
      if (dragging === "move") {
        setPos({ leftPct: dragStart.current.pos.leftPct + dxPct,
          topPct: dragStart.current.pos.topPct + dyPct, widthPct: dragStart.current.pos.widthPct });
      } else if (dragging === "resize") {
        setPos({ leftPct: dragStart.current.pos.leftPct, topPct: dragStart.current.pos.topPct,
          widthPct: Math.max(20, Math.min(150, dragStart.current.pos.widthPct + dxPct)) });
      } else if (dragging === "p1") {
        setCurve({ ...cs, x1: cs.x1 + dxSvg, y1: cs.y1 + dySvg });
      } else if (dragging === "pc1") {
        setCurve({ ...cs, cx1: cs.cx1 + dxSvg, cy1: cs.cy1 + dySvg });
      } else if (dragging === "pc2") {
        setCurve({ ...cs, cx2: cs.cx2 + dxSvg, cy2: cs.cy2 + dySvg });
      } else if (dragging === "p2") {
        setCurve({ ...cs, x2: cs.x2 + dxSvg, y2: cs.y2 + dySvg });
      } else if (dragging === "curve") {
        setCurve({ x1: cs.x1 + dxSvg, y1: cs.y1 + dySvg,
          cx1: cs.cx1 + dxSvg, cy1: cs.cy1 + dySvg,
          cx2: cs.cx2 + dxSvg, cy2: cs.cy2 + dySvg,
          x2: cs.x2 + dxSvg, y2: cs.y2 + dySvg });
      }
    }
    function onUp() { setDragging(null); dragStart.current = null; }
    if (!dragging) return;
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging, activeIdx]);

  function startDrag(e: React.MouseEvent, kind: NonNullable<typeof dragging>) {
    e.preventDefault(); e.stopPropagation();
    dragStart.current = { mx: e.clientX, my: e.clientY, pos, curve };
    setDragging(kind);
  }

  const curvePath = `M ${curve.x1.toFixed(1)} ${curve.y1.toFixed(1)} C ${curve.cx1.toFixed(1)} ${curve.cy1.toFixed(1)} ${curve.cx2.toFixed(1)} ${curve.cy2.toFixed(1)} ${curve.x2.toFixed(1)} ${curve.y2.toFixed(1)}`;
  const title = "Classic Chocolate Chip Cookie";
  const fontSize = title.length > 28 ? 13 : title.length > 20 ? 15 : 18;

  return (
    <div className="min-h-screen p-8 flex flex-col gap-4" style={{ background: C.powder, fontFamily: "system-ui, sans-serif" }}>
      {/* Banner switcher */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {BANNERS.map((b, i) => (
          <button key={i} onClick={() => setActiveIdx(i)}
            style={{
              background: i === activeIdx ? C.maroon : C.cream,
              color: i === activeIdx ? C.cream : C.ink,
              border: `2px solid ${C.ink}`, padding: "8px 16px",
              fontFamily: "monospace", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
            {b.label}
          </button>
        ))}
      </div>

      {/* Live readout */}
      <div style={{ background: C.cream, border: `2px solid ${C.ink}`, padding: "12px 16px",
        fontFamily: "monospace", fontSize: 13, lineHeight: 1.6, color: C.ink }}>
        <div style={{ fontWeight: 700, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>📋 Editing {BANNERS[activeIdx].label} — values for the agent:</span>
          <button
            onClick={() => updateActive(() => ({ pos: { ...DEFAULT_STATES[activeIdx].pos }, curve: { ...DEFAULT_STATES[activeIdx].curve } }))}
            style={{ background: C.maroon, color: C.cream, border: `2px solid ${C.ink}`,
              padding: "4px 12px", fontFamily: "monospace", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
            ↺ Reset this banner
          </button>
        </div>
        <div>left: <b>{pos.leftPct.toFixed(1)}%</b> &nbsp; top: <b>{pos.topPct.toFixed(1)}%</b> &nbsp; width: <b>{pos.widthPct.toFixed(1)}%</b></div>
        <div>curve: <b>"{curvePath}"</b></div>
        <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7 }}>
          Drag banner to move • Gold handle (bottom-right) resizes • Drag the dashed red curve to slide the text • Drag the green/blue dots to reshape the curve
        </div>
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
              <img src={BANNERS[activeIdx].src} alt="" draggable={false}
                style={{ width: "100%", height: "100%", display: "block",
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.35))" }} />
              <svg ref={svgRef} viewBox="0 0 288 144" preserveAspectRatio="xMidYMid meet"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                <defs><path id="banner-curve" d={curvePath} fill="none" /></defs>
                <text fontFamily="'Playfair Display', Georgia, serif" fontWeight={700} fontSize={fontSize}
                  fill={C.ink} textAnchor="middle" letterSpacing="0.3">
                  <textPath href="#banner-curve" startOffset="50%">{title}</textPath>
                </text>
                {/* Draggable curve (thick invisible hit area + visible dashed line) */}
                <path d={curvePath} stroke="transparent" strokeWidth="10" fill="none"
                  style={{ cursor: dragging === "curve" ? "grabbing" : "grab", pointerEvents: "stroke" }}
                  onMouseDown={(e) => startDrag(e, "curve")} />
                <path d={curvePath} stroke="rgba(255,0,0,0.5)" strokeWidth="0.6" fill="none"
                  strokeDasharray="2 2" style={{ pointerEvents: "none" }} />
                {/* Tangent guide lines from endpoints to their control points */}
                <line x1={curve.x1} y1={curve.y1} x2={curve.cx1} y2={curve.cy1}
                  stroke="rgba(34,197,94,0.5)" strokeWidth="0.4" strokeDasharray="1 1" style={{ pointerEvents: "none" }} />
                <line x1={curve.x2} y1={curve.y2} x2={curve.cx2} y2={curve.cy2}
                  stroke="rgba(34,197,94,0.5)" strokeWidth="0.4" strokeDasharray="1 1" style={{ pointerEvents: "none" }} />
                {/* Endpoint and control handles */}
                <circle cx={curve.x1} cy={curve.y1} r={3.5} fill="#3b82f6" stroke="white" strokeWidth="0.8"
                  style={{ cursor: "grab", pointerEvents: "all" }} onMouseDown={(e) => startDrag(e, "p1")} />
                <circle cx={curve.cx1} cy={curve.cy1} r={3.5} fill="#22c55e" stroke="white" strokeWidth="0.8"
                  style={{ cursor: "grab", pointerEvents: "all" }} onMouseDown={(e) => startDrag(e, "pc1")} />
                <circle cx={curve.cx2} cy={curve.cy2} r={3.5} fill="#22c55e" stroke="white" strokeWidth="0.8"
                  style={{ cursor: "grab", pointerEvents: "all" }} onMouseDown={(e) => startDrag(e, "pc2")} />
                <circle cx={curve.x2} cy={curve.y2} r={3.5} fill="#3b82f6" stroke="white" strokeWidth="0.8"
                  style={{ cursor: "grab", pointerEvents: "all" }} onMouseDown={(e) => startDrag(e, "p2")} />
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
