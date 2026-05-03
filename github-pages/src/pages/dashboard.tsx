import { Layout } from "@/components/layout";
import { LabelFrame } from "@/components/label-frame";
import { UrlImporter } from "@/components/url-importer";
import { useListRecipes, useGetRecipeStats, useGetRecipeFacets } from "@/lib/api-client";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Book, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useTheme } from "@/lib/theme-context";

const CARD_ACCENT_KEYS = ["maroon", "teal", "black", "ink", "powder", "rose"] as const;

interface Filters { course: string | null; cuisine: string | null; attribute: string | null; }

export default function Dashboard() {
  const { colors: c, patterns: p } = useTheme();
  const MILLS_SHADOW = `1px 1px 0 rgba(0,0,0,0.5), 2px 2px 0 rgba(0,0,0,0.3)`;

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
      border: `1px solid ${active ? c.rose : c.ink}`,
      backgroundColor: active ? c.rose : "transparent",
      color: active ? c.cream : c.ink, opacity: active ? 1 : 0.65, transition: "all 0.15s",
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

          {/* Ledger — full LabelFrame */}
          <div className="lg:col-span-4">
            <LabelFrame>
              <div style={{ backgroundColor: c.sage, padding: "0.55rem 1rem",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                borderBottom: `2px solid ${c.gold}` }}>
                <Book className="h-3.5 w-3.5" style={{ color: c.cream, opacity: 0.7 }} />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.8rem",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em",
                  color: c.cream, textShadow: MILLS_SHADOW }}>The Ledger</h2>
              </div>
              <div style={{ backgroundColor: c.parch }}>
                <div className="grid grid-cols-2">
                  <div className="text-center py-4" style={{ borderRight: `2px solid ${c.black}` }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.8rem",
                      fontWeight: 900, color: c.maroon, lineHeight: 1 }}>{stats?.totalRecipes || 0}</p>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem",
                      textTransform: "uppercase", letterSpacing: "0.15em", color: c.ink, marginTop: 4, opacity: 0.6 }}>
                      Total Receipts</p>
                  </div>
                  <div className="text-center py-4">
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.8rem",
                      fontWeight: 900, color: c.teal, lineHeight: 1 }}>{stats?.recentCount || 0}</p>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.56rem",
                      textTransform: "uppercase", letterSpacing: "0.15em", color: c.ink, marginTop: 4, opacity: 0.6 }}>
                      Recently Added</p>
                  </div>
                </div>
              </div>
            </LabelFrame>
          </div>
        </div>

        {/* Ornamental rule */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ height: 12, backgroundImage: p.eggDartDark, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 8, backgroundImage: p.chevronGold, backgroundRepeat: "repeat-x" }} />
          <div style={{ display: "flex", height: 4 }}>
            <div style={{ flex: 1, backgroundColor: c.rose   }} />
            <div style={{ flex: 2, backgroundColor: c.teal   }} />
            <div style={{ flex: 1, backgroundColor: c.maroon }} />
            <div style={{ flex: 2, backgroundColor: c.teal   }} />
            <div style={{ flex: 1, backgroundColor: c.rose   }} />
          </div>
        </div>

        {/* Collection frame: filters + search/new */}
        <LabelFrame>
          {/* Header */}
          <div style={{
            backgroundColor: c.sage,
            padding: "0.55rem 1rem",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            borderBottom: `2px solid ${c.gold}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Search className="h-3.5 w-3.5" style={{ color: c.cream, opacity: 0.7 }} />
              <h2 style={{
                fontFamily: "'Playfair Display', serif", fontSize: "0.8rem",
                fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em",
                color: c.cream, textShadow: MILLS_SHADOW,
              }}>The Collection</h2>
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="flex items-center gap-1"
                style={{ color: c.gold, fontSize: "0.65rem", fontFamily: "'Outfit', sans-serif",
                  opacity: 0.85, letterSpacing: "0.08em" }}>
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </div>

          {/* Body */}
          <div style={{ backgroundColor: c.parch, padding: "0.85rem 1rem 1rem" }}>

            {/* Filter pills */}
            {hasFacets && (
              <div className="mb-4">
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.52rem",
                  textTransform: "uppercase", letterSpacing: "0.22em", color: c.ink,
                  opacity: 0.4, marginBottom: "0.6rem" }}>
                  Filter by Category
                </p>
                <div className="flex flex-wrap gap-4">
                  {(facets?.courses?.length ?? 0) > 0 && (
                    <div className="space-y-1.5">
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.52rem",
                        textTransform: "uppercase", letterSpacing: "0.15em", color: c.ink, opacity: 0.4 }}>Course</p>
                      <div className="flex flex-wrap gap-1.5">
                        {facets!.courses.map(v => <FilterPill key={v} active={filters.course === v} onClick={() => toggleFilter("course", v)}>{v}</FilterPill>)}
                      </div>
                    </div>
                  )}
                  {(facets?.cuisines?.length ?? 0) > 0 && (
                    <div className="space-y-1.5">
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.52rem",
                        textTransform: "uppercase", letterSpacing: "0.15em", color: c.ink, opacity: 0.4 }}>Cuisine</p>
                      <div className="flex flex-wrap gap-1.5">
                        {facets!.cuisines.map(v => <FilterPill key={v} active={filters.cuisine === v} onClick={() => toggleFilter("cuisine", v)}>{v}</FilterPill>)}
                      </div>
                    </div>
                  )}
                  {(facets?.attributes?.length ?? 0) > 0 && (
                    <div className="space-y-1.5">
                      <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.52rem",
                        textTransform: "uppercase", letterSpacing: "0.15em", color: c.ink, opacity: 0.4 }}>Attributes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {facets!.attributes.map(v => <FilterPill key={v} active={filters.attribute === v} onClick={() => toggleFilter("attribute", v)}>{v}</FilterPill>)}
                      </div>
                    </div>
                  )}
                </div>
                {/* Divider between filters and search row */}
                <div style={{ marginTop: "0.85rem", height: 1, backgroundColor: c.ink, opacity: 0.12 }} />
              </div>
            )}

            {/* Search + New row */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: c.ink, opacity: 0.35 }} />
                <Input placeholder="Search the collection…" className="pl-9 h-10"
                  style={{ border: `2px solid ${c.black}`, borderRadius: 0,
                    backgroundColor: c.cream, fontFamily: "'Outfit', sans-serif", color: c.ink }}
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <Button asChild className="shrink-0 h-10"
                style={{ backgroundColor: c.maroon, color: c.cream, borderRadius: 0,
                  fontFamily: "'Playfair Display', serif", fontWeight: 700,
                  fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase",
                  border: `2px solid ${c.black}`, textShadow: "1px 1px 0 rgba(0,0,0,0.4)" }}>
                <Link href="/recipe/new"><Plus className="h-4 w-4 mr-1.5" />New</Link>
              </Button>
            </div>
          </div>
        </LabelFrame>

        {/* Recipe grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <LabelFrame key={i}>
                <Skeleton className="h-10 w-full" style={{ borderRadius: 0 }} />
                <Skeleton className="w-full aspect-[4/3]" style={{ borderRadius: 0 }} />
                <Skeleton className="h-14 w-full" style={{ borderRadius: 0 }} />
              </LabelFrame>
            ))}
          </div>
        ) : recipes && recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map((recipe, idx) => {
              const accentKey = CARD_ACCENT_KEYS[idx % CARD_ACCENT_KEYS.length];
              const accent = c[accentKey];
              return (
                <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                  <div className="group cursor-pointer animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                    style={{ animationDelay: `${idx * 50}ms`, animationDuration: "500ms",
                      transition: "transform 0.2s, box-shadow 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = `6px 6px 0 ${c.black}`; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none"; }}>
                    <LabelFrame>
                      {/* Inner top accent */}
                      <div style={{ display: "flex", height: 4 }}>
                        <div style={{ flex: 1, backgroundColor: c.rose }} />
                        <div style={{ flex: 2, backgroundColor: c.gold }} />
                        <div style={{ flex: 1, backgroundColor: c.rose }} />
                      </div>

                      {/* Sage title */}
                      <div style={{ backgroundColor: c.sage, padding: "0.6rem 0.85rem",
                        borderBottom: `2px solid ${c.black}`, borderTop: `1px solid ${c.black}` }}>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem",
                          fontWeight: 900, color: c.cream, lineHeight: 1.25, textShadow: MILLS_SHADOW }}>
                          {recipe.title}
                        </h3>
                      </div>

                      {/* Teal subtitle */}
                      <div style={{ backgroundColor: c.teal, padding: "0.22rem 0.85rem",
                        borderBottom: `1px solid ${c.black}` }}>
                        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.58rem",
                          textTransform: "uppercase", letterSpacing: "0.2em", color: c.cream, opacity: 0.9 }}>
                          {[recipe.course, recipe.cuisine].filter(Boolean).join(" · ") || "Spencer's Emporium"}
                        </p>
                      </div>

                      {/* Image */}
                      <div style={{ aspectRatio: "4/3", overflow: "hidden", backgroundColor: c.powder,
                        borderBottom: `2px solid ${c.black}`, backgroundImage: p.powderTile }}>
                        {recipe.imagePath ? (
                          <img src={recipe.imagePath} alt={recipe.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            style={{ filter: "sepia(0.15) contrast(1.05)" }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Book className="h-10 w-10" style={{ color: c.teal, opacity: 0.3 }} />
                          </div>
                        )}
                      </div>

                      {/* Attribute footer */}
                      <div style={{ backgroundColor: c.parch, padding: "0.55rem 0.85rem 0.45rem" }}>
                        {recipe.attribute && recipe.attribute.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {recipe.attribute.map(attr => (
                              <span key={attr} style={{ display: "inline-block", padding: "0.1rem 0.45rem",
                                border: `1px solid ${c.ink}`, color: c.ink, fontSize: "0.58rem",
                                fontFamily: "'Outfit', sans-serif", textTransform: "uppercase",
                                letterSpacing: "0.1em", opacity: 0.6 }}>
                                {attr}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                            fontSize: "0.82rem", color: c.ink, opacity: 0.4 }}>
                            ❧ Spencer's Emporium
                          </p>
                        )}
                      </div>

                      {/* Accent bottom */}
                      <div style={{ height: 6, backgroundColor: accent }} />
                    </LabelFrame>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <LabelFrame>
            <div className="text-center py-20" style={{ backgroundColor: c.cream }}>
              <Search className="h-8 w-8 mx-auto mb-4" style={{ color: c.ink, opacity: 0.2 }} />
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: c.ink }}>
                No receipts found
              </h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.82rem", color: c.ink,
                opacity: 0.5, marginTop: 6 }}>
                {activeFilterCount > 0 ? "Try adjusting your filters." : "Add a new receipt to begin your collection."}
              </p>
              {activeFilterCount > 0 && (
                <Button variant="outline" className="mt-4" onClick={clearFilters}
                  style={{ borderColor: c.teal, color: c.teal, borderRadius: 0, fontFamily: "'Outfit',sans-serif" }}>
                  <X className="h-4 w-4 mr-2" />Clear filters
                </Button>
              )}
            </div>
          </LabelFrame>
        )}
      </div>
    </Layout>
  );
}
