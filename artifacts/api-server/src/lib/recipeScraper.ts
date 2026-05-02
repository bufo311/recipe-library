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
  };
}

function findRecipes(data: unknown): unknown[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.flatMap(findRecipes);
  }
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    const type = obj["@type"];
    if (type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))) {
      return [data];
    }
    if (obj["@graph"]) {
      return findRecipes(obj["@graph"]);
    }
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
    image = typeof first === "string" ? first : (first as Record<string, unknown>)?.url as string ?? null;
  } else if (r.image && typeof r.image === "object") {
    image = (r.image as Record<string, unknown>).url as string ?? null;
  }

  const yields = typeof r.recipeYield === "string"
    ? r.recipeYield
    : Array.isArray(r.recipeYield) && r.recipeYield.length > 0
      ? String(r.recipeYield[0])
      : null;

  const totalTime = parseDuration(r.totalTime as string | null);
  const prepTime = parseDuration(r.prepTime as string | null);
  const cookTime = parseDuration(r.cookTime as string | null);

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
