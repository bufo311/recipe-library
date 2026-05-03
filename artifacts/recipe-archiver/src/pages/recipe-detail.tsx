import React from "react";
import { Layout } from "@/components/layout";
import { useGetRecipe, useDeleteRecipe, useConvertToGrams, getGetRecipeQueryKey, getListRecipesQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit3, Trash2, ExternalLink, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

/* Maltby's + Eastern Mills palette */
const GREEN   = "#1D5C35";
const CLARET  = "#8C1F28";
const GOLD    = "#C8A020";
const TEAL    = "#3D7A72";
const CREAM   = "#F5EEE0";
const PARCH   = "#E8D5A8";
const INK     = "#1E0E04";

function OrnamentalDivider({ color = CLARET }: { color?: string }) {
  return (
    <div className="text-center my-5" style={{ color, fontSize: "1rem", letterSpacing: "0.25em", opacity: 0.7 }}>
      ✦ ═══ ❧ ═══ ✦
    </div>
  );
}

function WaxSeal({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <div
      style={{
        backgroundColor: CLARET,
        color: CREAM,
        borderRadius: "50%",
        width: 84,
        height: 84,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontSize: "0.56rem",
        lineHeight: 1.25,
        textTransform: "uppercase",
        letterSpacing: "1px",
        boxShadow: "inset 0 0 12px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.35)",
        border: `3px solid #6B1520`,
        outline: `1px solid ${GOLD}`,
        outlineOffset: -6,
        transform: "rotate(-10deg)",
        fontWeight: "bold",
        fontFamily: "'Playfair Display', serif",
        padding: "0.5rem",
        flexShrink: 0,
      }}
    >
      {lines.map((l, i) => (
        <span key={i}>
          {i > 0 && <><br /><span style={{ opacity: 0.5 }}>&amp;</span><br /></>}
          {l}
        </span>
      ))}
    </div>
  );
}

export default function RecipeDetail() {
  const { id } = useParams();
  const recipeId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showGrams, setShowGrams] = useState(false);

  const { data: recipe, isLoading } = useGetRecipe(recipeId, {
    query: { enabled: !!recipeId, queryKey: getGetRecipeQueryKey(recipeId) }
  });

  const deleteRecipe = useDeleteRecipe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
        toast({ title: "Recipe deleted" });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Failed to delete recipe", variant: "destructive" });
      }
    }
  });

  const convertToGrams = useConvertToGrams({
    mutation: {
      onSuccess: () => setShowGrams(true),
      onError: () => { toast({ title: "Failed to convert measurements", variant: "destructive" }); }
    }
  });

  const handleToggleGrams = () => {
    if (showGrams) { setShowGrams(false); return; }
    if (convertToGrams.data) { setShowGrams(true); }
    else { convertToGrams.mutate({ id: recipeId }); }
  };

  const formatWithOriginal = (converted: string, original: string): React.ReactNode => {
    const volumePattern = /([\d\s½⅓⅔¼¾⅛⅜⅝⅞\/\.]+\s*(?:cups?|tablespoons?|teaspoons?|tbsps?|tsps?))/i;
    const volumeMatch = original.match(volumePattern);
    const gramMatch = converted.match(/^(\d+g)\s+(.+)$/);
    if (!gramMatch) return converted;
    const [, grams, ingredientName] = gramMatch;
    return (
      <>
        <span>{grams}</span>
        {volumeMatch && <span style={{ opacity: 0.6, fontSize: "0.85rem" }}> ({volumeMatch[1].trim()})</span>}
        <span> {ingredientName}</span>
      </>
    );
  };

  const getDisplayedIngredient = (ingredient: string, index: number): React.ReactNode => {
    if (!showGrams || !convertToGrams.data) return ingredient;
    const c = convertToGrams.data.convertedIngredients[index];
    if (c?.hasConversion && c.converted) return formatWithOriginal(c.converted, ingredient);
    return ingredient;
  };

  if (isLoading) {
    return <Layout><div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin" style={{ color: GREEN }} /></div></Layout>;
  }
  if (!recipe) {
    return <Layout><div className="text-center py-24"><h1 className="text-2xl font-serif">Recipe not found</h1></div></Layout>;
  }

  const sealLines = [recipe.course, recipe.cuisine ?? recipe.category].filter((v): v is string => !!v).slice(0, 2);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* ── Outer frame: thick green band with claret inner rule ── */}
        <div style={{ padding: 6, backgroundColor: GREEN, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
          <div style={{ padding: 3, backgroundColor: CLARET }}>
            <div style={{ padding: 3, backgroundColor: GOLD, opacity: 0.9 }}>

              {/* ── Inner cream content area ── */}
              <div style={{ backgroundColor: CREAM, padding: "2rem 2rem 1.5rem" }}>

                {/* Top row: wax seal + action buttons */}
                <div className="flex justify-between items-start gap-4 mb-5">
                  <div style={{ flex: 1 }} />
                  <div className="flex items-center gap-3">
                    {sealLines.length > 0 && <WaxSeal lines={sealLines} />}
                    <div className="flex flex-col gap-2 items-end">
                      <Button variant="outline" size="sm" asChild
                        style={{ borderColor: GREEN, color: GREEN, borderRadius: 0, fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem" }}>
                        <Link href={`/recipe/${recipe.id}/edit`}><Edit3 className="h-3.5 w-3.5 mr-1.5" />Edit</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm"
                            style={{ borderColor: CLARET, color: CLARET, borderRadius: 0, fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem" }}>
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently remove the receipt from your collection.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction style={{ backgroundColor: CLARET, color: CREAM }}
                              onClick={() => deleteRecipe.mutate({ id: recipe.id })}>
                              {deleteRecipe.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>

                {/* ── Title label ── green banner header like Maltby's */}
                <div style={{ border: `2px solid ${INK}`, marginBottom: "1.5rem" }}>
                  {/* Green banner — "FINE CULINARY RECEIPTS" */}
                  <div style={{ backgroundColor: GREEN, padding: "0.5rem 1rem", textAlign: "center" }}>
                    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", textTransform: "uppercase",
                      letterSpacing: "0.3em", color: CREAM, opacity: 0.85 }}>
                      Fine Culinary Receipts
                    </p>
                  </div>
                  {/* Thin gold rule */}
                  <div style={{ height: 3, backgroundColor: GOLD }} />
                  {/* Cream title area */}
                  <div style={{ backgroundColor: "#FFF9EB", padding: "1.5rem 2rem", textAlign: "center", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 5, border: `1px solid ${INK}`, opacity: 0.12, pointerEvents: "none" }} />
                    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.8rem,5vw,3.2rem)",
                      fontWeight: 900, color: INK, lineHeight: 1.15, marginBottom: "0.25rem" }}>
                      {recipe.title}
                    </h1>
                    {recipe.sourceUrl && (
                      <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1"
                        style={{ fontSize: "0.72rem", color: TEAL, fontFamily: "'Outfit', sans-serif" }}>
                        Original Source <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {/* Ornament */}
                    <div className="flex justify-center items-center gap-3 my-3">
                      <span style={{ width: 36, height: 1, backgroundColor: CLARET, display: "inline-block" }} />
                      <span style={{ color: CLARET, fontSize: "1.1rem" }}>❧</span>
                      <span style={{ width: 36, height: 1, backgroundColor: CLARET, display: "inline-block" }} />
                    </div>
                    {/* Time / yield row */}
                    {(recipe.prepTime || recipe.cookTime || recipe.totalTime || recipe.yields) && (
                      <div className="flex justify-center gap-6 flex-wrap mx-auto max-w-lg"
                        style={{ borderTop: `1px solid ${INK}`, borderBottom: `1px solid ${INK}`, padding: "0.4rem 0", opacity: 0.8 }}>
                        {[
                          { label: "Prep",  val: recipe.prepTime  },
                          { label: "Cook",  val: recipe.cookTime  },
                          { label: "Total", val: recipe.totalTime },
                          { label: "Yield", val: recipe.yields    },
                        ].filter(x => x.val).map((x, i, arr) => (
                          <React.Fragment key={x.label}>
                            {i > 0 && <div style={{ width: 1, backgroundColor: INK, opacity: 0.25 }} />}
                            <div style={{ textAlign: "center" }}>
                              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem", textTransform: "uppercase",
                                letterSpacing: "0.15em", opacity: 0.55 }}>{x.label}</p>
                              <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.8rem" }}>{x.val}</p>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Bottom gold rule then claret bar */}
                  <div style={{ height: 3, backgroundColor: GOLD }} />
                  <div style={{ height: 5, backgroundColor: CLARET }} />
                </div>

                {/* Hero image */}
                {recipe.imagePath && (
                  <div style={{ border: `3px solid ${INK}`, marginBottom: "1.5rem", overflow: "hidden", aspectRatio: "21/9" }}>
                    <img src={recipe.imagePath} alt={recipe.title}
                      className="w-full h-full object-cover" style={{ filter: "sepia(0.2) contrast(1.05)" }} />
                  </div>
                )}

                <OrnamentalDivider />

                {/* Body grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 mt-2">

                  {/* ── The Manifest (ingredients) ── */}
                  <div className="md:col-span-4">
                    <div style={{ border: `2px solid ${GREEN}`, height: "100%" }}>
                      {/* Green header stripe */}
                      <div style={{ backgroundColor: GREEN, padding: "0.5rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.9rem", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: "0.18em", color: CREAM }}>
                          The Manifest
                        </h2>
                        <Button variant="ghost" size="sm" onClick={handleToggleGrams} disabled={convertToGrams.isPending}
                          style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.62rem", color: GOLD,
                            backgroundColor: "transparent", padding: "0.1rem 0.4rem" }}>
                          {convertToGrams.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Scale className="h-3 w-3 mr-1" />}
                          {showGrams ? "Volume" : "Grams"}
                        </Button>
                      </div>
                      <div style={{ backgroundColor: PARCH, padding: "1.25rem" }}>
                        <ul className="space-y-3">
                          {recipe.ingredients.map((ingredient, idx) => (
                            <li key={idx} className="flex gap-2 leading-relaxed"
                              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: INK }}>
                              <span style={{ color: CLARET, opacity: 0.7, marginTop: 2, flexShrink: 0 }}>—</span>
                              <span>{getDisplayedIngredient(ingredient, idx)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* ── Method of Preparation (instructions) ── */}
                  <div className="md:col-span-8 space-y-6">
                    {/* Teal header stripe */}
                    <div style={{ border: `2px solid ${TEAL}` }}>
                      <div style={{ backgroundColor: TEAL, padding: "0.5rem 1rem", textAlign: "center" }}>
                        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.9rem", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: "0.18em", color: CREAM }}>
                          Method of Preparation
                        </h2>
                      </div>
                      <div style={{ backgroundColor: CREAM, padding: "1.5rem" }}>
                        <ol className="space-y-7">
                          {recipe.instructions.map((instruction, idx) => (
                            <li key={idx} className="flex gap-5">
                              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: GREEN,
                                opacity: 0.25, fontWeight: 900, flexShrink: 0, lineHeight: 1, paddingTop: "0.1em", userSelect: "none" }}>
                                {(idx + 1).toString().padStart(2, "0")}
                              </span>
                              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem",
                                lineHeight: 1.75, color: INK }}>
                                {instruction}
                              </p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>

                    {/* Proprietor's Notes */}
                    {recipe.notes && (
                      <div style={{ padding: "1.25rem", backgroundColor: PARCH,
                        border: `2px solid ${GOLD}`, boxShadow: `3px 3px 0 ${CLARET}`,
                        transform: "rotate(0.4deg)" }}>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.95rem", fontWeight: 700,
                          borderBottom: `1px solid ${INK}`, paddingBottom: "0.3rem", marginBottom: "0.6rem",
                          display: "inline-block", color: GREEN }}>
                          Proprietor's Notes:
                        </h3>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                          fontSize: "1.1rem", color: INK, opacity: 0.85, lineHeight: 1.7,
                          whiteSpace: "pre-wrap" }}>
                          {recipe.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer ornament */}
                <div className="text-center mt-10 mb-1"
                  style={{ color: CLARET, opacity: 0.4, fontSize: "0.75rem", letterSpacing: "0.25em",
                    textTransform: "uppercase", fontFamily: "'Outfit', sans-serif" }}>
                  ─── ✦ ❧ ✦ ───
                </div>

              </div>{/* /cream */}
            </div>{/* /gold */}
          </div>{/* /claret */}
        </div>{/* /green outer */}

      </div>
    </Layout>
  );
}
