export interface ScrapedRecipe {
  title: string;
  sourceUrl: string;
  ingredients: string[];
  instructions: string[];
  imagePath: string | null;
  yields: string | null;
  totalTime: string | null;
  prepTime: string | null;
  cookTime: string | null;
  course: string | null;
  cuisine: string | null;
  attribute: string[];
}

const CORS_PROXY = "https://corsproxy.io/?";

function formatMinutes(minutes: number | null | undefined): string | null {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

function parseDuration(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) return null;
  const hours = parseInt(match[1] ?? "0");
  const mins = parseInt(match[2] ?? "0");
  const total = hours * 60 + mins;
  return formatMinutes(total);
}

function toStringArray(val: unknown): string[] {
  if (!val) return [];
  if (typeof val === "string") return val.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  if (Array.isArray(val)) return val.filter((v) => typeof v === "string").map((v) => (v as string).trim());
  return [];
}

function parseInstructions(val: unknown): string[] {
  if (!val) return [];
  if (typeof val === "string") {
    return val.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }
  if (Array.isArray(val)) {
    return val.flatMap((item) => {
      if (typeof item === "string") return [item.trim()];
      if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        if (typeof obj.text === "string") return [obj.text.trim()];
        if (typeof obj.itemListElement !== "undefined") {
          return parseInstructions(obj.itemListElement);
        }
      }
      return [];
    }).filter(Boolean);
  }
  return [];
}

function getImage(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    for (const item of val) {
      const url = getImage(item);
      if (url) return url;
    }
  }
  if (typeof val === "object" && val !== null) {
    const obj = val as Record<string, unknown>;
    if (typeof obj.url === "string") return obj.url;
  }
  return null;
}

const COURSE_MAP: [string, RegExp][] = [
  ["Breakfast", /\b(breakfast|brunch|morning)\b/i],
  ["Lunch",     /\b(lunch|sandwich|wrap)\b/i],
  ["Dinner",    /\b(dinner|main\s*course|main\s*dish|entr[ée]e?|supper)\b/i],
  ["Dessert",   /\b(dessert|sweets?|cake|cookie|pie|pudding|ice\s*cream|brownie|biscuit)\b/i],
  ["Snack",     /\b(snack|appetizer|starter|finger\s*food|dip)\b/i],
  ["Drink",     /\b(drink|beverage|cocktail|smoothie|juice|shake)\b/i],
  ["Side",      /\b(side\s*dish|side|accompaniment)\b/i],
  ["Soup",      /\b(soup|stew|chowder|bisque|broth)\b/i],
  ["Salad",     /\b(salad)\b/i],
];

const CUISINE_MAP: [string, RegExp][] = [
  ["Italian",    /\b(italian|pasta|pizza|risotto)\b/i],
  ["Mexican",    /\b(mexican|taco|burrito|enchilada|salsa|guacamole)\b/i],
  ["Asian",      /\b(asian|chinese|japanese|korean|thai|vietnamese|sushi|ramen|pho|stir.fry)\b/i],
  ["Indian",     /\b(indian|curry|masala|tikka|naan|biryani)\b/i],
  ["American",   /\b(american|bbq|barbecue|burger|mac.and.cheese)\b/i],
  ["French",     /\b(french|quiche|croissant|ratatouille|coq.au.vin)\b/i],
  ["Mediterranean", /\b(mediterranean|greek|hummus|falafel|tahini|pita)\b/i],
  ["Middle Eastern", /\b(middle.eastern|lebanese|persian|turkish|shawarma)\b/i],
];

const ATTRIBUTE_MAP: [string, RegExp][] = [
  ["Vegetarian", /\b(vegetarian|meatless)\b/i],
  ["Vegan",      /\b(vegan|plant.based)\b/i],
  ["Gluten-Free", /\b(gluten.free|gluten free)\b/i],
  ["Dairy-Free", /\b(dairy.free|dairy free)\b/i],
  ["Quick",      /\b(quick|fast|easy|simple|30.minute|15.minute)\b/i],
  ["One-Pot",    /\b(one.pot|one pot|sheet pan|one.pan)\b/i],
  ["Make-Ahead", /\b(make.ahead|meal.prep|freezer)\b/i],
  ["Healthy",    /\b(healthy|light|low.calorie|nutritious)\b/i],
];

function guessFromText(text: string, map: [string, RegExp][]): string | null {
  for (const [label, pattern] of map) {
    if (pattern.test(text)) return label;
  }
  return null;
}

function guessAttributes(text: string): string[] {
  return ATTRIBUTE_MAP.flatMap(([label, pattern]) => (pattern.test(text) ? [label] : []));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractFromJsonLd(recipe: any, url: string): ScrapedRecipe {
  const title = typeof recipe.name === "string" ? recipe.name.trim() : "Untitled Recipe";
  const ingredients = toStringArray(recipe.recipeIngredient);
  const instructions = parseInstructions(recipe.recipeInstructions);
  const imagePath = getImage(recipe.image);
  const yields = typeof recipe.recipeYield === "string"
    ? recipe.recipeYield
    : Array.isArray(recipe.recipeYield) ? recipe.recipeYield[0] ?? null : null;

  const totalTime = parseDuration(recipe.totalTime);
  const prepTime = parseDuration(recipe.prepTime);
  const cookTime = parseDuration(recipe.cookTime);

  const searchText = [
    title,
    toStringArray(recipe.recipeCategory).join(" "),
    toStringArray(recipe.recipeCuisine).join(" "),
    toStringArray(recipe.keywords).join(" "),
    typeof recipe.description === "string" ? recipe.description : "",
  ].join(" ");

  const rawCourse = toStringArray(recipe.recipeCategory).join(" ");
  const rawCuisine = toStringArray(recipe.recipeCuisine).join(" ");
  const course = guessFromText(rawCourse || searchText, COURSE_MAP);
  const cuisine = guessFromText(rawCuisine || searchText, CUISINE_MAP);
  const attribute = guessAttributes(searchText);

  return { title, sourceUrl: url, ingredients, instructions, imagePath, yields, totalTime, prepTime, cookTime, course, cuisine, attribute };
}

export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipe> {
  const proxyUrl = CORS_PROXY + encodeURIComponent(url);
  const resp = await fetch(proxyUrl);
  if (!resp.ok) throw new Error(`Could not fetch the page (HTTP ${resp.status}). Try a different URL.`);

  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));

  for (const script of scripts) {
    try {
      const json = JSON.parse(script.textContent ?? "");
      const candidates: unknown[] = Array.isArray(json) ? json : [json];

      for (const item of candidates) {
        if (typeof item !== "object" || item === null) continue;
        const obj = item as Record<string, unknown>;

        if (obj["@type"] === "Recipe") {
          return extractFromJsonLd(obj, url);
        }

        if (obj["@graph"] && Array.isArray(obj["@graph"])) {
          const recipeNode = obj["@graph"].find(
            (n: unknown) => typeof n === "object" && n !== null && (n as Record<string, unknown>)["@type"] === "Recipe"
          );
          if (recipeNode) return extractFromJsonLd(recipeNode, url);
        }
      }
    } catch {
      // malformed JSON-LD, skip
    }
  }

  throw new Error("No recipe data found on that page. The site may not include structured recipe data.");
}
