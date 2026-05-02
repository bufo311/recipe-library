import { Router } from "express";
import { db, substitutionsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const CreateSubstitutionBody = z.object({
  ingredient: z.string().min(1).max(200),
  substitute: z.string().min(1).max(500),
  notes: z.string().max(500).optional(),
});

router.get("/substitutions", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(substitutionsTable)
      .orderBy(desc(substitutionsTable.createdAt));
    res.json(rows);
  } catch (err) {
    req.log.error(err, "Failed to list substitutions");
    res.status(500).json({ error: "Failed to list substitutions" });
  }
});

router.post("/substitutions", async (req, res) => {
  const parsed = CreateSubstitutionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  try {
    const [row] = await db
      .insert(substitutionsTable)
      .values(parsed.data)
      .returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error(err, "Failed to create substitution");
    res.status(500).json({ error: "Failed to create substitution" });
  }
});

router.delete("/substitutions/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.delete(substitutionsTable).where(eq(substitutionsTable.id, id));
    res.status(204).end();
  } catch (err) {
    req.log.error(err, "Failed to delete substitution");
    res.status(500).json({ error: "Failed to delete substitution" });
  }
});

export default router;
