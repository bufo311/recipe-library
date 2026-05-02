import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const substitutionsTable = pgTable("substitutions", {
  id: serial("id").primaryKey(),
  ingredient: text("ingredient").notNull(),
  substitute: text("substitute").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSubstitutionSchema = createInsertSchema(substitutionsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertSubstitution = z.infer<typeof insertSubstitutionSchema>;
export type Substitution = typeof substitutionsTable.$inferSelect;
