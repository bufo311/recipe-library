import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  type ThemeColors, DEFAULT_THEME, loadTheme, saveTheme, makeBgPattern, makePatterns,
} from "./theme";

interface ThemeCtx {
  colors:      ThemeColors;
  patterns:    ReturnType<typeof makePatterns>;
  updateColor: (key: keyof ThemeColors, value: string) => void;
  resetTheme:  () => void;
}

const Ctx = createContext<ThemeCtx>(null!);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colors, setColors] = useState<ThemeColors>(loadTheme);
  const styleRef = useRef<HTMLStyleElement | null>(null);

  /* Write a <style> block that sets the body background whenever bg or teal changes */
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
    setColors({ ...DEFAULT_THEME });
    saveTheme({ ...DEFAULT_THEME });
  };

  return (
    <Ctx.Provider value={{ colors, patterns: makePatterns(colors), updateColor, resetTheme }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  return useContext(Ctx);
}
