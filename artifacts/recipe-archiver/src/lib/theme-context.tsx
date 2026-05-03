import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  type ThemeColors, DEFAULT_THEME, loadTheme, saveTheme, loadCustomDefault, saveCustomDefault,
  makeBgPattern, makePatterns,
} from "./theme";

interface ThemeCtx {
  colors:            ThemeColors;
  activeDefault:     ThemeColors;
  patterns:          ReturnType<typeof makePatterns>;
  updateColor:       (key: keyof ThemeColors, value: string) => void;
  resetTheme:        () => void;
  overwriteDefaults: () => void;
}

const Ctx = createContext<ThemeCtx>(null!);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors]               = useState<ThemeColors>(loadTheme);
  const [activeDefault, setActiveDefault] = useState<ThemeColors>(() => loadCustomDefault() ?? DEFAULT_THEME);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    if (!styleRef.current) {
      const el = document.createElement("style");
      el.id = "spencers-bg-style";
      document.head.appendChild(el);
      styleRef.current = el;
    }
    styleRef.current.textContent = `body { background-color: ${colors.bg}; background-image: ${makeBgPattern(colors.bg, colors.teal)}; }`;
  }, [colors.bg, colors.teal]);

  const updateColor = (key: keyof ThemeColors, value: string) => {
    setColors(prev => {
      const next = { ...prev, [key]: value };
      saveTheme(next);
      return next;
    });
  };

  const resetTheme = () => {
    setColors({ ...activeDefault });
    saveTheme({ ...activeDefault });
  };

  const overwriteDefaults = () => {
    saveCustomDefault({ ...colors });
    setActiveDefault({ ...colors });
  };

  return (
    <Ctx.Provider value={{ colors, activeDefault, patterns: makePatterns(colors), updateColor, resetTheme, overwriteDefaults }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  return useContext(Ctx);
}
