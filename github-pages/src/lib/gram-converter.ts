// Source: King Arthur Baking Ingredient Weight Chart
// https://www.kingarthurbaking.com/learn/ingredient-weight-chart

const c = (cup: number) => ({
  cup,
  tablespoon: Math.round((cup / 16) * 1000) / 1000,
  teaspoon: Math.round((cup / 48) * 1000) / 1000,
  tbsp: Math.round((cup / 16) * 1000) / 1000,
  tsp: Math.round((cup / 48) * 1000) / 1000,
});
const t = (tbsp: number) => ({
  tablespoon: tbsp,
  teaspoon: Math.round((tbsp / 3) * 1000) / 1000,
  tbsp,
  tsp: Math.round((tbsp / 3) * 1000) / 1000,
});

const GRAM_CONVERSIONS: Record<string, Record<string, number>> = {
  // ── Flours ──────────────────────────────────────────────────────────
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
  "potato starch":       c(152),
  "tapioca starch":      c(113),
  "tapioca flour":       c(113),
  "cornstarch":          c(112),
  "corn starch":         c(112),
  "arrowroot":           c(112),
  // ── Sugars ──────────────────────────────────────────────────────────
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
  "coconut sugar":       c(154),
  "maple sugar":         c(156),
  "turbinado sugar":     c(180),
  "raw sugar":           c(180),
  "demerara sugar":      c(220),
  // ── Fats & oils ─────────────────────────────────────────────────────
  "butter":              c(226),
  "unsalted butter":     c(226),
  "salted butter":       c(226),
  "ghee":                c(176),
  "lard":                c(226),
  "shortening":          c(184),
  "coconut oil":         c(226),
  "vegetable oil":       c(198),
  "canola oil":          c(198),
  "olive oil":           c(200),
  "oil":                 c(198),
  "peanut oil":          c(198),
  // ── Nut butters ─────────────────────────────────────────────────────
  "peanut butter":       c(270),
  "almond butter":       c(272),
  "tahini":              c(256),
  "tahini paste":        c(256),
  "nutella":             c(298),
  "hazelnut spread":     c(320),
  "cookie butter":       c(288),
  // ── Dairy ───────────────────────────────────────────────────────────
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
  "condensed milk":      c(312),
  "evaporated milk":     c(226),
  "coconut milk":        c(241),
  "coconut cream":       c(284),
  // ── Liquid sweeteners ───────────────────────────────────────────────
  "honey":               c(336),
  "maple syrup":         c(312),
  "corn syrup":          c(312),
  "molasses":            c(340),
  "agave syrup":         c(336),
  "agave nectar":        c(336),
  "golden syrup":        c(312),
  // ── Water & juices ──────────────────────────────────────────────────
  "water":               c(227),
  "applesauce":          c(255),
  "pumpkin puree":       c(227),
  "pumpkin purée":       c(227),
  "lemon juice":         t(14),
  "lime juice":          t(14),
  "orange juice":        c(227),
  "apple juice":         c(227),
  // ── Chocolate & cocoa ───────────────────────────────────────────────
  "cocoa powder":        c(84),
  "cocoa":               c(84),
  "unsweetened cocoa":   c(84),
  "chocolate chips":     c(170),
  "mini chocolate chips": c(177),
  "white chocolate chips": c(170),
  "chocolate chunks":    c(170),
  "chocolate":           c(170),
  // ── Oats, grains & cereals ──────────────────────────────────────────
  "rolled oats":         c(89),
  "old-fashioned oats":  c(89),
  "quick oats":          c(89),
  "oats":                c(89),
  "steel cut oats":      c(140),
  "breadcrumbs":         c(112),
  "bread crumbs":        c(112),
  "panko":               c(50),
  "rice":                c(198),
  "white rice":          c(198),
  "brown rice":          c(170),
  "quinoa":              c(177),
  "barley":              c(213),
  "bulgur":              c(152),
  "polenta":             c(163),
  "granola":             c(113),
  "flaxseed":            c(140),
  "flax seed":           c(140),
  "chia seeds":          c(148),
  "sesame seeds":        c(142),
  "poppy seeds":         c(144),
  // ── Nuts ────────────────────────────────────────────────────────────
  "almonds":             c(142),
  "walnuts":             c(113),
  "pecans":              c(105),
  "hazelnuts":           c(142),
  "cashews":             c(113),
  "peanuts":             c(142),
  "macadamia nuts":      c(149),
  "pine nuts":           c(142),
  "pistachios":          c(120),
  // ── Dried fruits ────────────────────────────────────────────────────
  "raisins":             c(149),
  "currants":            c(142),
  "dates":               c(149),
  "dried cranberries":   c(114),
  "dried blueberries":   c(156),
  "dried cherries":      c(142),
  "dried apricots":      c(128),
  "figs":                c(149),
  // ── Produce ─────────────────────────────────────────────────────────
  "onion":               c(142),
  "onions":              c(142),
  "carrots":             c(142),
  "celery":              c(142),
  "garlic":              c(149),
  "leeks":               c(92),
  "mushrooms":           c(78),
  "zucchini":            c(135),
  "blueberries":         c(155),
  "strawberries":        c(167),
  "raspberries":         c(120),
  "cherries":            c(113),
  "peaches":             c(170),
  "pears":               c(163),
  "apples":              c(113),
  "bananas":             c(227),
  // ── Pantry ──────────────────────────────────────────────────────────
  "tomato paste":        t(14.5),
  "jam":                 c(340),
  "preserves":           c(340),
  "vanilla extract":     t(14),
  // ── Leaveners & spices ──────────────────────────────────────────────
  "baking powder": { tablespoon: 12, teaspoon: 4, tbsp: 12, tsp: 4 },
  "baking soda":   { tablespoon: 18, teaspoon: 6, tbsp: 18, tsp: 6 },
  "salt":          { tablespoon: 18, teaspoon: 6, tbsp: 18, tsp: 6 },
  "table salt":    { tablespoon: 18, teaspoon: 6, tbsp: 18, tsp: 6 },
  "kosher salt":   { tablespoon: 12, teaspoon: 4, tbsp: 12, tsp: 4 },
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

// ── Fraction parsing ─────────────────────────────────────────────────────

const FRACTIONS: Record<string, number> = {
  "½": 0.5, "⅓": 1/3, "⅔": 2/3, "¼": 0.25, "¾": 0.75,
  "⅛": 0.125, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
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

  // Mixed number with unicode fraction: "2 ½"  ← the bug that was reported
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

  // Exact match first, then partial
  const entries = Object.entries(GRAM_CONVERSIONS);
  for (const [known, conversions] of entries) {
    if (cleanName === known) {
      const g = conversions[unitKey];
      if (g !== undefined) return `${Math.round(quantity * g)}g ${cleanName}`;
    }
  }
  for (const [known, conversions] of entries) {
    if (cleanName.includes(known) || known.includes(cleanName)) {
      const g = conversions[unitKey];
      if (g !== undefined) return `${Math.round(quantity * g)}g ${cleanName}`;
    }
  }

  return null;
}
