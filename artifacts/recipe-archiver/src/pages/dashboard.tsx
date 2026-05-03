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

const MAROON = "#4A1520";
const TEAL   = "#3D7A72";
const GOLD   = "#C8A020";
const ROSE   = "#C05870";
const CREAM  = "#F5EEE0";
const PARCH  = "#E8D5A8";
const BLACK  = "#140A04";
const INK    = "#1E0E04";
const POWDER = "#A8CBCF";
const SAGE   = "#5E7A58";

const EGG_DART_DARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12'%3E%3Crect width='20' height='12' fill='%23140A04'/%3E%3Cellipse cx='10' cy='6' rx='8' ry='3.5' fill='%23C8A020' opacity='0.3'/%3E%3Cellipse cx='10' cy='6' rx='5.5' ry='2' fill='%23140A04'/%3E%3Ccircle cx='0' cy='6' r='2' fill='%23C8A020' opacity='0.45'/%3E%3Ccircle cx='20' cy='6' r='2' fill='%23C8A020' opacity='0.45'/%3E%3C/svg%3E")`;
const CABLE_TEAL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='10'%3E%3Crect width='20' height='10' fill='%233D7A72'/%3E%3Cpath d='M0 5 Q5 1 10 5 Q15 9 20 5' fill='none' stroke='%23F5EEE0' stroke-width='0.9' opacity='0.35'/%3E%3Cpath d='M0 5 Q5 9 10 5 Q15 1 20 5' fill='none' stroke='%23F5EEE0' stroke-width='0.9' opacity='0.35'/%3E%3C/svg%3E")`;
const CHEVRON_GOLD = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='8'%3E%3Crect width='16' height='8' fill='%23C8A020'/%3E%3Cpath d='M0 4 L4 1 L8 4 L12 1 L16 4 L12 7 L8 4 L4 7 Z' fill='none' stroke='%23140A04' stroke-width='0.7' opacity='0.35'/%3E%3C/svg%3E")`;

const MILLS_SHADOW = `1px 1px 0 #0A0402, 2px 2px 0 #0A0402, 3px 3px 0 rgba(0,0,0,0.3)`;

const CARD_ACCENTS = [MAROON, TEAL, "#4A3880", "#7A4010", "#1A5472", ROSE];

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
    (facets?.courses?.length  ?? 0) > 0 ||
    (facets?.cuisines?.length ?? 0) > 0 ||
    (facets?.attributes?.length ?? 0) > 0;

  const FilterPill = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick} style={{
      padding: "0.2rem 0.8rem", fontSize: "0.72rem",
      fontFamily: "'Outfit', sans-serif", letterSpacing: "0.06em",
      border: `1px solid ${active ? ROSE : INK}`,
      backgroundColor: active ? ROSE : "transparent",
      color: active ? CREAM : INK, opacity: active ? 1 : 0.65, transition: "all 0.15s",
    }}>
      {children}
    </button>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">

        {/* Top grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          <div className="lg:col-span-8"><UrlImporter /></div>

          {/* Ledger */}
          <div className="lg:col-span-4">
            <div style={{ border: `2px solid ${BLACK}`, overflow: "hidden" }}>
              <div style={{ height: 12, backgroundImage: EGG_DART_DARK, backgroundRepeat: "repeat-x" }} />
              <div style={{ backgroundColor: SAGE, padding: "0.55rem 1rem",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                borderBottom: `2px solid ${GOLD}` }}>
                <Book className="h-3.5 w-3.5" style={{ color: CREAM, opacity: 0.7 }} />
                <h2 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: "0.8rem",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em",
                  color: CREAM, textShadow: `1px 1px 0 #1A3A18, 2px 2px 0 rgba(0,0,0,0.3)`,
                }}>
                  The Ledger
                </h2>
              </div>
              <div style={{ backgroundColor: PARCH }}>
                <div className="grid grid-cols-2">
                  <div className="text-center py-4" style={{ borderRight: `2px solid ${BLACK}` }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.8rem",
                      fontWeight: 900, color: MAROON, lineHeight: 1 }}>
                      {stats?.totalRecipes || 0}
                    </p>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem",
                      textTransform: "uppercase", letterSpacing: "0.15em", color: INK, marginTop: 4, opacity: 0.6 }}>
                      Total Receipts
                    </p>
                  </div>
                  <div className="text-center py-4">
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.8rem",
                      fontWeight: 900, color: TEAL, lineHeight: 1 }}>
                      {stats?.recentCount || 0}
                    </p>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem",
                      textTransform: "uppercase", letterSpacing: "0.15em", color: INK, marginTop: 4, opacity: 0.6 }}>
                      Recently Added
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ height: 10, backgroundImage: CABLE_TEAL, backgroundRepeat: "repeat-x" }} />
              <div style={{ height: 5, backgroundColor: ROSE }} />
            </div>
          </div>
        </div>

        {/* Ornamental rule */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ height: 12, backgroundImage: EGG_DART_DARK, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 8, backgroundImage: CHEVRON_GOLD, backgroundRepeat: "repeat-x" }} />
          <div style={{ display: "flex", height: 4 }}>
            <div style={{ flex: 1, backgroundColor: ROSE   }} />
            <div style={{ flex: 2, backgroundColor: TEAL   }} />
            <div style={{ flex: 1, backgroundColor: MAROON }} />
            <div style={{ flex: 2, backgroundColor: TEAL   }} />
            <div style={{ flex: 1, backgroundColor: ROSE   }} />
          </div>
        </div>

        {/* Filters */}
        {hasFacets && (
          <div className="mb-8 space-y-3">
            <div className="flex items-center justify-between">
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.58rem",
                textTransform: "uppercase", letterSpacing: "0.2em", color: INK, opacity: 0.5 }}>
                Filter by Category
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="flex items-center gap-1"
                  style={{ color: ROSE, fontSize: "0.7rem", fontFamily: "'Outfit', sans-serif" }}>
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-4">
              {(facets?.courses?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem",
                    textTransform: "uppercase", letterSpacing: "0.15em", color: INK, opacity: 0.45 }}>Course</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.courses.map(c => <FilterPill key={c} active={filters.course === c} onClick={() => toggleFilter("course", c)}>{c}</FilterPill>)}
                  </div>
                </div>
              )}
              {(facets?.cuisines?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem",
                    textTransform: "uppercase", letterSpacing: "0.15em", color: INK, opacity: 0.45 }}>Cuisine</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.cuisines.map(c => <FilterPill key={c} active={filters.cuisine === c} onClick={() => toggleFilter("cuisine", c)}>{c}</FilterPill>)}
                  </div>
                </div>
              )}
              {(facets?.attributes?.length ?? 0) > 0 && (
                <div className="space-y-1.5">
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem",
                    textTransform: "uppercase", letterSpacing: "0.15em", color: INK, opacity: 0.45 }}>Attributes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {facets!.attributes.map(a => <FilterPill key={a} active={filters.attribute === a} onClick={() => toggleFilter("attribute", a)}>{a}</FilterPill>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collection header + search */}
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-8">
          <div>
            {/* Decorative band above title */}
            <div style={{ height: 10, backgroundImage: CABLE_TEAL, backgroundRepeat: "repeat-x",
              marginBottom: 0 }} />
            <div style={{ backgroundColor: SAGE, padding: "0.35rem 1.25rem 0.4rem",
              display: "inline-block" }}>
              <h2 style={{
                fontFamily: "'Playfair Display', serif", fontSize: "1.6rem",
                fontWeight: 900, color: CREAM, textTransform: "uppercase", letterSpacing: "0.1em",
                textShadow: MILLS_SHADOW,
              }}>
                The Collection
              </h2>
            </div>
            <div style={{ height: 4, backgroundColor: ROSE, width: "100%" }} />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                style={{ color: INK, opacity: 0.4 }} />
              <Input placeholder="Search the collection…" className="pl-9 h-10"
                style={{ border: `2px solid ${BLACK}`, borderRadius: 0, backgroundColor: CREAM,
                  fontFamily: "'Outfit', sans-serif", color: INK }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Button asChild className="shrink-0 h-10"
              style={{ backgroundColor: MAROON, color: CREAM, borderRadius: 0,
                fontFamily: "'Outfit', sans-serif", letterSpacing: "0.06em",
                border: `2px solid ${BLACK}` }}>
              <Link href="/recipe/new"><Plus className="h-4 w-4 mr-2" />New</Link>
            </Button>
          </div>
        </div>

        {/* Recipe grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ border: `2px solid ${BLACK}` }}>
                <Skeleton className="h-12 w-full" style={{ borderRadius: 0 }} />
                <Skeleton className="w-full aspect-[4/3]" style={{ borderRadius: 0 }} />
                <Skeleton className="h-16 w-full" style={{ borderRadius: 0 }} />
              </div>
            ))}
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map((recipe, idx) => {
              const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
              return (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                  <article className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                    style={{ animationDelay: `${idx * 50}ms`, animationDuration: "500ms",
                      border: `2px solid ${BLACK}`, transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = `5px 5px 0 ${BLACK}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none"; }}>

                    {/* Egg-and-dart top ornament */}
                    <div style={{ height: 10, backgroundImage: EGG_DART_DARK, backgroundRepeat: "repeat-x" }} />

                    {/* Sage title band — MILLS style */}
                    <div style={{ backgroundColor: SAGE, padding: "0.6rem 0.85rem",
                      borderBottom: `2px solid ${BLACK}`, borderTop: `1px solid ${BLACK}` }}>
                      <h3 style={{
                        fontFamily: "'Playfair Display', serif", fontSize: "1rem",
                        fontWeight: 900, color: CREAM, lineHeight: 1.25,
                        textShadow: `1px 1px 0 #0A1A08, 2px 2px 0 rgba(0,0,0,0.28)`,
                      }}>
                        {recipe.title}
                      </h3>
                    </div>

                    {/* Teal course band */}
                    <div style={{ backgroundColor: TEAL, padding: "0.22rem 0.85rem",
                      borderBottom: `1px solid ${BLACK}` }}>
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.58rem",
                        textTransform: "uppercase", letterSpacing: "0.2em", color: CREAM, opacity: 0.9 }}>
                        {[recipe.course, recipe.cuisine].filter(Boolean).join(" · ") || "Spencer's Emporium"}
                      </p>
                    </div>

                    {/* Rose strip */}
                    <div style={{ height: 4, backgroundColor: ROSE }} />

                    {/* Image on powder tile */}
                    <div style={{ aspectRatio: "4/3", overflow: "hidden", backgroundColor: POWDER,
                      borderBottom: `2px solid ${BLACK}`,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='20' height='20' fill='%23A8CBCF'/%3E%3Ccircle cx='10' cy='10' r='1.5' fill='none' stroke='%233D7A72' stroke-width='0.6' opacity='0.4'/%3E%3Cpath d='M10 3 L10 17 M3 10 L17 10' stroke='%233D7A72' stroke-width='0.4' opacity='0.2'/%3E%3C/svg%3E")` }}>
                      {recipe.imagePath ? (
                        <img src={recipe.imagePath} alt={recipe.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ filter: "sepia(0.15) contrast(1.05)" }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Book className="h-10 w-10" style={{ color: TEAL, opacity: 0.3 }} />
                        </div>
                      )}
                    </div>

                    {/* Parchment body */}
                    <div style={{ backgroundColor: PARCH, padding: "0.6rem 0.85rem 0.5rem",
                      borderBottom: `2px solid ${BLACK}` }}>
                      {recipe.attribute && recipe.attribute.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {recipe.attribute.map(attr => (
                            <span key={attr} style={{ display: "inline-block", padding: "0.1rem 0.45rem",
                              border: `1px solid ${INK}`, color: INK, fontSize: "0.58rem",
                              fontFamily: "'Outfit', sans-serif", textTransform: "uppercase",
                              letterSpacing: "0.1em", opacity: 0.6 }}>
                              {attr}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                          fontSize: "0.82rem", color: INK, opacity: 0.4 }}>
                          ❧ Spencer's Emporium
                        </p>
                      )}
                    </div>

                    {/* Accent bottom bar */}
                    <div style={{ height: 8, backgroundColor: accent }} />
                  </article>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20"
            style={{ border: `2px solid ${TEAL}`, backgroundColor: CREAM, opacity: 0.8 }}>
            <Search className="h-8 w-8 mx-auto mb-4" style={{ color: INK, opacity: 0.2 }} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: INK }}>
              No receipts found
            </h3>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.82rem", color: INK,
              opacity: 0.5, marginTop: 6 }}>
              {activeFilterCount > 0 ? "Try adjusting your filters." : "Add a new receipt to begin your collection."}
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}
                style={{ borderColor: TEAL, color: TEAL, borderRadius: 0, fontFamily: "'Outfit',sans-serif" }}>
                <X className="h-4 w-4 mr-2" />Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
