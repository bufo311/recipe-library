import React from "react";
import { Layout } from "@/components/layout";
import { useGetRecipe, useDeleteRecipe, useConvertToGrams, getGetRecipeQueryKey, getListRecipesQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit3, Trash2, ExternalLink, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

/* Eastern Mills palette */
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

/* Decorative SVG band patterns — inline for title bands */
const EGG_DART_DARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12'%3E%3Crect width='20' height='12' fill='%23140A04'/%3E%3Cellipse cx='10' cy='6' rx='8' ry='3.5' fill='%23C8A020' opacity='0.3'/%3E%3Cellipse cx='10' cy='6' rx='5.5' ry='2' fill='%23140A04'/%3E%3Ccircle cx='0' cy='6' r='2' fill='%23C8A020' opacity='0.45'/%3E%3Ccircle cx='20' cy='6' r='2' fill='%23C8A020' opacity='0.45'/%3E%3C/svg%3E")`;
const EGG_DART_MAROON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12'%3E%3Crect width='20' height='12' fill='%234A1520'/%3E%3Cellipse cx='10' cy='6' rx='8' ry='3.5' fill='%23C8A020' opacity='0.28'/%3E%3Cellipse cx='10' cy='6' rx='5.5' ry='2' fill='%234A1520'/%3E%3Ccircle cx='0' cy='6' r='2' fill='%23C8A020' opacity='0.4'/%3E%3Ccircle cx='20' cy='6' r='2' fill='%23C8A020' opacity='0.4'/%3E%3C/svg%3E")`;
const CABLE_TEAL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='10'%3E%3Crect width='20' height='10' fill='%233D7A72'/%3E%3Cpath d='M0 5 Q5 1 10 5 Q15 9 20 5' fill='none' stroke='%23F5EEE0' stroke-width='0.9' opacity='0.35'/%3E%3Cpath d='M0 5 Q5 9 10 5 Q15 1 20 5' fill='none' stroke='%23F5EEE0' stroke-width='0.9' opacity='0.35'/%3E%3C/svg%3E")`;
const CHEVRON_GOLD = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='8'%3E%3Crect width='16' height='8' fill='%23C8A020'/%3E%3Cpath d='M0 4 L4 1 L8 4 L12 1 L16 4 L12 7 L8 4 L4 7 Z' fill='none' stroke='%23140A04' stroke-width='0.7' opacity='0.35'/%3E%3C/svg%3E")`;

/* MILLS-style 3D drop shadow — cream letters on sage/dark, stacked shadow */
const MILLS_SHADOW = `1px 1px 0 #1A0808, 2px 2px 0 #1A0808, 3px 3px 0 rgba(0,0,0,0.35)`;

function WaxSeal({ lines }: { lines: string[] }) {
  if (!lines.length) return null;
  return (
    <div style={{
      backgroundColor: MAROON, color: CREAM, borderRadius: "50%",
      width: 84, height: 84, display: "flex", alignItems: "center", justifyContent: "center",
      textAlign: "center", fontSize: "0.56rem", lineHeight: 1.3, textTransform: "uppercase",
      letterSpacing: "1px", boxShadow: "inset 0 0 14px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)",
      border: `3px solid #2A0A10`, outline: `2px solid ${GOLD}`, outlineOffset: -7,
      transform: "rotate(-10deg)", fontWeight: "bold",
      fontFamily: "'Playfair Display', serif", padding: "0.5rem", flexShrink: 0,
    }}>
      {lines.map((l, i) => (
        <span key={i}>
          {i > 0 && <><br /><span style={{ opacity: 0.5 }}>&amp;</span><br /></>}{l}
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
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
        toast({ title: "Recipe deleted" }); setLocation("/"); },
      onError: () => toast({ title: "Failed to delete recipe", variant: "destructive" }),
    }
  });
  const convertToGrams = useConvertToGrams({
    mutation: {
      onSuccess: () => setShowGrams(true),
      onError: () => toast({ title: "Failed to convert measurements", variant: "destructive" }),
    }
  });
  const handleToggleGrams = () => {
    if (showGrams) { setShowGrams(false); return; }
    if (convertToGrams.data) setShowGrams(true);
    else convertToGrams.mutate({ id: recipeId });
  };
  const formatWithOriginal = (converted: string, original: string): React.ReactNode => {
    const volumePattern = /([\d\s½⅓⅔¼¾⅛⅜⅝⅞\/\.]+\s*(?:cups?|tablespoons?|teaspoons?|tbsps?|tsps?))/i;
    const volumeMatch = original.match(volumePattern);
    const gramMatch = converted.match(/^(\d+g)\s+(.+)$/);
    if (!gramMatch) return converted;
    const [, grams, ingredientName] = gramMatch;
    return (<><span>{grams}</span>{volumeMatch && <span style={{ opacity: 0.6, fontSize: "0.85rem" }}> ({volumeMatch[1].trim()})</span>}<span> {ingredientName}</span></>);
  };
  const getDisplayedIngredient = (ingredient: string, index: number): React.ReactNode => {
    if (!showGrams || !convertToGrams.data) return ingredient;
    const c = convertToGrams.data.convertedIngredients[index];
    if (c?.hasConversion && c.converted) return formatWithOriginal(c.converted, ingredient);
    return ingredient;
  };

  if (isLoading) return <Layout><div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin" style={{ color: TEAL }} /></div></Layout>;
  if (!recipe) return <Layout><div className="text-center py-24"><h1 className="text-2xl font-serif">Recipe not found</h1></div></Layout>;

  const sealLines = [recipe.course, recipe.cuisine ?? recipe.category].filter((v): v is string => !!v).slice(0, 2);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* ── Outer frame ── */}
        <div style={{ border: `3px solid ${BLACK}` }}>

          {/* Top decorative band: egg-and-dart in dark */}
          <div style={{ height: 12, backgroundImage: EGG_DART_DARK, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 8, backgroundImage: CHEVRON_GOLD, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 3, backgroundColor: ROSE }} />

          {/* ── Title zone — SAGE green background, MILLS-style drop shadow ── */}
          <div style={{ backgroundColor: SAGE, padding: "1.5rem 2rem",
            position: "relative", overflow: "hidden" }}>
            {/* Subtle inner texture */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='none'/%3E%3Ccircle cx='2' cy='2' r='0.5' fill='%23000' opacity='0.06'/%3E%3C/svg%3E")` }} />

            <div className="flex justify-between items-start gap-4 relative">
              <div className="flex-1">
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem",
                  textTransform: "uppercase", letterSpacing: "0.35em", color: CREAM,
                  opacity: 0.65, marginBottom: 6 }}>
                  Fine Culinary Receipts
                </p>
                {/* MILLS-style drop shadow title */}
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 900,
                  color: CREAM,
                  textShadow: MILLS_SHADOW,
                  lineHeight: 1.1,
                }}>
                  {recipe.title}
                </h1>
                {recipe.sourceUrl && (
                  <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2"
                    style={{ fontSize: "0.72rem", color: GOLD, fontFamily: "'Outfit', sans-serif",
                      opacity: 0.85 }}>
                    Original Source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                {sealLines.length > 0 && <WaxSeal lines={sealLines} />}
                <div className="flex gap-2 mt-1">
                  <Button variant="ghost" size="sm" asChild
                    style={{ color: CREAM, border: `1px solid ${CREAM}`, borderRadius: 0,
                      fontFamily: "'Outfit', sans-serif", fontSize: "0.68rem", opacity: 0.8 }}>
                    <Link href={`/recipe/${recipe.id}/edit`}><Edit3 className="h-3.5 w-3.5 mr-1" />Edit</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm"
                        style={{ color: ROSE, border: `1px solid ${ROSE}`, borderRadius: 0,
                          fontFamily: "'Outfit', sans-serif", fontSize: "0.68rem" }}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
                        <AlertDialogDescription>This will permanently remove the receipt from your collection.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction style={{ backgroundColor: MAROON, color: CREAM }}
                          onClick={() => deleteRecipe.mutate({ id: recipe.id })}>
                          {deleteRecipe.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>

          {/* Below title: cable pattern + colour bands */}
          <div style={{ height: 3, backgroundColor: ROSE }} />
          <div style={{ height: 10, backgroundImage: CABLE_TEAL, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 12, backgroundImage: EGG_DART_MAROON, backgroundRepeat: "repeat-x" }} />

          {/* ── Teal info band ── */}
          <div style={{ backgroundColor: TEAL, padding: "0.5rem 2rem",
            display: "flex", alignItems: "center", gap: 0,
            borderTop: `2px solid ${BLACK}`, borderBottom: `2px solid ${BLACK}` }}>
            <div className="flex gap-6 flex-wrap">
              {[
                { label: "Course",  val: recipe.course     },
                { label: "Cuisine", val: recipe.cuisine    },
                { label: "Prep",    val: recipe.prepTime   },
                { label: "Cook",    val: recipe.cookTime   },
                { label: "Yield",   val: recipe.yields     },
              ].filter(x => x.val).map((x, i) => (
                <div key={x.label} className={i > 0 ? "border-l border-white border-opacity-20 pl-4" : ""}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.5rem",
                    textTransform: "uppercase", letterSpacing: "0.15em", color: CREAM, opacity: 0.65 }}>{x.label}</p>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700,
                    fontSize: "0.82rem", color: CREAM }}>{x.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image on powder-blue tile */}
          {recipe.imagePath && (
            <>
              <div style={{ backgroundColor: POWDER, overflow: "hidden", maxHeight: 320,
                borderBottom: `3px solid ${BLACK}`,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='20' height='20' fill='%23A8CBCF'/%3E%3Ccircle cx='10' cy='10' r='1.5' fill='none' stroke='%233D7A72' stroke-width='0.6' opacity='0.4'/%3E%3Cpath d='M10 3 L10 17 M3 10 L17 10' stroke='%233D7A72' stroke-width='0.4' opacity='0.2'/%3E%3C/svg%3E")` }}>
                <img src={recipe.imagePath} alt={recipe.title}
                  className="w-full object-cover" style={{ filter: "sepia(0.1) contrast(1.05)" }} />
              </div>
            </>
          )}

          {/* ── Body: maroon left column + cream right ── */}
          <div className="grid grid-cols-1 md:grid-cols-12">

            {/* Left — maroon botanical column */}
            <div className="md:col-span-4" style={{ backgroundColor: MAROON,
              borderRight: `3px solid ${BLACK}` }}>
              {/* Column header — egg-and-dart above label */}
              <div style={{ height: 12, backgroundImage: EGG_DART_MAROON, backgroundRepeat: "repeat-x",
                borderBottom: `1px solid ${BLACK}` }} />
              <div style={{ backgroundColor: BLACK, padding: "0.45rem 1rem",
                borderBottom: `2px solid ${GOLD}`,
                display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: "0.85rem",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em",
                  color: CREAM, textShadow: `1px 1px 0 ${MAROON}, 2px 2px 0 rgba(0,0,0,0.3)`,
                }}>
                  The Manifest
                </h2>
                <Button variant="ghost" size="sm" onClick={handleToggleGrams}
                  disabled={convertToGrams.isPending}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem",
                    color: GOLD, backgroundColor: "transparent", padding: "0.1rem 0.3rem" }}>
                  {convertToGrams.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Scale className="h-3 w-3 mr-1" />}
                  {showGrams ? "Volume" : "Grams"}
                </Button>
              </div>
              <ul className="space-y-3 p-5">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex gap-2 leading-relaxed">
                    <span style={{ color: GOLD, opacity: 0.7, marginTop: 2, flexShrink: 0 }}>—</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem",
                      color: CREAM, opacity: 0.92 }}>
                      {getDisplayedIngredient(ingredient, idx)}
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ height: 12, backgroundImage: EGG_DART_MAROON, backgroundRepeat: "repeat-x",
                borderTop: `1px solid ${BLACK}`, marginTop: 8 }} />
            </div>

            {/* Right — cream instructions */}
            <div className="md:col-span-8" style={{ backgroundColor: CREAM }}>
              <div style={{ height: 12, backgroundImage: EGG_DART_DARK, backgroundRepeat: "repeat-x",
                borderBottom: `1px solid ${BLACK}` }} />
              <div style={{ backgroundColor: SAGE, padding: "0.45rem 1.25rem",
                borderBottom: `2px solid ${BLACK}`, textAlign: "center" }}>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif", fontSize: "0.85rem",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em",
                  color: CREAM, textShadow: `1px 1px 0 #1A3A18, 2px 2px 0 rgba(0,0,0,0.3)`,
                }}>
                  Method of Preparation
                </h2>
              </div>
              <ol className="space-y-7 p-6">
                {recipe.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex gap-5">
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem",
                      color: MAROON, opacity: 0.2, fontWeight: 900, flexShrink: 0,
                      lineHeight: 1, paddingTop: "0.05em", userSelect: "none" }}>
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem",
                      lineHeight: 1.78, color: INK }}>
                      {instruction}
                    </p>
                  </li>
                ))}
              </ol>

              {recipe.notes && (
                <div style={{ margin: "0 1.5rem 1.5rem", padding: "1.1rem",
                  backgroundColor: PARCH, border: `2px solid ${GOLD}`,
                  boxShadow: `4px 4px 0 ${MAROON}`, transform: "rotate(0.35deg)" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.9rem",
                    fontWeight: 700, color: MAROON, borderBottom: `1px solid ${INK}`,
                    paddingBottom: "0.25rem", marginBottom: "0.5rem", display: "inline-block" }}>
                    Proprietor's Notes:
                  </h3>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                    fontSize: "1.08rem", color: INK, lineHeight: 1.72, whiteSpace: "pre-wrap" }}>
                    {recipe.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Bottom decorative bands ── */}
          <div style={{ height: 12, backgroundImage: EGG_DART_MAROON, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 8, backgroundImage: CHEVRON_GOLD, backgroundRepeat: "repeat-x" }} />
          <div style={{ display: "flex", height: 6 }}>
            <div style={{ flex: 1, backgroundColor: ROSE  }} />
            <div style={{ flex: 2, backgroundColor: GOLD  }} />
            <div style={{ flex: 1, backgroundColor: TEAL  }} />
            <div style={{ flex: 2, backgroundColor: GOLD  }} />
            <div style={{ flex: 1, backgroundColor: ROSE  }} />
          </div>
        </div>

      </div>
    </Layout>
  );
}
