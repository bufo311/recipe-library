import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  UseMutationOptions,
  UseQueryOptions,
  QueryKey,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";

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
  attribute: string[];
}

export interface ConversionResult {
  originalIngredients: string[];
  convertedIngredients: {
    original: string;
    converted: string | null;
    hasConversion: boolean;
  }[];
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
  attribute?: string[];
}

export type UpdateRecipeBody = Partial<CreateRecipeBody>;

export interface ListRecipesParams {
  search?: string;
  category?: string;
  course?: string;
  cuisine?: string;
  attribute?: string;
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init.body && typeof init.body === "string" ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  if (response.status === 204) return null as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error ?? data?.message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
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
// Hooks
// ---------------------------------------------------------------------------

export function useListRecipes(
  params?: ListRecipesParams,
  options?: { query?: UseQueryOptions<RecipeSummary[]> }
): UseQueryResult<RecipeSummary[]> & { queryKey: QueryKey } {
  const queryKey = options?.query?.queryKey ?? getListRecipesQueryKey(params);
  const qs = params
    ? "?" + new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v != null)) as Record<string, string>).toString()
    : "";

  const query = useQuery<RecipeSummary[]>({
    queryKey,
    queryFn: ({ signal }) => apiFetch<RecipeSummary[]>(`/api/recipes${qs}`, { signal }),
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
    queryFn: ({ signal }) => apiFetch<Recipe>(`/api/recipes/${id}`, { signal }),
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
    queryFn: ({ signal }) => apiFetch<RecipeStats>("/api/recipes/stats", { signal }),
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
    queryFn: ({ signal }) => apiFetch<RecipeFacets>("/api/recipes/facets", { signal }),
    ...options?.query,
  }) as UseQueryResult<RecipeFacets> & { queryKey: QueryKey };

  return { ...query, queryKey };
}

export function useCreateRecipe(options?: {
  mutation?: UseMutationOptions<Recipe, Error, { data: CreateRecipeBody }>;
}): UseMutationResult<Recipe, Error, { data: CreateRecipeBody }> {
  return useMutation<Recipe, Error, { data: CreateRecipeBody }>({
    mutationFn: ({ data }) =>
      apiFetch<Recipe>("/api/recipes", { method: "POST", body: JSON.stringify(data) }),
    ...options?.mutation,
  });
}

export function useScrapeRecipe(options?: {
  mutation?: UseMutationOptions<ScrapedRecipe, Error, { data: { url: string } }>;
}): UseMutationResult<ScrapedRecipe, Error, { data: { url: string } }> {
  return useMutation<ScrapedRecipe, Error, { data: { url: string } }>({
    mutationFn: ({ data }) =>
      apiFetch<ScrapedRecipe>("/api/recipes/scrape", { method: "POST", body: JSON.stringify(data) }),
    ...options?.mutation,
  });
}

export function useUpdateRecipe(options?: {
  mutation?: UseMutationOptions<Recipe, Error, { id: number; data: UpdateRecipeBody }>;
}): UseMutationResult<Recipe, Error, { id: number; data: UpdateRecipeBody }> {
  return useMutation<Recipe, Error, { id: number; data: UpdateRecipeBody }>({
    mutationFn: ({ id, data }) =>
      apiFetch<Recipe>(`/api/recipes/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    ...options?.mutation,
  });
}

export function useDeleteRecipe(options?: {
  mutation?: UseMutationOptions<null, Error, { id: number }>;
}): UseMutationResult<null, Error, { id: number }> {
  return useMutation<null, Error, { id: number }>({
    mutationFn: ({ id }) =>
      apiFetch<null>(`/api/recipes/${id}`, { method: "DELETE" }),
    ...options?.mutation,
  });
}

export function useConvertToGrams(options?: {
  mutation?: UseMutationOptions<ConversionResult, Error, { id: number }>;
}): UseMutationResult<ConversionResult, Error, { id: number }> {
  return useMutation<ConversionResult, Error, { id: number }>({
    mutationFn: ({ id }) =>
      apiFetch<ConversionResult>(`/api/recipes/${id}/convert-to-grams`, { method: "POST" }),
    ...options?.mutation,
  });
}
