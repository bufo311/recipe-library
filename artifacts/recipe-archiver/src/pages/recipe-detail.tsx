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

        {/* ── Eastern Mills multi-band outer frame ── */}
        <div style={{ border: `3px solid ${BLACK}` }}>
          {/* Top rule: maroon | teal | gold | teal | maroon */}
          <div style={{ display: "flex", height: 7 }}>
            <div style={{ flex: 1, backgroundColor: MAROON }} />
            <div style={{ flex: 2, backgroundColor: TEAL   }} />
            <div style={{ flex: 1, backgroundColor: GOLD   }} />
            <div style={{ flex: 2, backgroundColor: TEAL   }} />
            <div style={{ flex: 1, backgroundColor: MAROON }} />
          </div>

          {/* ── Title band — "MILLS" dark zone ── */}
          <div style={{ backgroundColor: BLACK, padding: "1.5rem 2rem",
            borderBottom: `3px solid ${GOLD}` }}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                {/* "FINE CULINARY RECEIPTS" — Outfit label above title */}
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.55rem",
                  textTransform: "uppercase", letterSpacing: "0.35em", color: TEAL,
                  marginBottom: "0.4rem" }}>
                  Fine Culinary Receipts
                </p>
                <h1 style={{ fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(2rem,5vw,3.5rem)", fontWeight: 900, color: GOLD,
                  lineHeight: 1.1, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                  {recipe.title}
                </h1>
                {recipe.sourceUrl && (
                  <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2"
                    style={{ fontSize: "0.72rem", color: ROSE, fontFamily: "'Outfit', sans-serif" }}>
                    Original Source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="flex flex-col items-end gap-3 shrink-0">
                {sealLines.length > 0 && <WaxSeal lines={sealLines} />}
                <div className="flex gap-2 mt-1">
                  <Button variant="ghost" size="sm" asChild
                    style={{ color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 0,
                      fontFamily: "'Outfit', sans-serif", fontSize: "0.68rem" }}>
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

          {/* ── Teal band with course/time — "EASTERN" banner zone ── */}
          <div style={{ backgroundColor: TEAL, padding: "0.5rem 2rem",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: `2px solid ${BLACK}` }}>
            <div className="flex gap-6">
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

          {/* ── Rose accent strip ── */}
          <div style={{ height: 6, backgroundColor: ROSE }} />

          {/* Hero image on powder-blue tile */}
          {recipe.imagePath && (
            <>
              <div style={{ backgroundColor: POWDER, overflow: "hidden", maxHeight: 320,
                borderBottom: `3px solid ${BLACK}`,
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='20' height='20' fill='%23A8CBCF'/%3E%3Ccircle cx='10' cy='10' r='1.5' fill='none' stroke='%233D7A72' stroke-width='0.6' opacity='0.4'/%3E%3Cpath d='M10 3 L10 17 M3 10 L17 10' stroke='%233D7A72' stroke-width='0.4' opacity='0.2'/%3E%3C/svg%3E")` }}>
                <img src={recipe.imagePath} alt={recipe.title}
                  className="w-full object-cover" style={{ filter: "sepia(0.1) contrast(1.05)" }} />
              </div>
              <div style={{ height: 5, backgroundColor: GOLD }} />
            </>
          )}

          {/* ── Body: maroon left column + cream content — Eastern Mills layout ── */}
          <div className="grid grid-cols-1 md:grid-cols-12">

            {/* Left column — maroon "sidebar" like Eastern Mills botanical panel */}
            <div className="md:col-span-4" style={{ backgroundColor: MAROON,
              borderRight: `3px solid ${BLACK}` }}>
              {/* Column header */}
              <div style={{ backgroundColor: BLACK, padding: "0.5rem 1rem",
                borderBottom: `2px solid ${GOLD}`, textAlign: "center" }}>
                <div className="flex items-center justify-between">
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.82rem",
                    fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: GOLD }}>
                    The Manifest
                  </h2>
                  <Button variant="ghost" size="sm" onClick={handleToggleGrams}
                    disabled={convertToGrams.isPending}
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem",
                      color: TEAL, backgroundColor: "transparent", padding: "0.1rem 0.3rem" }}>
                    {convertToGrams.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Scale className="h-3 w-3 mr-1" />}
                    {showGrams ? "Volume" : "Grams"}
                  </Button>
                </div>
              </div>
              {/* Thin gold rule */}
              <div style={{ height: 3, backgroundColor: GOLD }} />
              {/* Ingredients on maroon */}
              <ul className="space-y-3 p-5">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex gap-2 leading-relaxed">
                    <span style={{ color: GOLD, opacity: 0.7, marginTop: 2, flexShrink: 0 }}>—</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem",
                      color: CREAM, opacity: 0.9 }}>
                      {getDisplayedIngredient(ingredient, idx)}
                    </span>
                  </li>
                ))}
              </ul>
              {/* Rose bottom strip on column */}
              <div style={{ height: 5, backgroundColor: ROSE, marginTop: "auto" }} />
            </div>

            {/* Right: cream content — instructions + notes */}
            <div className="md:col-span-8" style={{ backgroundColor: CREAM }}>
              {/* Header */}
              <div style={{ backgroundColor: BLACK, padding: "0.5rem 1.25rem",
                borderBottom: `2px solid ${GOLD}`, textAlign: "center" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.82rem",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: TEAL }}>
                  Method of Preparation
                </h2>
              </div>
              <div style={{ height: 3, backgroundColor: TEAL }} />
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

              {/* Proprietor's Notes */}
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

          {/* ── Bottom multi-band rule ── */}
          <div style={{ display: "flex", height: 7 }}>
            <div style={{ flex: 1, backgroundColor: ROSE   }} />
            <div style={{ flex: 2, backgroundColor: GOLD   }} />
            <div style={{ flex: 1, backgroundColor: TEAL   }} />
            <div style={{ flex: 2, backgroundColor: GOLD   }} />
            <div style={{ flex: 1, backgroundColor: ROSE   }} />
          </div>
        </div>

      </div>
    </Layout>
  );
}
