import { useMemo } from "react";
import { useTheme } from "@/lib/theme-context";
import type { ThemeColors } from "@/lib/theme";

const BW = 18;

type Palette = { bg: string; p1: string; p2: string };

function makePalettes(c: ThemeColors): Palette[] {
  return [
    { bg: c.black,  p1: c.gold,  p2: c.cream },
    { bg: c.maroon, p1: c.gold,  p2: c.cream },
    { bg: c.teal,   p1: c.cream, p2: c.gold  },
    { bg: c.ink,    p1: c.gold,  p2: c.rose  },
    { bg: c.sage,   p1: c.cream, p2: c.gold  },
    { bg: c.maroon, p1: c.cream, p2: c.gold  },
    { bg: c.teal,   p1: c.gold,  p2: c.cream },
    { bg: c.black,  p1: c.rose,  p2: c.gold  },
    { bg: c.ink,    p1: c.cream, p2: c.gold  },
    { bg: c.sage,   p1: c.gold,  p2: c.rose  },
  ];
}

const PALETTE_COUNT = 10;

function CornerOrnament({ palette }: { palette: Palette }) {
  return (
    <div style={{
      width: BW, height: BW, flexShrink: 0,
      backgroundColor: palette.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        backgroundColor: palette.p1,
        boxShadow: `0 0 0 1.5px ${palette.bg}, 0 0 0 3px ${palette.p1}`,
      }} />
    </div>
  );
}

/**
 * Victorian label-style frame with one of 7 encaustic-tile-inspired border
 * patterns. Pass `variant` (0–6) to choose the pattern. The colour palette
 * is randomly selected per mount, so two frames sharing a variant can look
 * different. All colours derive from the live theme.
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
  const paletteIdx = useMemo(() => Math.floor(Math.random() * PALETTE_COUNT), []);
  const palette = makePalettes(c)[paletteIdx];

  const factory = p.borderVariants[variant % p.borderVariants.length];
  const stripBase = {
    backgroundImage: factory(palette.bg, palette.p1, palette.p2),
    backgroundSize: `${BW}px ${BW}px`,
  };

  return (
    <div className={className} style={{ border: `2px solid ${c.black}`, ...style }}>
      <div style={{ display: "flex", height: BW }}>
        <CornerOrnament palette={palette} />
        <div style={{ flex: 1, ...stripBase, backgroundRepeat: "repeat-x" }} />
        <CornerOrnament palette={palette} />
      </div>

      <div style={{ display: "flex" }}>
        <div style={{ width: BW, flexShrink: 0, ...stripBase, backgroundRepeat: "repeat-y" }} />
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
        <div style={{ width: BW, flexShrink: 0, ...stripBase, backgroundRepeat: "repeat-y" }} />
      </div>

      <div style={{ display: "flex", height: BW }}>
        <CornerOrnament palette={palette} />
        <div style={{ flex: 1, ...stripBase, backgroundRepeat: "repeat-x" }} />
        <CornerOrnament palette={palette} />
      </div>
    </div>
  );
}
