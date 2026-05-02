// Source: King Arthur Baking Ingredient Weight Chart
// https://www.kingarthurbaking.com/learn/ingredient-weight-chart

// Helper: build per-cup entry with derived tablespoon/teaspoon values
const c = (cup: number) => ({
  cup,
  tablespoon: Math.round((cup / 16) * 1000) / 1000,
  teaspoon: Math.round((cup / 48) * 1000) / 1000,
  tbsp: Math.round((cup / 16) * 1000) / 1000,
  tsp: Math.round((cup / 48) * 1000) / 1000,
});

// Helper: build tablespoon-only entry with derived teaspoon value
const t = (tbsp: number) => ({
  tablespoon: tbsp,
  teaspoon: Math.round((tbsp / 3) * 1000) / 1000,
  tbsp,
  tsp: Math.round((tbsp / 3) * 1000) / 1000,
});

// ── Flours ────────────────────────────────────────────────────────────────
const FLOURS: Record<string, ReturnType<typeof c>> = {
  "all-purpose flour":   c(120),
  "flour":               c(120),
  "bread flour":         c(120),
  "whole wheat flour":   c(113),
  "whole-wheat flour":   c(113),
  "cake flour":          c(120),
  "self-rising flour":   c(113),
  "pastry flour":        c(106),
  "almond flour":        c(96),
  "almond meal":         c(84),
  "buckwheat flour":     c(120),
  "coconut flour":       c(128),
  "oat flour":           c(92),
  "rye flour":           c(106),
  "medium rye flour":    c(106),
  "rice flour":          c(142),
  "brown rice flour":    c(128),
  "semolina flour":      c(163),
  "semolina":            c(163),
  "cornmeal":            c(138),
  "chickpea flour":      c(85),
  "spelt flour":         c(99),
  "teff flour":          c(135),
  "sorghum flour":       c(138),
  "amaranth flour":      c(103),
  "hazelnut flour":      c(89),
  "masa harina":         c(93),
  "potato flour":        c(184),  // 1/4 cup = 46g → 1 cup = 184g
  "potato starch":       c(152),
  "tapioca starch":      c(113),
  "tapioca flour":       c(113),
  "cornstarch":          c(112),  // 1/4 cup = 28g → 1 cup = 112g
  "corn starch":         c(112),
  "arrowroot":           c(112),
};

// ── Sugars ───────────────────────────────────────────────────────────────
const SUGARS: Record<string, ReturnType<typeof c>> = {
  "granulated sugar":    c(198),
  "sugar":               c(198),
  "white sugar":         c(198),
  "brown sugar":         c(213),
  "dark brown sugar":    c(213),
  "light brown sugar":   c(213),
  "powdered sugar":      c(113),
  "confectioners sugar": c(113),
  "confectioners' sugar": c(113),
  "icing sugar":         c(113),
  "coconut sugar":       c(154),  // 1/2 cup = 77g → 1 cup = 154g
  "maple sugar":         c(156),  // 1/2 cup = 78g → 1 cup = 156g
  "turbinado sugar":     c(180),
  "raw sugar":           c(180),
  "demerara sugar":      c(220),
};

// ── Fats & oils ──────────────────────────────────────────────────────────
const FATS: Record<string, ReturnType<typeof c>> = {
  "butter":              c(226),  // 8 tbsp (1/2 cup) = 113g
  "unsalted butter":     c(226),
  "salted butter":       c(226),
  "ghee":                c(176),  // 1/4 cup = 44g
  "lard":                c(226),  // 1/2 cup = 113g
  "shortening":          c(184),  // 1/4 cup = 46g
  "coconut oil":         c(226),  // 1/2 cup = 113g
  "vegetable oil":       c(198),
  "canola oil":          c(198),
  "olive oil":           c(200),  // 1/4 cup = 50g
  "oil":                 c(198),
  "peanut oil":          c(198),
};

// ── Nut butters & spreads ────────────────────────────────────────────────
const SPREADS: Record<string, ReturnType<typeof c>> = {
  "peanut butter":       c(270),  // 1/2 cup = 135g
  "almond butter":       c(272),  // 1/4 cup = 68g
  "tahini":              c(256),  // 1/2 cup = 128g
  "tahini paste":        c(256),
  "nutella":             c(298),  // 1/2 cup = 149g
  "hazelnut spread":     c(320),  // 1/2 cup = 160g
  "cookie butter":       c(288),  // 1/4 cup = 72g
};

// ── Dairy & eggs ─────────────────────────────────────────────────────────
const DAIRY: Record<string, ReturnType<typeof c>> = {
  "milk":                c(227),
  "whole milk":          c(227),
  "buttermilk":          c(227),
  "cream":               c(227),
  "heavy cream":         c(227),
  "light cream":         c(227),
  "half and half":       c(227),
  "half & half":         c(227),
  "sour cream":          c(227),
  "cream cheese":        c(227),
  "yogurt":              c(227),
  "greek yogurt":        c(227),
  "ricotta":             c(227),
  "mascarpone":          c(227),
  "mascarpone cheese":   c(227),
  "condensed milk":      c(312),  // 1/4 cup = 78g → 1 cup = 312g
  "evaporated milk":     c(226),  // 1/2 cup = 113g
  "coconut milk":        c(241),
  "coconut cream":       c(284),
};

// ── Liquid sweeteners & syrups ───────────────────────────────────────────
const SYRUPS: Record<string, ReturnType<typeof c>> = {
  "honey":               c(336),  // 1 tbsp = 21g → 16 tbsp = 336g
  "maple syrup":         c(312),  // 1/2 cup = 156g
  "corn syrup":          c(312),
  "molasses":            c(340),  // 1/4 cup = 85g
  "agave syrup":         c(336),  // 1/4 cup = 84g
  "agave nectar":        c(336),
  "golden syrup":        c(312),
};

// ── Water & juices ───────────────────────────────────────────────────────
const LIQUIDS: Record<string, ReturnType<typeof c>> = {
  "water":               c(227),
  "applesauce":          c(255),
  "pumpkin puree":       c(227),
  "pumpkin purée":       c(227),
  "lemon juice":         t(14),
  "lime juice":          t(14),
  "orange juice":        c(227),
  "apple juice":         c(227),
};

// ── Chocolate & cocoa ────────────────────────────────────────────────────
const CHOCOLATE: Record<string, ReturnType<typeof c> | ReturnType<typeof t>> = {
  "cocoa powder":        c(84),   // 1/2 cup = 42g
  "cocoa":               c(84),
  "unsweetened cocoa":   c(84),
  "chocolate chips":     c(170),
  "mini chocolate chips": c(177),
  "white chocolate chips": c(170),
  "chocolate chunks":    c(170),
  "chocolate":           c(170),  // chopped chocolate
};

// ── Oats, grains & cereals ───────────────────────────────────────────────
const GRAINS: Record<string, ReturnType<typeof c>> = {
  "rolled oats":         c(89),   // old-fashioned
  "old-fashioned oats":  c(89),
  "quick oats":          c(89),
  "oats":                c(89),
  "steel cut oats":      c(140),  // 1/2 cup = 70g
  "breadcrumbs":         c(112),  // dried: 1/4 cup = 28g
  "bread crumbs":        c(112),
  "panko":               c(50),   // 1 cup = 50g
  "rice":                c(198),  // long grain dry: 1/2 cup = 99g
  "white rice":          c(198),
  "brown rice":          c(170),
  "quinoa":              c(177),
  "barley":              c(213),
  "bulgur":              c(152),
  "polenta":             c(163),
  "cornmeal whole":      c(138),
  "granola":             c(113),
  "flaxseed":            c(140),  // 1/4 cup = 35g
  "flax seed":           c(140),
  "chia seeds":          c(148),  // 1/4 cup = 37g
  "sesame seeds":        c(142),  // 1/2 cup = 71g
  "poppy seeds":         c(144),  // 2 tbsp = 18g → 1 cup = 144g
};

// ── Nuts ─────────────────────────────────────────────────────────────────
const NUTS: Record<string, ReturnType<typeof c>> = {
  "almonds":             c(142),
  "walnuts":             c(113),
  "pecans":              c(105),
  "hazelnuts":           c(142),
  "cashews":             c(113),
  "peanuts":             c(142),
  "macadamia nuts":      c(149),
  "pine nuts":           c(142),  // 1/2 cup = 71g
  "pistachios":          c(120),  // 1/2 cup = 60g
};

// ── Dried fruits ─────────────────────────────────────────────────────────
const DRIED_FRUITS: Record<string, ReturnType<typeof c>> = {
  "raisins":             c(149),
  "currants":            c(142),
  "dates":               c(149),
  "dried cranberries":   c(114),  // 1/2 cup = 57g
  "cranberries":         c(99),   // fresh
  "dried blueberries":   c(156),
  "dried cherries":      c(142),  // 1/2 cup = 71g → cup = 142g... wait, 71g/0.5cup=142g
  "dried apricots":      c(128),  // 1/2 cup = 64g
  "figs":                c(149),
};

// ── Vegetables & fruit (fresh) ───────────────────────────────────────────
const PRODUCE: Record<string, ReturnType<typeof c>> = {
  "onion":               c(142),
  "onions":              c(142),
  "carrots":             c(142),
  "celery":              c(142),
  "garlic":              c(149),
  "leeks":               c(92),
  "scallions":           c(64),   // KA: 1 cup = 64g... but wait, that was sliced not cup. Let me use 64g
  "mushrooms":           c(78),
  "zucchini":            c(135),  // avg of 121-150g range
  "blueberries":         c(155),
  "strawberries":        c(167),
  "raspberries":         c(120),
  "cherries":            c(113),
  "peaches":             c(170),
  "pears":               c(163),
  "apples":              c(113),
  "bananas":             c(227),
  "mashed banana":       c(227),
};

// ── Pantry staples ───────────────────────────────────────────────────────
const PANTRY: Record<string, ReturnType<typeof c> | ReturnType<typeof t>> = {
  "tomato paste":        t(14.5), // 2 tbsp = 29g
  "jam":                 c(340),  // 1/4 cup = 85g
  "preserves":           c(340),
  "vanilla extract":     t(14),
  "molasses":            c(340),
};

// ── Leaveners & seasonings ───────────────────────────────────────────────
// These are typically measured in tablespoons/teaspoons only
const LEAVENERS: Record<string, Record<string, number>> = {
  "baking powder": { tablespoon: 12, teaspoon: 4, tbsp: 12, tsp: 4 },
  "baking soda":   { tablespoon: 18, teaspoon: 6, tbsp: 18, tsp: 6 },
  "salt":          { tablespoon: 18, teaspoon: 6, tbsp: 18, tsp: 6 },
  "table salt":    { tablespoon: 18, teaspoon: 6, tbsp: 18, tsp: 6 },
  "kosher salt":   { tablespoon: 12, teaspoon: 4, tbsp: 12, tsp: 4 },  // Diamond Crystal avg
  "fine salt":     { tablespoon: 18, teaspoon: 6, tbsp: 18, tsp: 6 },
  "sea salt":      { tablespoon: 18, teaspoon: 6, tbsp: 18, tsp: 6 },
  "yeast":         { tablespoon: 9, teaspoon: 3, tbsp: 9, tsp: 3 },
  "instant yeast": { tablespoon: 9, teaspoon: 3, tbsp: 9, tsp: 3 },
  "active dry yeast": { tablespoon: 9, teaspoon: 3, tbsp: 9, tsp: 3 },
  "espresso powder": { tablespoon: 7, teaspoon: 2.3, tbsp: 7, tsp: 2.3 },
  "matcha powder": { tablespoon: 6, teaspoon: 2, tbsp: 6, tsp: 2 },
  "cinnamon":      { tablespoon: 8, teaspoon: 2.7, tbsp: 8, tsp: 2.7 },
  "garlic powder": { tablespoon: 9, teaspoon: 3, tbsp: 9, tsp: 3 },
  "onion powder":  { tablespoon: 9, teaspoon: 3, tbsp: 9, tsp: 3 },
  "paprika":       { tablespoon: 7, teaspoon: 2.3, tbsp: 7, tsp: 2.3 },
  "cumin":         { tablespoon: 6, teaspoon: 2, tbsp: 6, tsp: 2 },
  "black pepper":  { tablespoon: 6, teaspoon: 2, tbsp: 6, tsp: 2 },
  "pepper":        { tablespoon: 6, teaspoon: 2, tbsp: 6, tsp: 2 },
};

// ── Weight chart export ───────────────────────────────────────────────────

export interface WeightChartEntry {
  name: string;
  category: string;
  cup: number | null;
  tbsp: number | null;
  tsp: number | null;
}

export function getWeightChartData(): WeightChartEntry[] {
  const categories: Array<{ label: string; data: Record<string, Record<string, number>> }> = [
    { label: "Flours & Starches", data: FLOURS },
    { label: "Sugars", data: SUGARS },
    { label: "Fats & Oils", data: FATS },
    { label: "Nut Butters & Spreads", data: SPREADS },
    { label: "Dairy", data: DAIRY },
    { label: "Syrups & Sweeteners", data: SYRUPS },
    { label: "Liquids", data: LIQUIDS },
    { label: "Chocolate & Cocoa", data: CHOCOLATE },
    { label: "Oats & Grains", data: GRAINS },
    { label: "Nuts", data: NUTS },
    { label: "Dried Fruit", data: DRIED_FRUITS },
    { label: "Produce", data: PRODUCE },
    { label: "Pantry", data: PANTRY },
    { label: "Leaveners & Spices", data: LEAVENERS },
  ];
  return categories.flatMap(({ label, data }) =>
    Object.entries(data).map(([name, conversions]) => ({
      name,
      category: label,
      cup: (conversions.cup as number) ?? null,
      tbsp: (conversions.tbsp as number) ?? null,
      tsp: (conversions.tsp as number) ?? null,
    }))
  );
}

// ── Merge all categories ─────────────────────────────────────────────────
const GRAM_CONVERSIONS: Record<string, Record<string, number>> = {
  ...FLOURS,
  ...SUGARS,
  ...FATS,
  ...SPREADS,
  ...DAIRY,
  ...SYRUPS,
  ...LIQUIDS,
  ...CHOCOLATE,
  ...GRAINS,
  ...NUTS,
  ...DRIED_FRUITS,
  ...PRODUCE,
  ...PANTRY,
  ...LEAVENERS,
};

// ── Fraction parsing ─────────────────────────────────────────────────────

const FRACTIONS: Record<string, number> = {
  "½": 0.5,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 0.25,
  "¾": 0.75,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

function parseFraction(str: string): number | null {
  const trimmed = str.trim();

  // Plain unicode fraction: "½"
  if (FRACTIONS[trimmed] !== undefined) return FRACTIONS[trimmed];

  // Slash fraction: "3/4"
  if (/^\d+\/\d+$/.test(trimmed)) {
    const [num, den] = trimmed.split("/").map(Number);
    if (den !== 0) return num / den;
  }

  // Mixed number with slash: "2 1/3"
  const mixedSlash = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixedSlash) {
    return parseInt(mixedSlash[1]) + parseInt(mixedSlash[2]) / parseInt(mixedSlash[3]);
  }

  // Mixed number with unicode fraction: "2 ½"  ← this was the bug
  const mixedUni = trimmed.match(/^(\d+)\s+([½⅓⅔¼¾⅛⅜⅝⅞])$/u);
  if (mixedUni) {
    return parseInt(mixedUni[1]) + (FRACTIONS[mixedUni[2]] ?? 0);
  }

  const parsed = parseFloat(trimmed);
  return isNaN(parsed) ? null : parsed;
}

// ── Main conversion function ─────────────────────────────────────────────

export function convertIngredientToGrams(ingredient: string): string | null {
  const normalized = ingredient.toLowerCase().trim();

  const measurePattern =
    /([\d\s½⅓⅔¼¾⅛⅜⅝⅞\/\.]+)\s*(cups?|tablespoons?|teaspoons?|tbsps?|tsps?|tbs|ts)\b\s*(?:of\s+)?(.+)/i;

  const match = normalized.match(measurePattern);
  if (!match) return null;

  const [, quantityStr, unit, ingredientName] = match;

  const quantity = parseFraction(quantityStr.trim());
  if (quantity === null || quantity <= 0) return null;

  const unitNorm = unit.toLowerCase().replace(/s$/, "").trim();
  const unitKey =
    unitNorm.includes("table") || unitNorm === "tbs" || unitNorm.startsWith("tbsp")
      ? "tablespoon"
      : unitNorm.includes("tea") || unitNorm === "ts" || unitNorm.startsWith("tsp")
        ? "teaspoon"
        : "cup";

  const cleanName = ingredientName
    .replace(/,.*$/, "")
    .replace(/\(.*?\)/g, "")
    .trim();

  // Try exact match first, then partial
  const entries = Object.entries(GRAM_CONVERSIONS);
  for (const [known, conversions] of entries) {
    if (cleanName === known) {
      const gramsPerUnit = conversions[unitKey];
      if (gramsPerUnit !== undefined) {
        return `${Math.round(quantity * gramsPerUnit)}g ${cleanName}`;
      }
    }
  }
  for (const [known, conversions] of entries) {
    if (cleanName.includes(known) || known.includes(cleanName)) {
      const gramsPerUnit = conversions[unitKey];
      if (gramsPerUnit !== undefined) {
        return `${Math.round(quantity * gramsPerUnit)}g ${cleanName}`;
      }
    }
  }

  return null;
}
