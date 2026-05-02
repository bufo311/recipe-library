import { Router } from "express";
import { eq, desc, count, sql, ilike, or, and } from "drizzle-orm";
import { db, recipesTable } from "@workspace/db";
import {
  CreateRecipeBody,
  ScrapeRecipeBody,
  UpdateRecipeBody,
  GetRecipeParams,
  UpdateRecipeParams,
  DeleteRecipeParams,
  ConvertToGramsParams,
  ListRecipesQueryParams,
  GetRecentRecipesQueryParams,
} from "@workspace/api-zod";
import { scrapeRecipeFromUrl } from "../lib/recipeScraper";
import { convertIngredientToGrams } from "../lib/gramConverter";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

router.get("/recipes", async (req, res) => {
  try {
    const query = ListRecipesQueryParams.safeParse(req.query);
    const params = query.success ? query.data : {};

    let baseQuery = db
      .select({
        id: recipesTable.id,
        title: recipesTable.title,
        imagePath: recipesTable.imagePath,
        yields: recipesTable.yields,
        category: recipesTable.category,
        sourceUrl: recipesTable.sourceUrl,
        course: recipesTable.course,
        cuisine: recipesTable.cuisine,
        attribute: recipesTable.attribute,
        createdAt: recipesTable.createdAt,
      })
      .from(recipesTable)
      .$dynamic();

    const conditions = [];

    if (params.search) {
      conditions.push(ilike(recipesTable.title, `%${params.search}%`));
    }
    if (params.category) {
      conditions.push(eq(recipesTable.category, params.category));
    }
    if (params.course) {
      conditions.push(eq(recipesTable.course, params.course));
    }
    if (params.cuisine) {
      conditions.push(eq(recipesTable.cuisine, params.cuisine));
    }
    if (params.attribute) {
      conditions.push(
        sql`${recipesTable.attribute} @> ${JSON.stringify([params.attribute])}::jsonb`
      );
    }

    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }

    const recipes = await baseQuery.orderBy(desc(recipesTable.createdAt));

    res.json(
      recipes.map((r) => ({
        ...r,
        attribute: (r.attribute as string[]) ?? [],
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list recipes");
    res.status(500).json({ error: "Failed to list recipes" });
  }
});

router.post("/recipes", async (req, res) => {
  try {
    const parsed = CreateRecipeBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid recipe data" });
      return;
    }

    const data = parsed.data;
    const [recipe] = await db
      .insert(recipesTable)
      .values({
        title: data.title,
        sourceUrl: data.sourceUrl ?? null,
        ingredients: data.ingredients,
        instructions: data.instructions,
        imagePath: data.imagePath ?? null,
        yields: data.yields ?? null,
        category: data.category ?? null,
        notes: data.notes ?? null,
        totalTime: data.totalTime ?? null,
        prepTime: data.prepTime ?? null,
        cookTime: data.cookTime ?? null,
        course: data.course ?? null,
        cuisine: data.cuisine ?? null,
        attribute: data.attribute ?? [],
      })
      .returning();

    res.status(201).json(serializeRecipe(recipe));
  } catch (err) {
    req.log.error({ err }, "Failed to create recipe");
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

router.post("/recipes/scrape", async (req, res) => {
  try {
    const parsed = ScrapeRecipeBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request: url is required" });
      return;
    }

    const scraped = await scrapeRecipeFromUrl(parsed.data.url);
    res.json(scraped);
  } catch (err) {
    req.log.error({ err }, "Failed to scrape recipe");
    const message = err instanceof Error ? err.message : "Failed to scrape recipe from URL";
    res.status(422).json({ error: message });
  }
});

router.get("/recipes/stats", async (req, res) => {
  try {
    const [[{ total }], categoryCounts, recentResult] = await Promise.all([
      db.select({ total: count() }).from(recipesTable),
      db
        .select({ category: recipesTable.category, count: count() })
        .from(recipesTable)
        .where(sql`${recipesTable.category} IS NOT NULL`)
        .groupBy(recipesTable.category),
      db
        .select({ count: count() })
        .from(recipesTable)
        .where(sql`${recipesTable.createdAt} > NOW() - INTERVAL '7 days'`),
    ]);

    res.json({
      totalRecipes: total,
      categoryCounts: categoryCounts.map((c) => ({
        category: c.category ?? "Uncategorized",
        count: c.count,
      })),
      recentCount: recentResult[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get recipe stats" });
  }
});

router.get("/recipes/recent", async (req, res) => {
  try {
    const query = GetRecentRecipesQueryParams.safeParse(req.query);
    const limit = query.success && query.data.limit ? query.data.limit : 6;

    const recipes = await db
      .select({
        id: recipesTable.id,
        title: recipesTable.title,
        imagePath: recipesTable.imagePath,
        yields: recipesTable.yields,
        category: recipesTable.category,
        sourceUrl: recipesTable.sourceUrl,
        course: recipesTable.course,
        cuisine: recipesTable.cuisine,
        attribute: recipesTable.attribute,
        createdAt: recipesTable.createdAt,
      })
      .from(recipesTable)
      .orderBy(desc(recipesTable.createdAt))
      .limit(limit);

    res.json(
      recipes.map((r) => ({
        ...r,
        attribute: (r.attribute as string[]) ?? [],
        createdAt: r.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get recent recipes");
    res.status(500).json({ error: "Failed to get recent recipes" });
  }
});

router.get("/recipes/facets", async (req, res) => {
  try {
    const rows = await db
      .select({
        course: recipesTable.course,
        cuisine: recipesTable.cuisine,
        attribute: recipesTable.attribute,
      })
      .from(recipesTable);

    const courses = [...new Set(rows.map((r) => r.course).filter((v): v is string => !!v))].sort();
    const cuisines = [...new Set(rows.map((r) => r.cuisine).filter((v): v is string => !!v))].sort();
    const attributes = [
      ...new Set(rows.flatMap((r) => (r.attribute as string[]) ?? [])),
    ].sort();

    res.json({ courses, cuisines, attributes });
  } catch (err) {
    req.log.error({ err }, "Failed to get facets");
    res.status(500).json({ error: "Failed to get facets" });
  }
});

router.get("/recipes/:id", async (req, res) => {
  try {
    const parsed = GetRecipeParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid recipe ID" });
      return;
    }

    const [recipe] = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.id, parsed.data.id))
      .limit(1);

    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    res.json(serializeRecipe(recipe));
  } catch (err) {
    req.log.error({ err }, "Failed to get recipe");
    res.status(500).json({ error: "Failed to get recipe" });
  }
});

router.put("/recipes/:id", async (req, res) => {
  try {
    const paramsParsed = UpdateRecipeParams.safeParse(req.params);
    if (!paramsParsed.success) {
      res.status(400).json({ error: "Invalid recipe ID" });
      return;
    }

    const bodyParsed = UpdateRecipeBody.safeParse(req.body);
    if (!bodyParsed.success) {
      res.status(400).json({ error: "Invalid recipe data" });
      return;
    }

    const updates: Partial<typeof recipesTable.$inferInsert> = {
      updatedAt: new Date(),
    };

    const data = bodyParsed.data;
    if (data.title !== undefined) updates.title = data.title;
    if (data.sourceUrl !== undefined) updates.sourceUrl = data.sourceUrl ?? null;
    if (data.ingredients !== undefined) updates.ingredients = data.ingredients;
    if (data.instructions !== undefined) updates.instructions = data.instructions;
    if (data.imagePath !== undefined) updates.imagePath = data.imagePath ?? null;
    if (data.yields !== undefined) updates.yields = data.yields ?? null;
    if (data.category !== undefined) updates.category = data.category ?? null;
    if (data.notes !== undefined) updates.notes = data.notes ?? null;
    if (data.totalTime !== undefined) updates.totalTime = data.totalTime ?? null;
    if (data.prepTime !== undefined) updates.prepTime = data.prepTime ?? null;
    if (data.cookTime !== undefined) updates.cookTime = data.cookTime ?? null;
    if (data.course !== undefined) updates.course = data.course ?? null;
    if (data.cuisine !== undefined) updates.cuisine = data.cuisine ?? null;
    if (data.attribute !== undefined) updates.attribute = data.attribute ?? [];

    const [recipe] = await db
      .update(recipesTable)
      .set(updates)
      .where(eq(recipesTable.id, paramsParsed.data.id))
      .returning();

    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    res.json(serializeRecipe(recipe));
  } catch (err) {
    req.log.error({ err }, "Failed to update recipe");
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

router.delete("/recipes/:id", async (req, res) => {
  try {
    const parsed = DeleteRecipeParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid recipe ID" });
      return;
    }

    const [deleted] = await db
      .delete(recipesTable)
      .where(eq(recipesTable.id, parsed.data.id))
      .returning({ id: recipesTable.id });

    if (!deleted) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete recipe");
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

router.post("/recipes/:id/convert-to-grams", async (req, res) => {
  try {
    const parsed = ConvertToGramsParams.safeParse(req.params);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid recipe ID" });
      return;
    }

    const [recipe] = await db
      .select()
      .from(recipesTable)
      .where(eq(recipesTable.id, parsed.data.id))
      .limit(1);

    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
      return;
    }

    const convertedIngredients = recipe.ingredients.map((original) => {
      const converted = convertIngredientToGrams(original);
      return {
        original,
        converted,
        hasConversion: converted !== null,
      };
    });

    res.json({
      originalIngredients: recipe.ingredients,
      convertedIngredients,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to convert to grams");
    res.status(500).json({ error: "Failed to convert measurements" });
  }
});

router.post("/uploads", upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No image file uploaded" });
    return;
  }
  const url = `/api/uploads/${req.file.filename}`;
  res.json({ url });
});

router.get("/uploads/:filename", (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadsDir, filename);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }

  res.sendFile(filePath);
});

function serializeRecipe(recipe: typeof recipesTable.$inferSelect) {
  return {
    ...recipe,
    attribute: (recipe.attribute as string[]) ?? [],
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
  };
}

export default router;
