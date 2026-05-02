import { Layout } from "@/components/layout";
import { UrlImporter } from "@/components/url-importer";
import { useListRecipes, useGetRecipeStats, useGetRecentRecipes } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Plus, Search, Book } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: recipes, isLoading } = useListRecipes(
    { search: debouncedSearch || undefined }, 
    { query: { queryKey: ["/api/recipes", debouncedSearch] } }
  );
  const { data: stats } = useGetRecipeStats();
  const { data: recentRecipes } = useGetRecentRecipes({ limit: 3 });

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
                    {recipe.category && (
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5">{recipe.category}</p>
                    )}
                    <h3 className="text-xl font-serif text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {recipe.title}
                    </h3>
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
            <p className="text-muted-foreground">Try a different search term or add a new recipe.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
