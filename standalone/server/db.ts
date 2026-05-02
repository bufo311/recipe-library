import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema: { recipesTable } });

export const recipesTable = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  sourceUrl: text("source_url"),
  ingredients: jsonb("ingredients").$type<string[]>().notNull().default([]),
  instructions: jsonb("instructions").$type<string[]>().notNull().default([]),
  imagePath: text("image_path"),
  yields: text("yields"),
  category: text("category"),
  notes: text("notes"),
  totalTime: text("total_time"),
  prepTime: text("prep_time"),
  cookTime: text("cook_time"),
  course: text("course"),
  cuisine: text("cuisine"),
  attribute: jsonb("attribute").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Recipe = typeof recipesTable.$inferSelect;
