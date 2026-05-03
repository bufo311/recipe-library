export interface ThemeColors {
  maroon:  string;
  teal:    string;
  gold:    string;
  rose:    string;
  cream:   string;
  parch:   string;
  black:   string;
  ink:     string;
  powder:  string;
  sage:    string;
  bg:      string;
}

export const DEFAULT_THEME: ThemeColors = {
  maroon:  "#4A1520",
  teal:    "#3D7A72",
  gold:    "#C8A020",
  rose:    "#C05870",
  cream:   "#F5EEE0",
  parch:   "#E8D5A8",
  black:   "#140A04",
  ink:     "#1E0E04",
  powder:  "#A8CBCF",
  sage:    "#5E7A58",
  bg:      "#C8DDE0",
};

export const THEME_LABELS: Record<keyof ThemeColors, { name: string; use: string }> = {
  maroon:  { name: "Maroon",       use: "Left column, wax seal, dark accents" },
  teal:    { name: "Teal",         use: "Info bands, cable pattern, links" },
  gold:    { name: "Gold",         use: "Lettering, rules, ornamental borders" },
  rose:    { name: "Rose",         use: "Accent strips, filter pills, highlights" },
  cream:   { name: "Cream",        use: "Text on dark backgrounds, paper areas" },
  parch:   { name: "Parchment",    use: "Alternating table rows, form areas" },
  black:   { name: "Near-black",   use: "Outer frames, nav header, title bands" },
  ink:     { name: "Ink",          use: "Body text, borders, labels" },
  powder:  { name: "Powder blue",  use: "Image tile backgrounds" },
  sage:    { name: "Sage green",   use: "Title bands — MILLS-style backgrounds" },
  bg:      { name: "Background",   use: "Page wallpaper (tile pattern base)" },
};

const STORAGE_KEY = "spencers-theme";

export function loadTheme(): ThemeColors {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_THEME };
    return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_THEME };
  }
}

export function saveTheme(t: ThemeColors): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

/** Generate the SVG body-background tile pattern as a data URL */
export function makeBgPattern(bg: string, teal: string): string {
  const b  = encodeURIComponent(bg);
  const t  = encodeURIComponent(teal);
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Crect width='24' height='24' fill='${b}'/%3E%3Ccircle cx='12' cy='12' r='2' fill='none' stroke='${t}' stroke-width='0.7' opacity='0.35'/%3E%3Cpath d='M12 4 L12 20 M4 12 L20 12' stroke='${t}' stroke-width='0.5' opacity='0.18'/%3E%3Ccircle cx='0' cy='0' r='1' fill='${t}' opacity='0.22'/%3E%3Ccircle cx='24' cy='0' r='1' fill='${t}' opacity='0.22'/%3E%3Ccircle cx='0' cy='24' r='1' fill='${t}' opacity='0.22'/%3E%3Ccircle cx='24' cy='24' r='1' fill='${t}' opacity='0.22'/%3E%3C/svg%3E")`;
}

/** Build SVG data URLs for all repeating border patterns */
export function makePatterns(c: ThemeColors) {
  const enc = (v: string) => encodeURIComponent(v);
  return {
    eggDartDark: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12'%3E%3Crect width='20' height='12' fill='${enc(c.black)}'/%3E%3Cellipse cx='10' cy='6' rx='8' ry='3.5' fill='${enc(c.gold)}' opacity='0.3'/%3E%3Cellipse cx='10' cy='6' rx='5.5' ry='2' fill='${enc(c.black)}'/%3E%3Ccircle cx='0' cy='6' r='2' fill='${enc(c.gold)}' opacity='0.45'/%3E%3Ccircle cx='20' cy='6' r='2' fill='${enc(c.gold)}' opacity='0.45'/%3E%3C/svg%3E")`,
    eggDartMaroon: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12'%3E%3Crect width='20' height='12' fill='${enc(c.maroon)}'/%3E%3Cellipse cx='10' cy='6' rx='8' ry='3.5' fill='${enc(c.gold)}' opacity='0.28'/%3E%3Cellipse cx='10' cy='6' rx='5.5' ry='2' fill='${enc(c.maroon)}'/%3E%3Ccircle cx='0' cy='6' r='2' fill='${enc(c.gold)}' opacity='0.4'/%3E%3Ccircle cx='20' cy='6' r='2' fill='${enc(c.gold)}' opacity='0.4'/%3E%3C/svg%3E")`,
    cableTeal: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='10'%3E%3Crect width='20' height='10' fill='${enc(c.teal)}'/%3E%3Cpath d='M0 5 Q5 1 10 5 Q15 9 20 5' fill='none' stroke='${enc(c.cream)}' stroke-width='0.9' opacity='0.35'/%3E%3Cpath d='M0 5 Q5 9 10 5 Q15 1 20 5' fill='none' stroke='${enc(c.cream)}' stroke-width='0.9' opacity='0.35'/%3E%3C/svg%3E")`,
    chevronGold: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='8'%3E%3Crect width='16' height='8' fill='${enc(c.gold)}'/%3E%3Cpath d='M0 4 L4 1 L8 4 L12 1 L16 4 L12 7 L8 4 L4 7 Z' fill='none' stroke='${enc(c.black)}' stroke-width='0.7' opacity='0.35'/%3E%3C/svg%3E")`,
    powderTile: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='20' height='20' fill='${enc(c.powder)}'/%3E%3Ccircle cx='10' cy='10' r='1.5' fill='none' stroke='${enc(c.teal)}' stroke-width='0.6' opacity='0.4'/%3E%3Cpath d='M10 3 L10 17 M3 10 L17 10' stroke='${enc(c.teal)}' stroke-width='0.4' opacity='0.2'/%3E%3C/svg%3E")`,
    /** 18×18 square tile — touching-diamond chain, identical in X and Y.
     *  Use for LabelFrame side strips so all 4 borders look the same. */
    diamondBorder: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18'%3E%3Crect width='18' height='18' fill='${enc(c.black)}'/%3E%3Cpolygon points='9%2C0 18%2C9 9%2C18 0%2C9' fill='none' stroke='${enc(c.gold)}' stroke-width='1.5'/%3E%3Cpolygon points='9%2C3 15%2C9 9%2C15 3%2C9' fill='${enc(c.gold)}' opacity='0.22'/%3E%3Ccircle cx='9' cy='9' r='2' fill='${enc(c.gold)}' opacity='0.5'/%3E%3C/svg%3E")`,
    /** 28×20 spaced diamond on maroon — Vulcan-style header band.
     *  Each tile has one diamond with a faint interior cross, ~10px gap between diamonds. */
    spacedDiamond: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='20'%3E%3Crect width='28' height='20' fill='${enc(c.maroon)}'/%3E%3Cpolygon points='14%2C1 23%2C10 14%2C19 5%2C10' fill='none' stroke='${enc(c.gold)}' stroke-width='1.5'/%3E%3Cline x1='14' y1='4' x2='14' y2='16' stroke='${enc(c.gold)}' stroke-width='0.75' opacity='0.38'/%3E%3Cline x1='8' y1='10' x2='20' y2='10' stroke='${enc(c.gold)}' stroke-width='0.75' opacity='0.38'/%3E%3C/svg%3E")`,
  };
}
