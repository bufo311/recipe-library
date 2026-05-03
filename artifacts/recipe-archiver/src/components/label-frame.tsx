import { useTheme } from "@/lib/theme-context";
import type { ThemeColors } from "@/lib/theme";

/** Width of the ornamental border strip on all four sides, in px */
const BW = 18;

function CornerOrnament({ c }: { c: ThemeColors }) {
  return (
    <div style={{
      width: BW, height: BW, flexShrink: 0,
      backgroundColor: c.black,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        backgroundColor: c.gold,
        boxShadow: `0 0 0 1.5px ${c.black}, 0 0 0 3px ${c.gold}`,
      }} />
    </div>
  );
}

/**
 * A Victorian label-style frame with a repeating diamond chain on all four sides
 * and gold circle corner ornaments — like the Vulcan / El Aroma reference labels.
 */
export function LabelFrame({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  const { colors: c, patterns: p } = useTheme();
  const stripBase = {
    backgroundImage: p.diamondBorder,
    backgroundSize: `${BW}px ${BW}px`,
  };

  return (
    <div className={className} style={{ border: `2px solid ${c.black}`, ...style }}>
      {/* ── Top row ── */}
      <div style={{ display: "flex", height: BW }}>
        <CornerOrnament c={c} />
        <div style={{ flex: 1, ...stripBase, backgroundRepeat: "repeat-x" }} />
        <CornerOrnament c={c} />
      </div>

      {/* ── Middle row ── */}
      <div style={{ display: "flex" }}>
        <div style={{ width: BW, flexShrink: 0, ...stripBase, backgroundRepeat: "repeat-y" }} />
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        <div style={{ width: BW, flexShrink: 0, ...stripBase, backgroundRepeat: "repeat-y" }} />
      </div>

      {/* ── Bottom row ── */}
      <div style={{ display: "flex", height: BW }}>
        <CornerOrnament c={c} />
        <div style={{ flex: 1, ...stripBase, backgroundRepeat: "repeat-x" }} />
        <CornerOrnament c={c} />
      </div>
    </div>
  );
}
