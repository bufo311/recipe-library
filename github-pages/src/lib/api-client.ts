import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  UseMutationOptions,
  UseQueryOptions,
  QueryKey,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { scrapeRecipeFromUrl } from "./recipe-scraper";
import { convertIngredientToGrams } from "./gram-converter";

// ---------------------------------------------------------------------------
// Supabase client (anon key — safe in frontend)
// ---------------------------------------------------------------------------

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecipeSummary {
  id: number;
  title: string;
  imagePath: string | null;
  yields: string | null;
  category: string | null;
  sourceUrl: string | null;
  course: string | null;
  cuisine: string | null;
  cook: string | null;
  attribute: string[];
  createdAt: string;
}

export interface Recipe extends RecipeSummary {
  ingredients: string[];
  instructions: string[];
  notes: string | null;
  totalTime: string | null;
  prepTime: string | null;
  cookTime: string | null;
  updatedAt: string;
}

export interface RecipeStats {
  totalRecipes: number;
  recentCount: number;
  categoryCounts: { category: string; count: number }[];
}

export interface RecipeFacets {
  courses: string[];
  cuisines: string[];
  attributes: string[];
  cooks: string[];
}

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
  cook: string | null;
  attribute: string[];
}

export interface ConversionResult {
  originalIngredients: string[];
  convertedIngredients: { original: string; converted: string | null; hasConversion: boolean }[];
}

export interface CreateRecipeBody {
  title: string;
  sourceUrl?: string;
  ingredients: string[];
  instructions: string[];
  imagePath?: string;
  yields?: string;
  category?: string;
  notes?: string;
  totalTime?: string;
  prepTime?: string;
  cookTime?: string;
  course?: string;
  cuisine?: string;
  cook?: string;
  attribute?: string[];
}

export type UpdateRecipeBody = Partial<CreateRecipeBody>;

export interface ListRecipesParams {
  search?: string;
  category?: string;
  course?: string;
  cuisine?: string;
  attribute?: string;
  cook?: string;
}

// ---------------------------------------------------------------------------
// Row ↔ model mappers (snake_case DB ↔ camelCase TS)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRecipe(row: any): Recipe {
  return {
    id: row.id,
    title: row.title,
    sourceUrl: row.source_url ?? null,
    ingredients: row.ingredients ?? [],
    instructions: row.instructions ?? [],
    imagePath: row.image_path ?? null,
    yields: row.yields ?? null,
    category: row.category ?? null,
    notes: row.notes ?? null,
    totalTime: row.total_time ?? null,
    prepTime: row.prep_time ?? null,
    cookTime: row.cook_time ?? null,
    course: row.course ?? null,
    cuisine: row.cuisine ?? null,
    cook: row.cook ?? null,
    attribute: row.attribute ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToSummary(row: any): RecipeSummary {
  return {
    id: row.id,
    title: row.title,
    sourceUrl: row.source_url ?? null,
    imagePath: row.image_path ?? null,
    yields: row.yields ?? null,
    category: row.category ?? null,
    course: row.course ?? null,
    cuisine: row.cuisine ?? null,
    cook: row.cook ?? null,
    attribute: row.attribute ?? [],
    createdAt: row.created_at,
  };
}

function recipeToRow(data: CreateRecipeBody) {
  return {
    title: data.title,
    source_url: data.sourceUrl ?? null,
    ingredients: data.ingredients,
    instructions: data.instructions,
    image_path: data.imagePath ?? null,
    yields: data.yields ?? null,
    category: data.category ?? null,
    notes: data.notes ?? null,
    total_time: data.totalTime ?? null,
    prep_time: data.prepTime ?? null,
    cook_time: data.cookTime ?? null,
    course: data.course ?? null,
    cuisine: data.cuisine ?? null,
    cook: data.cook ?? null,
    attribute: data.attribute ?? [],
  };
}

// ---------------------------------------------------------------------------
// Data fetchers
// ---------------------------------------------------------------------------

const SUMMARY_COLUMNS =
  "id, title, image_path, yields, category, source_url, course, cuisine, cook, attribute, created_at";

async function fetchListRecipes(params?: ListRecipesParams): Promise<RecipeSummary[]> {
  let q = supabase.from("recipes").select(SUMMARY_COLUMNS).order("created_at", { ascending: false });
  if (params?.search) q = q.ilike("title", `%${params.search}%`);
  if (params?.category) q = q.eq("category", params.category);
  if (params?.course) q = q.eq("course", params.course);
  if (params?.cuisine) q = q.eq("cuisine", params.cuisine);
  if (params?.cook) q = q.eq("cook", params.cook);
  if (params?.attribute) q = q.filter("attribute", "cs", JSON.stringify([params.attribute]));
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToSummary);
}

async function fetchRecipe(id: number): Promise<Recipe> {
  const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();
  if (error) throw new Error(error.message);
  return rowToRecipe(data);
}

async function fetchRecipeStats(): Promise<RecipeStats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [totalResult, categoryResult, recentResult] = await Promise.all([
    supabase.from("recipes").select("*", { count: "exact", head: true }),
    supabase.from("recipes").select("category").not("category", "is", null),
    supabase.from("recipes").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
  ]);
  if (totalResult.error) throw new Error(totalResult.error.message);
  const cats = categoryResult.data ?? [];
  const countMap = new Map<string, number>();
  for (const r of cats) {
    if (r.category) countMap.set(r.category, (countMap.get(r.category) ?? 0) + 1);
  }
  return {
    totalRecipes: totalResult.count ?? 0,
    recentCount: recentResult.count ?? 0,
    categoryCounts: Array.from(countMap.entries()).map(([category, count]) => ({ category, count })),
  };
}

async function fetchRecipeFacets(): Promise<RecipeFacets> {
  const { data, error } = await supabase.from("recipes").select("course, cuisine, cook, attribute");
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const courses = [...new Set(rows.map((r) => r.course).filter((v): v is string => !!v))].sort();
  const cuisines = [...new Set(rows.map((r) => r.cuisine).filter((v): v is string => !!v))].sort();
  const cooks = [...new Set(rows.map((r) => r.cook).filter((v): v is string => !!v))].sort();
  const attributes = [...new Set(rows.flatMap((r) => (r.attribute as string[]) ?? []))].sort();
  return { courses, cuisines, attributes, cooks };
}

async function doCreateRecipe(body: CreateRecipeBody): Promise<Recipe> {
  const { data, error } = await supabase.from("recipes").insert(recipeToRow(body)).select().single();
  if (error) throw new Error(error.message);
  return rowToRecipe(data);
}

async function doUpdateRecipe(id: number, body: UpdateRecipeBody): Promise<Recipe> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.sourceUrl !== undefined) updates.source_url = body.sourceUrl ?? null;
  if (body.ingredients !== undefined) updates.ingredients = body.ingredients;
  if (body.instructions !== undefined) updates.instructions = body.instructions;
  if (body.imagePath !== undefined) updates.image_path = body.imagePath ?? null;
  if (body.yields !== undefined) updates.yields = body.yields ?? null;
  if (body.category !== undefined) updates.category = body.category ?? null;
  if (body.notes !== undefined) updates.notes = body.notes ?? null;
  if (body.totalTime !== undefined) updates.total_time = body.totalTime ?? null;
  if (body.prepTime !== undefined) updates.prep_time = body.prepTime ?? null;
  if (body.cookTime !== undefined) updates.cook_time = body.cookTime ?? null;
  if (body.course !== undefined) updates.course = body.course ?? null;
  if (body.cuisine !== undefined) updates.cuisine = body.cuisine ?? null;
  if (body.cook !== undefined) updates.cook = body.cook ?? null;
  if (body.attribute !== undefined) updates.attribute = body.attribute ?? [];
  const { data, error } = await supabase.from("recipes").update(updates).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return rowToRecipe(data);
}

async function doDeleteRecipe(id: number): Promise<null> {
  const { error } = await supabase.from("recipes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  return null;
}

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

export const getListRecipesQueryKey = (params?: ListRecipesParams) =>
  ["/api/recipes", ...(params ? [params] : [])] as const;

export const getGetRecipeQueryKey = (id: number) =>
  [`/api/recipes/${id}`] as const;

export const getGetRecipeStatsQueryKey = () =>
  ["/api/recipes/stats"] as const;

export const getGetRecipeFacetsQueryKey = () =>
  ["/api/recipes/facets"] as const;

// ---------------------------------------------------------------------------
// Hooks (same interface as standalone/api-client.ts — pages are identical)
// ---------------------------------------------------------------------------

export function useListRecipes(
  params?: ListRecipesParams,
  options?: { query?: UseQueryOptions<RecipeSummary[]> }
): UseQueryResult<RecipeSummary[]> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getListRecipesQueryKey(params);
  const query = useQuery<RecipeSummary[]>({
    queryKey,
    queryFn: () => fetchListRecipes(params),
    ...options?.query,
  }) as UseQueryResult<RecipeSummary[]> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

export function useGetRecipe(
  id: number,
  options?: { query?: UseQueryOptions<Recipe> }
): UseQueryResult<Recipe> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getGetRecipeQueryKey(id);
  const query = useQuery<Recipe>({
    queryKey,
    queryFn: () => fetchRecipe(id),
    enabled: !!id,
    ...options?.query,
  }) as UseQueryResult<Recipe> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

export function useGetRecipeStats(
  options?: { query?: UseQueryOptions<RecipeStats> }
): UseQueryResult<RecipeStats> & { queryKey: QueryKey } {
  const queryKey = getGetRecipeStatsQueryKey();
  const query = useQuery<RecipeStats>({
    queryKey,
    queryFn: fetchRecipeStats,
    ...options?.query,
  }) as UseQueryResult<RecipeStats> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

export function useGetRecipeFacets(
  options?: { query?: UseQueryOptions<RecipeFacets> }
): UseQueryResult<RecipeFacets> & { queryKey: QueryKey } {
  const queryKey = getGetRecipeFacetsQueryKey();
  const query = useQuery<RecipeFacets>({
    queryKey,
    queryFn: fetchRecipeFacets,
    ...options?.query,
  }) as UseQueryResult<RecipeFacets> & { queryKey: QueryKey };
  return { ...query, queryKey };
}

export function useCreateRecipe(options?: {
  mutation?: UseMutationOptions<Recipe, Error, { data: CreateRecipeBody }>;
}): UseMutationResult<Recipe, Error, { data: CreateRecipeBody }> {
  return useMutation<Recipe, Error, { data: CreateRecipeBody }>({
    mutationFn: ({ data }) => doCreateRecipe(data),
    ...options?.mutation,
  });
}

export function useScrapeRecipe(options?: {
  mutation?: UseMutationOptions<ScrapedRecipe, Error, { data: { url: string } }>;
}): UseMutationResult<ScrapedRecipe, Error, { data: { url: string } }> {
  return useMutation<ScrapedRecipe, Error, { data: { url: string } }>({
    mutationFn: ({ data }) => scrapeRecipeFromUrl(data.url),
    ...options?.mutation,
  });
}

export function useUpdateRecipe(options?: {
  mutation?: UseMutationOptions<Recipe, Error, { id: number; data: UpdateRecipeBody }>;
}): UseMutationResult<Recipe, Error, { id: number; data: UpdateRecipeBody }> {
  return useMutation<Recipe, Error, { id: number; data: UpdateRecipeBody }>({
    mutationFn: ({ id, data }) => doUpdateRecipe(id, data),
    ...options?.mutation,
  });
}

export function useDeleteRecipe(options?: {
  mutation?: UseMutationOptions<null, Error, { id: number }>;
}): UseMutationResult<null, Error, { id: number }> {
  return useMutation<null, Error, { id: number }>({
    mutationFn: ({ id }) => doDeleteRecipe(id),
    ...options?.mutation,
  });
}

export function useConvertToGrams(options?: {
  mutation?: UseMutationOptions<ConversionResult, Error, { id: number }>;
}): UseMutationResult<ConversionResult, Error, { id: number }> {
  return useMutation<ConversionResult, Error, { id: number }>({
    mutationFn: async ({ id }) => {
      const recipe = await fetchRecipe(id);
      const convertedIngredients = recipe.ingredients.map((original) => {
        const converted = convertIngredientToGrams(original);
        return { original, converted, hasConversion: converted !== null };
      });
      return { originalIngredients: recipe.ingredients, convertedIngredients };
    },
    ...options?.mutation,
  });
}
