import { useTheme } from "@/lib/theme-context";
import type { ThemeColors } from "@/lib/theme";

/** Width of the ornamental border strip on all four sides, in px */
const BW = 18;

/** Per-variant corner background + ornament colours */
const CORNER_CFG: Array<(c: ThemeColors) => { bg: string; orn: string }> = [
  c => ({ bg: c.black,  orn: c.gold   }),  // V0 diamond
  c => ({ bg: c.black,  orn: c.gold   }),  // V1 greek-key
  c => ({ bg: c.maroon, orn: c.gold   }),  // V2 diagonal
  c => ({ bg: c.teal,   orn: c.gold   }),  // V3 cross
  c => ({ bg: c.ink,    orn: c.gold   }),  // V4 oval
  c => ({ bg: c.maroon, orn: c.gold   }),  // V5 circle-star
  c => ({ bg: c.black,  orn: c.cream  }),  // V6 S-wave
];

function CornerOrnament({ c, variant }: { c: ThemeColors; variant: number }) {
  const { bg, orn } = CORNER_CFG[variant % CORNER_CFG.length](c);
  return (
    <div style={{
      width: BW, height: BW, flexShrink: 0,
      backgroundColor: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        backgroundColor: orn,
        boxShadow: `0 0 0 1.5px ${bg}, 0 0 0 3px ${orn}`,
      }} />
    </div>
  );
}

/**
 * A Victorian label-style frame with one of 7 encaustic-tile-inspired border
 * patterns on all four sides, inspired by the Threlkeld Granite catalogue.
 * Pass `variant` (0–6) to choose the pattern; all colours derive from the
 * live site theme so they update when the theme changes.
 */
export function LabelFrame({
  children,
  style,
  className,
  variant = 0,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  variant?: number;
}) {
  const { colors: c, patterns: p } = useTheme();
  const borderPattern = p.borderVariants[variant % p.borderVariants.length];
  const stripBase = {
    backgroundImage: borderPattern,
    backgroundSize: `${BW}px ${BW}px`,
  };

  return (
    <div className={className} style={{ border: `2px solid ${c.black}`, ...style }}>
      {/* ── Top row ── */}
      <div style={{ display: "flex", height: BW }}>
        <CornerOrnament c={c} variant={variant} />
        <div style={{ flex: 1, ...stripBase, backgroundRepeat: "repeat-x" }} />
        <CornerOrnament c={c} variant={variant} />
      </div>

      {/* ── Middle row ── */}
      <div style={{ display: "flex" }}>
        <div style={{ width: BW, flexShrink: 0, ...stripBase, backgroundRepeat: "repeat-y" }} />
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        <div style={{ width: BW, flexShrink: 0, ...stripBase, backgroundRepeat: "repeat-y" }} />
      </div>

      {/* ── Bottom row ── */}
      <div style={{ display: "flex", height: BW }}>
        <CornerOrnament c={c} variant={variant} />
        <div style={{ flex: 1, ...stripBase, backgroundRepeat: "repeat-x" }} />
        <CornerOrnament c={c} variant={variant} />
      </div>
    </div>
  );
}
