export interface ScrapedRecipeData {
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

function formatMinutes(minutes: number | null | undefined): string | null {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function parseInstructionsFromText(text: string): string[] {
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length > 0 ? lines : [text];
}

function toStringArray(val: unknown): string[] {
  if (!val) return [];
  if (typeof val === "string") return val.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  if (Array.isArray(val)) return val.filter((v) => typeof v === "string").map((v) => (v as string).trim());
  return [];
}

const COURSE_MAP: [string, RegExp][] = [
  ["Breakfast", /\b(breakfast|brunch|morning)\b/i],
  ["Lunch",     /\b(lunch|sandwich|wrap)\b/i],
  ["Dinner",    /\b(dinner|main\s*course|main\s*dish|entr[ée]e?|supper)\b/i],
  ["Dessert",   /\b(dessert|sweets?|cake|cookie|pie|pudding|ice\s*cream|brownie|biscuit)\b/i],
  ["Snack",     /\b(snack|appetizer|starter|finger\s*food|dip)\b/i],
  ["Drink",     /\b(drink|beverage|cocktail|smoothie|juice|shake)\b/i],
  ["Side",      /\b(side\s*dish|side|accompaniment|garnish)\b/i],
  ["Soup",      /\b(soup|stew|chowder|bisque|broth)\b/i],
  ["Salad",     /\b(salad)\b/i],
];

const CUISINE_MAP: [string, RegExp][] = [
  ["Italian",       /\b(italian|pasta|pizza|risotto|tiramisu|carbonara|bolognese|pesto|gnocchi|lasagna|gelato)\b/i],
  ["Mexican",       /\b(mexican|taco|burrito|enchilada|guacamole|salsa|quesadilla|tamale|chile|fajita)\b/i],
  ["American",      /\b(american|bbq|barbecue|burger|mac\s*and\s*cheese|southern|tex.mex|comfort\s*food)\b/i],
  ["Chinese",       /\b(chinese|stir.fry|dim\s*sum|fried\s*rice|dumpling|wonton|lo\s*mein)\b/i],
  ["Indian",        /\b(indian|curry|masala|tikka|biryani|naan|dal|chutney|samosa)\b/i],
  ["French",        /\b(french|croissant|baguette|ratatouille|cr[êe]pe|quiche|beurre|coq\s*au\s*vin)\b/i],
  ["Japanese",      /\b(japanese|sushi|ramen|tempura|teriyaki|miso|udon|soba|okonomiyaki)\b/i],
  ["Thai",          /\b(thai|pad\s*thai|green\s*curry|tom\s*yum|satay|larb)\b/i],
  ["Greek",         /\b(greek|mediterranean|hummus|falafel|tzatziki|souvlaki|moussaka|pita)\b/i],
  ["Korean",        /\b(korean|kimchi|bibimbap|bulgogi|tteok|gochujang)\b/i],
  ["Spanish",       /\b(spanish|paella|tapas|gazpacho|churro|tortilla\s*espa[ñn]ola)\b/i],
  ["Middle Eastern",/\b(middle\s*eastern|lebanese|persian|turkish|shawarma|kebab|baklava|za.atar)\b/i],
];

const DIET_SCHEMA_MAP: Record<string, string> = {
  "VeganDiet":       "Vegan",
  "VegetarianDiet":  "Vegetarian",
  "GlutenFreeDiet":  "Gluten-Free",
  "DiabeticDiet":    "Diabetic-Friendly",
  "HalalDiet":       "Halal",
  "KosherDiet":      "Kosher",
  "LowCalorieDiet":  "Low-Calorie",
  "LowFatDiet":      "Low-Fat",
  "LowSaltDiet":     "Low-Sodium",
};

const ATTRIBUTE_KEYWORD_MAP: [string, RegExp][] = [
  ["Quick",       /\b(quick|fast|30[\s-]min(?:ute)?|under\s*30|easy\s*weeknight)\b/i],
  ["Vegetarian",  /\b(vegetarian)\b/i],
  ["Vegan",       /\b(vegan)\b/i],
  ["Gluten-Free", /\b(gluten.?free)\b/i],
  ["Dairy-Free",  /\b(dairy.?free|non-dairy)\b/i],
  ["Healthy",     /\b(healthy|light|low.calorie|nutritious|wholesome)\b/i],
  ["One-Pot",     /\b(one.?pot|one.?pan|sheet.?pan|skillet)\b/i],
  ["Make-Ahead",  /\b(make.?ahead|prep.?ahead|meal.?prep)\b/i],
  ["Fermentation",/\b(ferment|sourdough|kimchi|kombucha|kefir)\b/i],
  ["Slow-Cooker", /\b(slow.?cooker|crock.?pot)\b/i],
  ["Instant-Pot", /\b(instant\s*pot|pressure\s*cook)\b/i],
  ["Kid-Friendly",/\b(kid.?friendly|family.?friendly|kid\s*approved)\b/i],
];

function guessFacets(opts: {
  title: string;
  recipeCategory: string[];
  recipeCuisine: string[];
  keywords: string[];
  suitableForDiet: string[];
  totalTime: string | null;
}): { course: string | null; cuisine: string | null; attribute: string[] } {
  const { recipeCategory, recipeCuisine, keywords, suitableForDiet, totalTime, title } = opts;

  const categoryText = [...recipeCategory, ...keywords, title].join(" ");
  const cuisineText  = [...recipeCuisine, ...keywords, title].join(" ");
  const attrText     = [...keywords, title].join(" ");

  let course: string | null = null;
  if (recipeCategory.length > 0) {
    for (const [name, pattern] of COURSE_MAP) {
      if (recipeCategory.some((c) => pattern.test(c))) { course = name; break; }
    }
  }
  if (!course) {
    for (const [name, pattern] of COURSE_MAP) {
      if (pattern.test(categoryText)) { course = name; break; }
    }
  }

  let cuisine: string | null = null;
  if (recipeCuisine.length > 0) {
    for (const [name, pattern] of CUISINE_MAP) {
      if (recipeCuisine.some((c) => pattern.test(c))) { cuisine = name; break; }
    }
  }
  if (!cuisine) {
    for (const [name, pattern] of CUISINE_MAP) {
      if (pattern.test(cuisineText)) { cuisine = name; break; }
    }
  }

  const attributeSet = new Set<string>();

  for (const dietUrl of suitableForDiet) {
    const key = dietUrl.replace(/.*\//, "");
    if (DIET_SCHEMA_MAP[key]) attributeSet.add(DIET_SCHEMA_MAP[key]);
  }

  if (totalTime) {
    const minMatch = totalTime.match(/(\d+)\s*min/i);
    const hrMatch  = totalTime.match(/(\d+)\s*hr/i);
    const totalMinutes = (hrMatch ? parseInt(hrMatch[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0);
    if (totalMinutes > 0 && totalMinutes <= 30) attributeSet.add("Quick");
  }

  for (const [attr, pattern] of ATTRIBUTE_KEYWORD_MAP) {
    if (attr === "Quick" && attributeSet.has("Quick")) continue;
    if (pattern.test(attrText)) attributeSet.add(attr);
  }

  return { course, cuisine, attribute: [...attributeSet] };
}

export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipeData> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

  if (jsonLdMatch) {
    for (const scriptTag of jsonLdMatch) {
      try {
        const jsonContent = scriptTag.replace(/<script[^>]*>/i, "").replace(/<\/script>/i, "");
        const parsed = JSON.parse(jsonContent);
        const recipes = findRecipes(parsed);
        for (const recipe of recipes) {
          const result = extractFromJsonLd(recipe, url);
          if (result) return result;
        }
      } catch {
      }
    }
  }

  const title = extractTitle(html);
  if (!title) {
    throw new Error("Could not find recipe data at this URL. The page may not contain a supported recipe format.");
  }

  const ingredients = extractIngredientsFromHtml(html);
  const instructions = extractInstructionsFromHtml(html);

  if (ingredients.length === 0 && instructions.length === 0) {
    throw new Error("Could not extract recipe ingredients or instructions from this page.");
  }

  const image = extractImageFromHtml(html);
  const { course, cuisine, attribute } = guessFacets({
    title,
    recipeCategory: [],
    recipeCuisine: [],
    keywords: extractKeywordsFromHtml(html),
    suitableForDiet: [],
    totalTime: null,
  });

  return {
    title,
    sourceUrl: url,
    ingredients,
    instructions,
    imagePath: image,
    yields: null,
    totalTime: null,
    prepTime: null,
    cookTime: null,
    course,
    cuisine,
    attribute,
  };
}

function findRecipes(data: unknown): unknown[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.flatMap(findRecipes);
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    const type = obj["@type"];
    if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) return [data];
    if (obj["@graph"]) return findRecipes(obj["@graph"]);
    return Object.values(obj).flatMap(findRecipes);
  }
  return [];
}

function extractFromJsonLd(recipe: unknown, url: string): ScrapedRecipeData | null {
  if (!recipe || typeof recipe !== "object") return null;
  const r = recipe as Record<string, unknown>;

  const title = typeof r.name === "string" ? cleanText(r.name) : null;
  if (!title) return null;

  const ingredients: string[] = [];
  if (Array.isArray(r.recipeIngredient)) {
    for (const ing of r.recipeIngredient) {
      if (typeof ing === "string") ingredients.push(cleanText(ing));
    }
  }

  const instructions: string[] = [];
  const rawInstructions = r.recipeInstructions;
  if (typeof rawInstructions === "string") {
    instructions.push(...parseInstructionsFromText(rawInstructions));
  } else if (Array.isArray(rawInstructions)) {
    for (const step of rawInstructions) {
      if (typeof step === "string") {
        instructions.push(cleanText(step));
      } else if (step && typeof step === "object") {
        const s = step as Record<string, unknown>;
        const text = s.text || s.name;
        if (typeof text === "string") instructions.push(cleanText(text));
      }
    }
  }

  let image: string | null = null;
  if (typeof r.image === "string") {
    image = r.image;
  } else if (Array.isArray(r.image) && r.image.length > 0) {
    const first = r.image[0];
    image = typeof first === "string" ? first : ((first as Record<string, unknown>)?.url as string ?? null);
  } else if (r.image && typeof r.image === "object") {
    image = (r.image as Record<string, unknown>).url as string ?? null;
  }

  const yields = typeof r.recipeYield === "string"
    ? r.recipeYield
    : Array.isArray(r.recipeYield) && r.recipeYield.length > 0
      ? String(r.recipeYield[0])
      : null;

  const totalTime = parseDuration(r.totalTime as string | null);
  const prepTime  = parseDuration(r.prepTime as string | null);
  const cookTime  = parseDuration(r.cookTime as string | null);

  const recipeCategory = toStringArray(r.recipeCategory);
  const recipeCuisine  = toStringArray(r.recipeCuisine);
  const keywords       = toStringArray(r.keywords);
  const suitableForDiet = toStringArray(r.suitableForDiet);

  const { course, cuisine, attribute } = guessFacets({
    title,
    recipeCategory,
    recipeCuisine,
    keywords,
    suitableForDiet,
    totalTime,
  });

  return {
    title,
    sourceUrl: url,
    ingredients,
    instructions,
    imagePath: image,
    yields,
    totalTime,
    prepTime,
    cookTime,
    course,
    cuisine,
    attribute,
  };
}

function parseDuration(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  return formatMinutes(hours * 60 + minutes);
}

function extractTitle(html: string): string | null {
  const og = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (og) return cleanText(og[1]);
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (title) return cleanText(title[1].replace(/\s*[|\-–].*/g, "").trim());
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1) return cleanText(h1[1]);
  return null;
}

function extractImageFromHtml(html: string): string | null {
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og[1];
  return null;
}

function extractKeywordsFromHtml(html: string): string[] {
  const meta = html.match(/<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)["']/i);
  if (meta) return meta[1].split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function extractIngredientsFromHtml(html: string): string[] {
  const patterns = [
    /<li[^>]*class="[^"]*ingredient[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
    /<span[^>]*class="[^"]*ingredient[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
  ];
  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)];
    if (matches.length > 0) {
      return matches.map((m) => cleanText(m[1].replace(/<[^>]+>/g, ""))).filter(Boolean);
    }
  }
  return [];
}

function extractInstructionsFromHtml(html: string): string[] {
  const patterns = [
    /<li[^>]*class="[^"]*instruction[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
    /<li[^>]*class="[^"]*step[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
    /<p[^>]*class="[^"]*instruction[^"]*"[^>]*>([\s\S]*?)<\/p>/gi,
  ];
  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)];
    if (matches.length > 0) {
      return matches.map((m) => cleanText(m[1].replace(/<[^>]+>/g, ""))).filter(Boolean);
    }
  }
  return [];
}
