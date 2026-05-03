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

/* Maltby's + Eastern Mills palette */
const GREEN  = "#1D5C35";
const CLARET = "#8C1F28";
const GOLD   = "#C8A020";
const TEAL   = "#3D7A72";
const CREAM  = "#F5EEE0";
const PARCH  = "#E8D5A8";
const INK    = "#1E0E04";

/* Rotate through product-box header colours for recipe cards */
const CARD_COLORS = [GREEN, CLARET, TEAL, "#4A3880", "#7A4010", "#1A5472"];

interface Filters { course: string | null; cuisine: string | null; attribute: string | null; }

export default function Dashboard() {
  const [search, setSearch]   = useState("");
  const debouncedSearch        = useDebounce(search, 300);
  const [filters, setFilters] = useState<Filters>({ course: null, cuisine: null, attribute: null });
  const activeFilterCount      = Object.values(filters).filter(Boolean).length;

  const { data: recipes, isLoading } = useListRecipes(
    { search: debouncedSearch || undefined, course: filters.course ?? undefined,
      cuisine: filters.cuisine ?? undefined, attribute: filters.attribute ?? undefined },
    { query: { queryKey: ["/api/recipes", debouncedSearch, filters] } }
  );
  const { data: stats  } = useGetRecipeStats();
  const { data: facets } = useGetRecipeFacets();

  const toggleFilter = (facet: keyof Filters, value: string) =>
    setFilters(prev => ({ ...prev, [facet]: prev[facet] === value ? null : value }));
  const clearFilters = () => setFilters({ course: null, cuisine: null, attribute: null });

  const hasFacets =
    (facets?.courses?.length    ?? 0) > 0 ||
    (facets?.cuisines?.length   ?? 0) > 0 ||
    (facets?.attributes?.length ?? 0) > 0;

  /* helper: render a filter pill */
  const FilterPill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} style={{
      padding: "0.2rem 0.8rem", fontSize: "0.72rem",
      fontFamily: "'Outfit', sans-serif", letterSpacing: "0.06em",
      border: `1px solid ${active ? CLARET : INK}`,
      backgroundColor: active ? CLARET : "transparent",
      color: active ? CREAM : INK,
      opacity: active ? 1 : 0.65,
      transition: "all 0.15s",
    }}>
      {children}
    </button>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">

        {/* Top grid: importer + ledger stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-8"><UrlImporter /></div>

          {/* Ledger — Maltby's label style */}
          <div className="lg:col-span-4">
            <div style={{ border: `2px solid ${INK}` }}>
              <div style={{ backgroundColor: GREEN, padding: "0.5rem 1rem", textAlign: "center" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.75rem", fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.22em", color: CREAM,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Book className="h-3.5 w-3.5" /> The Ledger
                </h2>
              </div>
              <div style={{ height: 3, backgroundColor: GOLD }} />
              <div style={{ backgroundColor: PARCH, padding: "1.25rem" }}>
                <div className="grid grid-cols-2 gap-0">
                  <div className="text-center py-3" style={{ borderRight: `1px solid ${INK}`, opacity: 0.8 }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.6rem", fontWeight: 900,
                      color: CLARET, lineHeight: 1 }}>
                      {stats?.totalRecipes || 0}
                    </p>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.58rem", textTransform: "uppercase",
                      letterSpacing: "0.15em", color: INK, marginTop: 4, opacity: 0.65 }}>
                      Total Receipts
                    </p>
                  </div>
                  <div className="text-center py-3" style={{ opacity: 0.8 }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.6rem", fontWeight: 900,
                      color: GREEN, lineHeight: 1 }}>
                      {stats?.recentCount || 0}
                    </p>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.58rem", textTransform: "uppercase",
                      letterSpacing: "0.15em", color: INK, marginTop: 4, opacity: 0.65 }}>
                      Recently Added
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ height: 3, backgroundColor: GOLD }} />
              <div style={{ height: 5, backgroundColor: CLARET }} />
            </div>
          </div>
        </div>

        {/* Ornamental divider */}
        <div className="text-center mb-8"
          style={{ color: CLARET, opacity: 0.55, fontSize: "1rem", letterSpacing: "0.22em" }}>
          ✦ ─── ❧ ─── ✦
        </div>

        {/* Filters */}
        {hasFacets && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.58rem", textTransform: "uppercase",
                letterSpacing: "0.2em", color: INK, opacity: 0.5 }}>
                Filter by Category
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="flex items-center gap-1"
                  style={{ color: CLARET, fontSize: "0.7rem", fontFamily: "'Outfit', sans-serif", opacity: 0.75 }}>
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {(facets?.courses?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem", textTransform: "uppercase",
                    letterSpacing: "0.15em", color: INK, opacity: 0.45 }}>Course</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.courses.map(c => <FilterPill key={c} active={filters.course === c} onClick={() => toggleFilter("course", c)}>{c}</FilterPill>)}
                  </div>
                </div>
              )}
              {(facets?.cuisines?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem", textTransform: "uppercase",
                    letterSpacing: "0.15em", color: INK, opacity: 0.45 }}>Cuisine</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.cuisines.map(c => <FilterPill key={c} active={filters.cuisine === c} onClick={() => toggleFilter("cuisine", c)}>{c}</FilterPill>)}
                  </div>
                </div>
              )}
              {(facets?.attributes?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem", textTransform: "uppercase",
                    letterSpacing: "0.15em", color: INK, opacity: 0.45 }}>Attributes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.attributes.map(a => <FilterPill key={a} active={filters.attribute === a} onClick={() => toggleFilter("attribute", a)}>{a}</FilterPill>)}
                  </div>
                </div>
              )}
            </div>
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", color: INK, opacity: 0.45 }}>Active:</span>
                {filters.course && (
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"0.1rem 0.5rem",
                    border:`1px solid ${CLARET}`, color: CLARET, fontSize:"0.65rem", fontFamily:"'Outfit',sans-serif" }}>
                    Course: {filters.course}
                    <button onClick={() => toggleFilter("course", filters.course!)}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                {filters.cuisine && (
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"0.1rem 0.5rem",
                    border:`1px solid ${CLARET}`, color: CLARET, fontSize:"0.65rem", fontFamily:"'Outfit',sans-serif" }}>
                    Cuisine: {filters.cuisine}
                    <button onClick={() => toggleFilter("cuisine", filters.cuisine!)}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
                {filters.attribute && (
                  <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"0.1rem 0.5rem",
                    border:`1px solid ${CLARET}`, color: CLARET, fontSize:"0.65rem", fontFamily:"'Outfit',sans-serif" }}>
                    {filters.attribute}
                    <button onClick={() => toggleFilter("attribute", filters.attribute!)}><X className="h-2.5 w-2.5" /></button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Collection header + search */}
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-8">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.65rem", fontWeight: 700,
            color: INK, borderBottom: `3px solid ${GREEN}`, paddingBottom: "0.2rem" }}>
            The Collection
          </h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: INK, opacity: 0.4 }} />
              <Input placeholder="Search the collection…" className="pl-9 h-10"
                style={{ border: `1px solid ${INK}`, borderRadius: 0, backgroundColor: CREAM,
                  fontFamily: "'Outfit', sans-serif", color: INK }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button asChild className="shrink-0 h-10"
              style={{ backgroundColor: GREEN, color: CREAM, borderRadius: 0,
                fontFamily: "'Outfit', sans-serif", letterSpacing: "0.06em" }}>
              <Link href="/recipe/new"><Plus className="h-4 w-4 mr-2" />New</Link>
            </Button>
          </div>
        </div>

        {/* Recipe grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i}>
                <Skeleton className="h-7 w-full mb-0" style={{ borderRadius: 0 }} />
                <Skeleton className="w-full aspect-[4/3]" style={{ borderRadius: 0 }} />
                <Skeleton className="h-5 w-3/4 mt-3" style={{ borderRadius: 0 }} />
              </div>
            ))}
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map((recipe, idx) => {
              const headerColor = CARD_COLORS[idx % CARD_COLORS.length];
              return (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                  <div className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                    style={{ animationDelay: `${idx * 50}ms`, animationDuration: "500ms",
                      border: `2px solid ${INK}`, backgroundColor: CREAM,
                      transition: "box-shadow 0.2s, transform 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = `4px 4px 0 ${headerColor}`)}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}>

                    {/* Coloured product-box header stripe */}
                    <div style={{ backgroundColor: headerColor, padding: "0.4rem 0.75rem",
                      borderBottom: `2px solid ${INK}` }}>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem",
                        textTransform: "uppercase", letterSpacing: "0.22em", color: CREAM, opacity: 0.85 }}>
                        {[recipe.course, recipe.cuisine].filter(Boolean).join(" · ") || "Spencer's Emporium"}
                      </p>
                    </div>

                    {/* Gold rule */}
                    <div style={{ height: 2, backgroundColor: GOLD }} />

                    {/* Image */}
                    <div style={{ aspectRatio: "4/3", overflow: "hidden", borderBottom: `1px solid ${INK}` }}>
                      {recipe.imagePath ? (
                        <img src={recipe.imagePath} alt={recipe.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ filter: "sepia(0.18) contrast(1.05)" }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: PARCH }}>
                          <Book className="h-10 w-10" style={{ color: INK, opacity: 0.12 }} />
                        </div>
                      )}
                    </div>

                    {/* Label body */}
                    <div style={{ padding: "0.85rem 0.85rem 0.65rem", backgroundColor: CREAM }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.05rem", fontWeight: 700,
                        color: INK, lineHeight: 1.3 }}>
                        {recipe.title}
                      </h3>
                      {recipe.attribute && recipe.attribute.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {recipe.attribute.map(attr => (
                            <span key={attr} style={{ display: "inline-block", padding: "0.1rem 0.4rem",
                              border: `1px solid ${INK}`, color: INK, fontSize: "0.58rem",
                              fontFamily: "'Outfit', sans-serif", textTransform: "uppercase",
                              letterSpacing: "0.1em", opacity: 0.55 }}>
                              {attr}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 pt-2 text-right"
                        style={{ borderTop: `1px solid ${INK}`, opacity: 0.25, fontSize: "0.56rem",
                          fontFamily: "'Outfit', sans-serif", letterSpacing: "0.15em",
                          textTransform: "uppercase", color: INK }}>
                        ❧ Spencer's
                      </div>
                    </div>

                    {/* Bottom coloured rule */}
                    <div style={{ height: 4, backgroundColor: headerColor }} />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20" style={{ border: `2px dashed ${GREEN}`, opacity: 0.6 }}>
            <Search className="h-8 w-8 mx-auto mb-4" style={{ color: INK, opacity: 0.25 }} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: INK }}>
              No receipts found
            </h3>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.82rem", color: INK, opacity: 0.55, marginTop: 6 }}>
              {activeFilterCount > 0 ? "Try adjusting your filters." : "Add a new receipt to begin your collection."}
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}
                style={{ borderColor: GREEN, color: GREEN, borderRadius: 0, fontFamily: "'Outfit',sans-serif" }}>
                <X className="h-4 w-4 mr-2" />Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
