const GRAM_CONVERSIONS: Record<string, Record<string, number>> = {
  "flour": {
    "cup": 120,
    "tablespoon": 7.5,
    "teaspoon": 2.5,
    "tbsp": 7.5,
    "tsp": 2.5,
  },
  "sugar": {
    "cup": 200,
    "tablespoon": 12.5,
    "teaspoon": 4.2,
    "tbsp": 12.5,
    "tsp": 4.2,
  },
  "brown sugar": {
    "cup": 220,
    "tablespoon": 13.75,
    "teaspoon": 4.5,
    "tbsp": 13.75,
    "tsp": 4.5,
  },
  "powdered sugar": {
    "cup": 120,
    "tablespoon": 7.5,
    "teaspoon": 2.5,
    "tbsp": 7.5,
    "tsp": 2.5,
  },
  "butter": {
    "cup": 227,
    "tablespoon": 14.2,
    "teaspoon": 4.7,
    "tbsp": 14.2,
    "tsp": 4.7,
  },
  "water": {
    "cup": 240,
    "tablespoon": 15,
    "teaspoon": 5,
    "tbsp": 15,
    "tsp": 5,
  },
  "milk": {
    "cup": 244,
    "tablespoon": 15.25,
    "teaspoon": 5.1,
    "tbsp": 15.25,
    "tsp": 5.1,
  },
  "honey": {
    "cup": 340,
    "tablespoon": 21.25,
    "teaspoon": 7.1,
    "tbsp": 21.25,
    "tsp": 7.1,
  },
  "oil": {
    "cup": 218,
    "tablespoon": 13.6,
    "teaspoon": 4.5,
    "tbsp": 13.6,
    "tsp": 4.5,
  },
  "olive oil": {
    "cup": 218,
    "tablespoon": 13.6,
    "teaspoon": 4.5,
    "tbsp": 13.6,
    "tsp": 4.5,
  },
  "salt": {
    "tablespoon": 18,
    "teaspoon": 6,
    "tbsp": 18,
    "tsp": 6,
  },
  "baking powder": {
    "tablespoon": 12,
    "teaspoon": 4,
    "tbsp": 12,
    "tsp": 4,
  },
  "baking soda": {
    "tablespoon": 18,
    "teaspoon": 6,
    "tbsp": 18,
    "tsp": 6,
  },
  "cocoa powder": {
    "cup": 85,
    "tablespoon": 5.3,
    "teaspoon": 1.8,
    "tbsp": 5.3,
    "tsp": 1.8,
  },
  "oats": {
    "cup": 90,
    "tablespoon": 5.6,
    "teaspoon": 1.9,
    "tbsp": 5.6,
    "tsp": 1.9,
  },
  "rice": {
    "cup": 185,
    "tablespoon": 11.5,
    "teaspoon": 3.8,
    "tbsp": 11.5,
    "tsp": 3.8,
  },
  "cream": {
    "cup": 238,
    "tablespoon": 14.9,
    "teaspoon": 4.9,
    "tbsp": 14.9,
    "tsp": 4.9,
  },
  "yogurt": {
    "cup": 245,
    "tablespoon": 15.3,
    "teaspoon": 5.1,
    "tbsp": 15.3,
    "tsp": 5.1,
  },
};

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
  if (FRACTIONS[trimmed] !== undefined) return FRACTIONS[trimmed];
  if (/^\d+\/\d+$/.test(trimmed)) {
    const [num, den] = trimmed.split("/").map(Number);
    if (den !== 0) return num / den;
  }
  const mixed = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  }
  const parsed = parseFloat(trimmed);
  return isNaN(parsed) ? null : parsed;
}

export function convertIngredientToGrams(ingredient: string): string | null {
  const normalized = ingredient.toLowerCase();

  const measurePattern =
    /([\d\s½⅓⅔¼¾⅛⅜⅝⅞\/\.]+)\s*(cups?|tablespoons?|teaspoons?|tbsp?s?|tsps?)\s+(?:of\s+)?(.+)/i;

  const match = normalized.match(measurePattern);
  if (!match) return null;

  const [, quantityStr, unit, ingredientName] = match;

  const quantity = parseFraction(quantityStr.trim());
  if (quantity === null) return null;

  const normalizedUnit = unit
    .toLowerCase()
    .replace(/s$/, "")
    .replace("tablespoon", "tablespoon")
    .replace("teaspoon", "teaspoon");

  const unitKey = normalizedUnit.includes("table")
    ? "tablespoon"
    : normalizedUnit.includes("tea")
      ? "teaspoon"
      : normalizedUnit.startsWith("tbsp") || normalizedUnit === "tbs" || normalizedUnit === "tbsp"
        ? "tablespoon"
        : normalizedUnit.startsWith("tsp") || normalizedUnit === "ts"
          ? "teaspoon"
          : normalizedUnit.replace(/s$/, "");

  const cleanIngredientName = ingredientName
    .replace(/,.*$/, "")
    .replace(/\(.*?\)/g, "")
    .trim();

  for (const [knownIngredient, conversions] of Object.entries(GRAM_CONVERSIONS)) {
    if (
      cleanIngredientName.includes(knownIngredient) ||
      knownIngredient.includes(cleanIngredientName)
    ) {
      const gramsPerUnit = conversions[unitKey];
      if (gramsPerUnit !== undefined) {
        const totalGrams = Math.round(quantity * gramsPerUnit);
        return `${totalGrams}g ${cleanIngredientName}`;
      }
    }
  }

  return null;
}
