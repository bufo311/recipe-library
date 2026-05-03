import { Layout } from "@/components/layout";
import { UrlImporter } from "@/components/url-importer";
import { useListRecipes, useGetRecipeStats, useGetRecipeFacets } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Book, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

const CLARET = "#722F37";
const DARK_BROWN = "#2C1810";
const CREAM = "#FDFBF7";
const PARCHMENT = "#F4ECD8";
const GOLD = "#D4AF37";

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-14">
          <div className="lg:col-span-8 space-y-6">
            <UrlImporter />
          </div>

          {/* Collection stats — Victorian ledger style */}
          <div className="lg:col-span-4">
            <div
              className="h-full flex flex-col justify-center p-6"
              style={{
                border: `3px double ${DARK_BROWN}`,
                backgroundColor: PARCHMENT,
                position: "relative",
              }}
            >
              <div style={{ position: "absolute", inset: 4, border: `1px solid ${DARK_BROWN}`, opacity: 0.25, pointerEvents: "none" }} />
              <h2
                className="flex items-center gap-2 mb-5"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: DARK_BROWN,
                  borderBottom: `1px solid ${DARK_BROWN}`,
                  paddingBottom: "0.5rem",
                  opacity: 0.8,
                }}
              >
                <Book className="h-4 w-4" /> The Ledger
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="text-center p-3"
                  style={{ borderRight: `1px solid ${DARK_BROWN}`, opacity: 0.8 }}
                >
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 900, color: CLARET, lineHeight: 1 }}>
                    {stats?.totalRecipes || 0}
                  </p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: DARK_BROWN, marginTop: 4, opacity: 0.7 }}>
                    Total Receipts
                  </p>
                </div>
                <div className="text-center p-3" style={{ opacity: 0.8 }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.5rem", fontWeight: 900, color: CLARET, lineHeight: 1 }}>
                    {stats?.recentCount || 0}
                  </p>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.15em", color: DARK_BROWN, marginTop: 4, opacity: 0.7 }}>
                    Recently Added
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ornamental divider */}
        <div className="text-center mb-8" style={{ color: DARK_BROWN, opacity: 0.4, fontSize: "1rem", letterSpacing: "0.2em" }}>
          ✦ ─── ❧ ─── ✦
        </div>

        {/* Filters */}
        {hasFacets && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: "0.65rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: DARK_BROWN,
                  opacity: 0.6,
                }}
              >
                Filter by Category
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs hover:opacity-100 transition-opacity"
                  style={{ color: CLARET, fontFamily: "'Outfit', sans-serif", opacity: 0.7 }}
                >
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-4">
              {(facets?.courses?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: DARK_BROWN, opacity: 0.5 }}>Course</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.courses.map((course) => (
                      <button
                        key={course}
                        onClick={() => toggleFilter("course", course)}
                        style={{
                          padding: "0.2rem 0.75rem",
                          fontSize: "0.75rem",
                          border: `1px solid ${filters.course === course ? CLARET : DARK_BROWN}`,
                          backgroundColor: filters.course === course ? CLARET : "transparent",
                          color: filters.course === course ? CREAM : DARK_BROWN,
                          fontFamily: "'Outfit', sans-serif",
                          letterSpacing: "0.05em",
                          transition: "all 0.15s",
                          opacity: filters.course === course ? 1 : 0.7,
                        }}
                      >
                        {course}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(facets?.cuisines?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: DARK_BROWN, opacity: 0.5 }}>Cuisine</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.cuisines.map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => toggleFilter("cuisine", cuisine)}
                        style={{
                          padding: "0.2rem 0.75rem",
                          fontSize: "0.75rem",
                          border: `1px solid ${filters.cuisine === cuisine ? CLARET : DARK_BROWN}`,
                          backgroundColor: filters.cuisine === cuisine ? CLARET : "transparent",
                          color: filters.cuisine === cuisine ? CREAM : DARK_BROWN,
                          fontFamily: "'Outfit', sans-serif",
                          letterSpacing: "0.05em",
                          transition: "all 0.15s",
                          opacity: filters.cuisine === cuisine ? 1 : 0.7,
                        }}
                      >
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(facets?.attributes?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.15em", color: DARK_BROWN, opacity: 0.5 }}>Attributes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.attributes.map((attr) => (
                      <button
                        key={attr}
                        onClick={() => toggleFilter("attribute", attr)}
                        style={{
                          padding: "0.2rem 0.75rem",
                          fontSize: "0.75rem",
                          border: `1px solid ${filters.attribute === attr ? CLARET : DARK_BROWN}`,
                          backgroundColor: filters.attribute === attr ? CLARET : "transparent",
                          color: filters.attribute === attr ? CREAM : DARK_BROWN,
                          fontFamily: "'Outfit', sans-serif",
                          letterSpacing: "0.05em",
                          transition: "all 0.15s",
                          opacity: filters.attribute === attr ? 1 : 0.7,
                        }}
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
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", color: DARK_BROWN, opacity: 0.5 }}>Active:</span>
                {filters.course && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "0.1rem 0.5rem", border: `1px solid ${CLARET}`, color: CLARET, fontSize: "0.7rem", fontFamily: "'Outfit', sans-serif" }}>
                    Course: {filters.course}
                    <button onClick={() => toggleFilter("course", filters.course!)} style={{ lineHeight: 1 }}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                {filters.cuisine && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "0.1rem 0.5rem", border: `1px solid ${CLARET}`, color: CLARET, fontSize: "0.7rem", fontFamily: "'Outfit', sans-serif" }}>
                    Cuisine: {filters.cuisine}
                    <button onClick={() => toggleFilter("cuisine", filters.cuisine!)} style={{ lineHeight: 1 }}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                {filters.attribute && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "0.1rem 0.5rem", border: `1px solid ${CLARET}`, color: CLARET, fontSize: "0.7rem", fontFamily: "'Outfit', sans-serif" }}>
                    {filters.attribute}
                    <button onClick={() => toggleFilter("attribute", filters.attribute!)} style={{ lineHeight: 1 }}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Header row */}
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-8">
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.75rem",
              fontWeight: 700,
              color: DARK_BROWN,
              borderBottom: `2px solid ${DARK_BROWN}`,
              paddingBottom: "0.25rem",
            }}
          >
            The Collection
          </h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: DARK_BROWN, opacity: 0.4 }} />
              <Input
                placeholder="Search the collection..."
                className="pl-9 h-10"
                style={{ borderColor: DARK_BROWN, borderRadius: 0, fontFamily: "'Outfit', sans-serif" }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              asChild
              className="shrink-0 h-10"
              style={{ backgroundColor: DARK_BROWN, color: CREAM, borderRadius: 0, fontFamily: "'Outfit', sans-serif", letterSpacing: "0.05em" }}
            >
              <Link href="/recipe/new">
                <Plus className="h-4 w-4 mr-2" /> New
              </Link>
            </Button>
          </div>
        </div>

        {/* Recipe grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-[4/3]" style={{ borderRadius: 0 }} />
                <Skeleton className="h-5 w-3/4" style={{ borderRadius: 0 }} />
                <Skeleton className="h-4 w-1/2" style={{ borderRadius: 0 }} />
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
                  {/* Victorian label card */}
                  <div
                    style={{
                      border: `2px solid ${DARK_BROWN}`,
                      backgroundColor: CREAM,
                      position: "relative",
                      transition: "box-shadow 0.2s, transform 0.2s",
                    }}
                    className="group-hover:shadow-[4px_4px_0_#2C1810]"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", borderBottom: `2px solid ${DARK_BROWN}` }}>
                      {recipe.imagePath ? (
                        <img
                          src={recipe.imagePath}
                          alt={recipe.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ filter: "sepia(0.15)" }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: PARCHMENT }}
                        >
                          <Book className="h-12 w-12" style={{ color: DARK_BROWN, opacity: 0.15 }} />
                        </div>
                      )}
                    </div>

                    {/* Label body */}
                    <div className="p-4">
                      {/* Course + cuisine tags */}
                      {(recipe.course || recipe.cuisine) && (
                        <p
                          className="mb-1"
                          style={{
                            fontFamily: "'Outfit', sans-serif",
                            fontSize: "0.6rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.2em",
                            color: CLARET,
                            opacity: 0.8,
                          }}
                        >
                          {[recipe.course, recipe.cuisine].filter(Boolean).join(" · ")}
                        </p>
                      )}

                      <h3
                        className="leading-snug"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "1.15rem",
                          fontWeight: 700,
                          color: DARK_BROWN,
                          transition: "color 0.2s",
                        }}
                      >
                        {recipe.title}
                      </h3>

                      {recipe.attribute && recipe.attribute.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {recipe.attribute.map((attr) => (
                            <span
                              key={attr}
                              style={{
                                display: "inline-block",
                                padding: "0.1rem 0.4rem",
                                border: `1px solid ${DARK_BROWN}`,
                                color: DARK_BROWN,
                                fontSize: "0.6rem",
                                fontFamily: "'Outfit', sans-serif",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                opacity: 0.6,
                              }}
                            >
                              {attr}
                            </span>
                          ))}
                        </div>
                      )}

                      <div
                        className="mt-3 pt-2 text-right"
                        style={{
                          borderTop: `1px solid ${DARK_BROWN}`,
                          opacity: 0.3,
                          fontSize: "0.6rem",
                          fontFamily: "'Outfit', sans-serif",
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: DARK_BROWN,
                        }}
                      >
                        ❧ Spencer's
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-24"
            style={{ border: `2px dashed ${DARK_BROWN}`, opacity: 0.6 }}
          >
            <Search className="h-8 w-8 mx-auto mb-4" style={{ color: DARK_BROWN, opacity: 0.3 }} />
            <h3
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", color: DARK_BROWN }}
            >
              No receipts found
            </h3>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem", color: DARK_BROWN, opacity: 0.6, marginTop: 8 }}>
              {activeFilterCount > 0
                ? "Try adjusting your filters or clearing them."
                : "Add a new receipt to begin your collection."}
            </p>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                className="mt-4"
                style={{ borderColor: DARK_BROWN, color: DARK_BROWN, borderRadius: 0, fontFamily: "'Outfit', sans-serif" }}
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" /> Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
