import { Layout } from "@/components/layout";
import { UrlImporter } from "@/components/url-importer";
import { useListRecipes, useGetRecipeStats, useGetRecentRecipes, useGetRecipeFacets } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Plus, Search, Book, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

interface Filters {
  course: string | null;
  cuisine: string | null;
  attribute: string | null;
}

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<Filters>({ course: null, cuisine: null, attribute: null });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const { data: recipes, isLoading } = useListRecipes(
    {
      search: debouncedSearch || undefined,
      course: filters.course ?? undefined,
      cuisine: filters.cuisine ?? undefined,
      attribute: filters.attribute ?? undefined,
    },
    { query: { queryKey: ["/api/recipes", debouncedSearch, filters] } }
  );

  const { data: stats } = useGetRecipeStats();
  const { data: facets } = useGetRecipeFacets();

  const toggleFilter = (facet: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [facet]: prev[facet] === value ? null : value,
    }));
  };

  const clearFilters = () => setFilters({ course: null, cuisine: null, attribute: null });

  const hasFacets =
    (facets?.courses?.length ?? 0) > 0 ||
    (facets?.cuisines?.length ?? 0) > 0 ||
    (facets?.attributes?.length ?? 0) > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-8 space-y-6">
            <UrlImporter />
          </div>

          <div className="lg:col-span-4">
            <div className="bg-secondary/10 rounded-2xl p-6 border border-secondary/20 h-full flex flex-col justify-center">
              <h2 className="text-xl font-serif text-secondary-foreground mb-6 flex items-center gap-2">
                <Book className="h-5 w-5" /> Your Collection
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-xl p-4 shadow-sm">
                  <p className="text-3xl font-serif text-primary mb-1">{stats?.totalRecipes || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Recipes</p>
                </div>
                <div className="bg-background rounded-xl p-4 shadow-sm">
                  <p className="text-3xl font-serif text-primary mb-1">{stats?.recentCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Added recently</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasFacets && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Filter by</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              {(facets?.courses?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Course</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.courses.map((course) => (
                      <button
                        key={course}
                        onClick={() => toggleFilter("course", course)}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm border transition-all duration-150",
                          filters.course === course
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                        )}
                      >
                        {course}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(facets?.cuisines?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Cuisine</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.cuisines.map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => toggleFilter("cuisine", cuisine)}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm border transition-all duration-150",
                          filters.cuisine === cuisine
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                        )}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(facets?.attributes?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Attributes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.attributes.map((attr) => (
                      <button
                        key={attr}
                        onClick={() => toggleFilter("attribute", attr)}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm border transition-all duration-150",
                          filters.attribute === attr
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5"
                        )}
                      >
                        {attr}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Active:</span>
                {filters.course && (
                  <Badge variant="secondary" className="gap-1 text-xs font-normal pr-1">
                    Course: {filters.course}
                    <button onClick={() => toggleFilter("course", filters.course!)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
                {filters.cuisine && (
                  <Badge variant="secondary" className="gap-1 text-xs font-normal pr-1">
                    Cuisine: {filters.cuisine}
                    <button onClick={() => toggleFilter("cuisine", filters.cuisine!)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
                {filters.attribute && (
                  <Badge variant="secondary" className="gap-1 text-xs font-normal pr-1">
                    {filters.attribute}
                    <button onClick={() => toggleFilter("attribute", filters.attribute!)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-8">
          <h2 className="text-3xl font-serif">Recipe Index</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes..."
                className="pl-9 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button asChild className="shrink-0 h-10">
              <Link href="/recipe/new">
                <Plus className="h-4 w-4 mr-2" /> New
              </Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-[4/3] rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, idx) => (
              <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                <div
                  className="group cursor-pointer flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                  style={{ animationDelay: `${idx * 50}ms`, animationDuration: "500ms" }}
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-muted border border-border">
                    {recipe.imagePath ? (
                      <img
                        src={recipe.imagePath}
                        alt={recipe.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary/10 text-secondary">
                        <Book className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {recipe.course && (
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{recipe.course}</span>
                      )}
                      {recipe.course && recipe.cuisine && (
                        <span className="text-xs text-muted-foreground/50">·</span>
                      )}
                      {recipe.cuisine && (
                        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{recipe.cuisine}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-serif text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {recipe.title}
                    </h3>
                    {recipe.attribute && recipe.attribute.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recipe.attribute.map((attr) => (
                          <span
                            key={attr}
                            className="inline-block px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-foreground/70 text-xs"
                          >
                            {attr}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-muted/30 rounded-2xl border border-dashed border-border">
            <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-serif text-foreground mb-2">No recipes found</h3>
            <p className="text-muted-foreground">
              {activeFilterCount > 0
                ? "Try adjusting your filters or clearing them."
                : "Try a different search term or add a new recipe."}
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" /> Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
