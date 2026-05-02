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

const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
];

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

// Fractions and number-start chars that begin a new ingredient line
const INGREDIENT_SPLIT_RE =
  /(?<=[a-zA-Z\)\.])\s+(?=(?:\d+[\s\/]|[½¼⅓⅔¾⅛⅜⅝⅞]))/g;

function splitIngredientBlob(text: string): string[] {
  // If the string already has newlines, split on those
  if (/\n/.test(text)) {
    return text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  }
  // Try to split on measurement-start boundaries
  const parts = text.split(INGREDIENT_SPLIT_RE).map((s) => s.trim()).filter(Boolean);
  // Only use the split result if it produced multiple items AND each looks like an ingredient
  // (contains at least one letter after the leading quantity)
  const LOOKS_LIKE_INGREDIENT = /^(?:\d|[½¼⅓⅔¾⅛⅜⅝⅞]|a\s|some\s|pinch|handful)/i;
  if (parts.length > 1 && parts.every((p) => LOOKS_LIKE_INGREDIENT.test(p))) {
    return parts;
  }
  // Fallback: return as single item
  return [text];
}

function toStringArray(val: unknown): string[] {
  if (!val) return [];
  if (typeof val === "string") {
    const clean = val.trim();
    if (!clean) return [];
    // Heuristic: if the string contains measurement keywords more than once, it's a blob
    const measureCount = (clean.match(/\b(?:cup|tablespoon|teaspoon|tbsp|tsp|pound|lb|oz|gram|pinch)\b/gi) ?? []).length;
    if (measureCount > 1) return splitIngredientBlob(clean);
    return [clean];
  }
  if (Array.isArray(val)) {
    return val
      .filter((v) => typeof v === "string")
      .flatMap((v) => {
        const s = (v as string).trim();
        const measureCount = (s.match(/\b(?:cup|tablespoon|teaspoon|tbsp|tsp|pound|lb|oz|gram|pinch)\b/gi) ?? []).length;
        return measureCount > 1 ? splitIngredientBlob(s) : [s];
      })
      .filter(Boolean);
  }
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

// ── helpers ────────────────────────────────────────────────────────────────

function elText(el: Element): string {
  return (el.textContent ?? "").replace(/\s+/g, " ").trim();
}

function listItemTexts(container: Element): string[] {
  const liItems = Array.from(container.querySelectorAll("li"))
    .map(elText)
    .filter((t) => t.length > 2);
  if (liItems.length > 0) return liItems;
  // Fallback: treat each <p> as a step
  return collectParaTexts(container);
}

function firstImageSrc(doc: Document): string | null {
  const og = doc.querySelector('meta[property="og:image"]');
  if (og) return og.getAttribute("content");
  const img = doc.querySelector("article img, .post-content img, main img");
  return img?.getAttribute("src") ?? null;
}

function pageTitle(doc: Document): string {
  const og = doc.querySelector('meta[property="og:title"]');
  if (og) {
    const t = (og.getAttribute("content") ?? "").replace(/\s*[-|–]\s*.+$/, "").trim();
    if (t) return t;
  }
  return (doc.querySelector("h1")?.textContent ?? "").replace(/\s+/g, " ").trim() || "Untitled Recipe";
}

// ── Strategy 1: microdata (itemprop) ──────────────────────────────────────

function extractFromMicrodata(doc: Document, url: string): ScrapedRecipe | null {
  const recipeEl = doc.querySelector(
    '[itemtype*="schema.org/Recipe"], [itemtype*="Schema.org/Recipe"]'
  );
  if (!recipeEl) return null;

  const nameEl = recipeEl.querySelector('[itemprop="name"]');
  const title = nameEl ? elText(nameEl) : pageTitle(doc);

  const ingredients = Array.from(recipeEl.querySelectorAll('[itemprop="recipeIngredient"], [itemprop="ingredients"]'))
    .map(elText)
    .filter(Boolean);

  const instructionEls = Array.from(recipeEl.querySelectorAll('[itemprop="recipeInstructions"]'));
  const instructions: string[] = [];
  for (const el of instructionEls) {
    const steps = Array.from(el.querySelectorAll('[itemprop="text"], li'));
    if (steps.length > 0) {
      steps.map(elText).filter(Boolean).forEach((s) => instructions.push(s));
    } else {
      const t = elText(el);
      if (t) instructions.push(...t.split(/\n+/).map((s) => s.trim()).filter(Boolean));
    }
  }

  if (ingredients.length === 0 && instructions.length === 0) return null;

  const imagePath = getImage(
    recipeEl.querySelector('[itemprop="image"]')?.getAttribute("src") ??
    recipeEl.querySelector('[itemprop="image"]')?.getAttribute("content") ??
    firstImageSrc(doc)
  );

  const searchText = [title, ...ingredients].join(" ");
  return {
    title, sourceUrl: url, ingredients, instructions, imagePath,
    yields: elText(recipeEl.querySelector('[itemprop="recipeYield"]') ?? document.createElement("span")) || null,
    totalTime: null, prepTime: null, cookTime: null,
    course: guessFromText(searchText, COURSE_MAP),
    cuisine: guessFromText(searchText, CUISINE_MAP),
    attribute: guessAttributes(searchText),
  };
}

// ── Strategy 2: known recipe-plugin CSS classes ────────────────────────────

const PLUGIN_SELECTORS = {
  // WP Recipe Maker
  wprm: {
    root: ".wprm-recipe-container, .wprm-recipe",
    title: ".wprm-recipe-name",
    ingredient: ".wprm-recipe-ingredient",
    instruction: ".wprm-recipe-instruction-text",
    yields: ".wprm-recipe-servings-with-unit",
    image: ".wprm-recipe-image img",
  },
  // Tasty Recipes
  tasty: {
    root: ".tasty-recipes",
    title: ".tasty-recipes-title",
    ingredient: ".tasty-recipes-ingredients li",
    instruction: ".tasty-recipes-instructions li",
    yields: ".tasty-recipes-yield",
    image: ".tasty-recipes-image img",
  },
  // Create by Mediavine
  mv: {
    root: ".mv-create-card, .mv-recipe",
    title: ".mv-create-title",
    ingredient: ".mv-create-ingredients li",
    instruction: ".mv-create-instructions li",
    yields: ".mv-create-yield",
    image: ".mv-create-image img",
  },
  // Delicious Recipes / Cooked
  delicious: {
    root: ".dr-recipe, .cooked-recipe",
    title: ".dr-recipe-title, .cooked-recipe-title",
    ingredient: ".dr-ingredient, .ingredient",
    instruction: ".dr-step, .step",
    yields: ".dr-yield",
    image: ".dr-recipe-image img, .cooked-recipe-image img",
  },
  // EasyRecipe
  easy: {
    root: ".easyrecipe, .ERSContainer",
    title: ".ERSName",
    ingredient: ".ERSIngredient",
    instruction: ".ERSInstructions li",
    yields: ".ERSServes",
    image: ".ERSImage img",
  },
  // Zip Recipes / BigOven
  zip: {
    root: ".zrdn-recipe-container, .bigoven-recipe",
    title: ".zrdn-recipe-title",
    ingredient: ".zrdn-ingredient, .zrdn-ingredients li",
    instruction: ".zrdn-instruction, .zrdn-instructions li",
    yields: ".zrdn-yield",
    image: ".zrdn-image img",
  },
  // Simply Recipes / The Spruce Eats custom card
  spruce: {
    root: ".structured-content-recipe, .recipe-block",
    title: ".recipe-block__title, .structured-content-recipe__title",
    ingredient: ".structured-content-recipe__ingredient, .recipe-block__ingredient",
    instruction: ".structured-content-recipe__step, .recipe-block__step",
    yields: ".recipe-block__servings",
    image: ".recipe-block__image img",
  },
  // Generic / fallback classes that many themes use
  generic: {
    root: ".recipe-card, .recipe-container, .recipe-box, #recipe",
    title: ".recipe-title, .recipe-name, h2.recipe, h3.recipe",
    ingredient: ".recipe-ingredients li, .ingredients li, .ingredient-list li",
    instruction: ".recipe-instructions li, .instructions li, .directions li, .steps li",
    yields: ".recipe-servings, .recipe-yield",
    image: ".recipe-image img, .recipe-photo img",
  },
};

function extractFromPlugin(doc: Document, url: string): ScrapedRecipe | null {
  for (const sel of Object.values(PLUGIN_SELECTORS)) {
    const root = doc.querySelector(sel.root);
    if (!root) continue;

    const ingredients = Array.from(root.querySelectorAll(sel.ingredient)).map(elText).filter(Boolean);
    const instructions = Array.from(root.querySelectorAll(sel.instruction)).map(elText).filter(Boolean);
    if (ingredients.length === 0 && instructions.length === 0) continue;

    const titleEl = root.querySelector(sel.title);
    const title = titleEl ? elText(titleEl) : pageTitle(doc);
    const imgEl = root.querySelector(sel.image);
    const imagePath = imgEl?.getAttribute("src") ?? imgEl?.getAttribute("data-src") ?? firstImageSrc(doc);
    const yieldsEl = root.querySelector(sel.yields);
    const yields = yieldsEl ? elText(yieldsEl) : null;

    const searchText = [title, ...ingredients].join(" ");
    return {
      title, sourceUrl: url, ingredients, instructions, imagePath: imagePath ?? null, yields,
      totalTime: null, prepTime: null, cookTime: null,
      course: guessFromText(searchText, COURSE_MAP),
      cuisine: guessFromText(searchText, CUISINE_MAP),
      attribute: guessAttributes(searchText),
    };
  }
  return null;
}

// ── Strategy 3: heading-based heuristic ───────────────────────────────────

function extractFromHeadings(doc: Document, url: string): ScrapedRecipe | null {
  const ingredientRe = /^ingredients?$/i;
  const instructionRe = /^(instructions?|directions?|steps?|method|preparation|how to make)$/i;

  // Gather all block-level headings and labelled sections
  const allHeadings = Array.from(
    doc.querySelectorAll("h1,h2,h3,h4,h5,h6,dt,th,[class*='heading'],[class*='title'],[class*='label']")
  );

  let ingredientsContainer: Element | null = null;
  let instructionsContainer: Element | null = null;

  for (const heading of allHeadings) {
    const text = elText(heading).replace(/[:\s]+$/, "");
    if (ingredientRe.test(text)) {
      ingredientsContainer = findNextList(heading);
    }
    if (instructionRe.test(text)) {
      instructionsContainer = findNextList(heading);
    }
  }

  // Also try searching for any element whose visible text is exactly "Ingredients" etc.
  if (!ingredientsContainer || !instructionsContainer) {
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
    let node: Element | null;
    while ((node = walker.nextNode() as Element | null)) {
      const tag = node.tagName.toLowerCase();
      if (["script","style","noscript","svg","button","a","nav","footer","header"].includes(tag)) continue;
      // Only look at leaf-ish nodes (few children)
      if (node.children.length > 3) continue;
      const text = elText(node).replace(/[:\s]+$/, "");
      if (!ingredientsContainer && ingredientRe.test(text)) {
        ingredientsContainer = findNextList(node);
      }
      if (!instructionsContainer && instructionRe.test(text)) {
        instructionsContainer = findNextList(node);
      }
    }
  }

  const ingredients = ingredientsContainer ? listItemTexts(ingredientsContainer) : [];
  const instructions = instructionsContainer ? listItemTexts(instructionsContainer) : [];

  if (ingredients.length < 2 && instructions.length < 2) return null;

  const title = pageTitle(doc);
  const imagePath = firstImageSrc(doc);
  const searchText = [title, ...ingredients].join(" ");
  return {
    title, sourceUrl: url, ingredients, instructions, imagePath, yields: null,
    totalTime: null, prepTime: null, cookTime: null,
    course: guessFromText(searchText, COURSE_MAP),
    cuisine: guessFromText(searchText, CUISINE_MAP),
    attribute: guessAttributes(searchText),
  };
}

function collectParaTexts(container: Element): string[] {
  // Grab <p> tags and treat each as a step, filtering navigation noise
  return Array.from(container.querySelectorAll("p"))
    .map(elText)
    .filter((t) => t.length > 15 && !/^(print|save|jump|share|subscribe|comment)/i.test(t));
}

function findNextContentBlock(el: Element): Element | null {
  // Look for the next ul/ol sibling first, then any block with <p>/<li> content
  const LIST_SEL = "ul, ol";

  let cursor: Element | null = el.nextElementSibling;
  for (let i = 0; i < 8 && cursor; i++) {
    const tag = cursor.tagName;
    if (tag === "UL" || tag === "OL") return cursor;
    const inner = cursor.querySelector(LIST_SEL);
    if (inner) return inner;
    // Accept a div/section that directly contains <p> or <li>
    if (["DIV","SECTION","ARTICLE"].includes(tag)) {
      if (cursor.querySelector("p, li")) return cursor;
    }
    cursor = cursor.nextElementSibling;
  }
  // Try going up one level
  const parent = el.parentElement;
  if (parent) {
    let found = false;
    for (const child of Array.from(parent.children)) {
      if (found) {
        const tag = child.tagName;
        if (tag === "UL" || tag === "OL") return child;
        const inner = child.querySelector(LIST_SEL);
        if (inner) return inner;
        if (["DIV","SECTION","ARTICLE"].includes(tag) && child.querySelector("p, li")) return child;
      }
      if (child === el) found = true;
    }
  }
  return null;
}

// Keep old name as alias used inside extractFromHeadings
function findNextList(el: Element): Element | null {
  return findNextContentBlock(el);
}

// ── fetch + orchestrate ───────────────────────────────────────────────────

async function fetchHtml(url: string): Promise<string> {
  for (const makeProxy of CORS_PROXIES) {
    try {
      const resp = await fetch(makeProxy(url));
      if (resp.ok) {
        const text = await resp.text();
        if (text.length > 500) return text;
      }
    } catch {
      // try next proxy
    }
  }
  throw new Error("Could not fetch that page. The site may be blocking external requests.");
}

function findRecipeInJsonLd(doc: Document, url: string): ScrapedRecipe | null {
  const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  for (const script of scripts) {
    try {
      const json = JSON.parse(script.textContent ?? "");
      const candidates: unknown[] = Array.isArray(json) ? json : [json];
      for (const item of candidates) {
        if (typeof item !== "object" || item === null) continue;
        const obj = item as Record<string, unknown>;
        if (obj["@type"] === "Recipe") return extractFromJsonLd(obj, url);
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
  return null;
}

export async function scrapeRecipeFromUrl(url: string): Promise<ScrapedRecipe> {
  const html = await fetchHtml(url);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const recipe =
    findRecipeInJsonLd(doc, url) ??
    extractFromMicrodata(doc, url) ??
    extractFromPlugin(doc, url) ??
    extractFromHeadings(doc, url);

  if (recipe) return recipe;

  throw new Error(
    "Couldn't automatically extract a recipe from this page. " +
    "The site may load content dynamically or use an unusual layout. " +
    "Try pasting the ingredients and instructions manually."
  );
}
