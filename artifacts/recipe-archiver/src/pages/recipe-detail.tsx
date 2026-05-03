import React from "react";
import { Layout } from "@/components/layout";
import { useGetRecipe, useDeleteRecipe, useConvertToGrams, getGetRecipeQueryKey, getListRecipesQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit3, Trash2, Clock, Users, ExternalLink, Scale } from "lucide-react";
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

const CLARET = "#722F37";
const DARK_BROWN = "#2C1810";
const CREAM = "#FDFBF7";
const PARCHMENT = "#F4ECD8";
const GOLD = "#D4AF37";

function OrnamentalDivider() {
  return (
    <div
      className="text-center my-6"
      style={{ color: DARK_BROWN, fontSize: "1.1rem", letterSpacing: "0.2em", opacity: 0.6 }}
    >
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
        width: 80,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontSize: "0.58rem",
        lineHeight: 1.2,
        textTransform: "uppercase",
        letterSpacing: "1px",
        boxShadow: "inset 0 0 10px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.3)",
        border: `2px solid #5a232b`,
        transform: "rotate(-10deg)",
        fontWeight: "bold",
        fontFamily: "'Playfair Display', serif",
        padding: "0.5rem",
        flexShrink: 0,
      }}
    >
      {lines.map((l, i) => (
        <span key={i}>
          {i > 0 && <br />}
          {i > 0 && <span style={{ opacity: 0.5 }}>&</span>}
          {i > 0 && <br />}
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
      onSuccess: () => { setShowGrams(true); },
      onError: () => {
        toast({ title: "Failed to convert measurements", variant: "destructive" });
      }
    }
  });

  const handleToggleGrams = () => {
    if (showGrams) {
      setShowGrams(false);
    } else {
      if (convertToGrams.data) {
        setShowGrams(true);
      } else {
        convertToGrams.mutate({ id: recipeId });
      }
    }
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
        {volumeMatch && (
          <span style={{ color: "hsl(var(--muted-foreground))", opacity: 0.7, fontSize: "0.875rem" }}> ({volumeMatch[1].trim()})</span>
        )}
        <span> {ingredientName}</span>
      </>
    );
  };

  const getDisplayedIngredient = (ingredient: string, index: number): React.ReactNode => {
    if (!showGrams || !convertToGrams.data) return ingredient;
    const convertedInfo = convertToGrams.data.convertedIngredients[index];
    if (convertedInfo && convertedInfo.hasConversion && convertedInfo.converted) {
      return formatWithOriginal(convertedInfo.converted, ingredient);
    }
    return ingredient;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" style={{ color: CLARET }} />
        </div>
      </Layout>
    );
  }

  if (!recipe) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-serif">Recipe not found</h1>
        </div>
      </Layout>
    );
  }

  const sealLines = [recipe.course, recipe.cuisine ?? recipe.category].filter((v): v is string => !!v).slice(0, 2);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">

        {/* Victorian border frame */}
        <div
          style={{
            border: `4px double ${DARK_BROWN}`,
            padding: 4,
            backgroundColor: CREAM,
            position: "relative",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 6,
              border: `1px solid ${DARK_BROWN}`,
              pointerEvents: "none",
              opacity: 0.4,
            }}
          />

          <div className="p-6 md:p-10 relative">

            {/* Wax seal + edit/delete in top-right area */}
            <div className="flex justify-between items-start mb-6 gap-4">
              <div style={{ flex: 1 }} />
              <div className="flex items-center gap-3">
                {sealLines.length > 0 && <WaxSeal lines={sealLines} />}
                <div className="flex gap-2 flex-col items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    style={{ borderColor: DARK_BROWN, color: DARK_BROWN, fontFamily: "'Outfit', sans-serif" }}
                  >
                    <Link href={`/recipe/${recipe.id}/edit`}>
                      <Edit3 className="h-4 w-4 mr-2" /> Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ borderColor: CLARET, color: CLARET, fontFamily: "'Outfit', sans-serif" }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently remove the receipt from your collection.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          style={{ backgroundColor: CLARET, color: CREAM }}
                          onClick={() => deleteRecipe.mutate({ id: recipe.id })}
                        >
                          {deleteRecipe.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            {/* Title label */}
            <div
              style={{
                border: `3px solid ${DARK_BROWN}`,
                padding: "1.5rem",
                textAlign: "center",
                position: "relative",
                backgroundColor: "#FFF9EB",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 4,
                  border: `1px solid ${DARK_BROWN}`,
                  pointerEvents: "none",
                  opacity: 0.3,
                }}
              />
              <p
                className="mb-3"
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: CLARET,
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Fine Culinary Receipts
              </p>
              <h1
                className="leading-tight mb-1"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
                  fontWeight: 900,
                  color: DARK_BROWN,
                }}
              >
                {recipe.title}
              </h1>
              {recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2"
                  style={{ fontSize: "0.75rem", color: CLARET, fontFamily: "'Outfit', sans-serif" }}
                >
                  Original Source <ExternalLink className="h-3 w-3" />
                </a>
              )}

              <div className="flex justify-center items-center gap-3 my-4">
                <span style={{ width: 40, height: 1, backgroundColor: DARK_BROWN, display: "inline-block", opacity: 0.5 }} />
                <span style={{ fontSize: "1.2rem", color: DARK_BROWN }}>❧</span>
                <span style={{ width: 40, height: 1, backgroundColor: DARK_BROWN, display: "inline-block", opacity: 0.5 }} />
              </div>

              {/* Time + yield row */}
              {(recipe.prepTime || recipe.cookTime || recipe.totalTime || recipe.yields) && (
                <div
                  className="flex justify-center gap-6 flex-wrap mx-auto max-w-lg"
                  style={{
                    borderTop: `1px solid ${DARK_BROWN}`,
                    borderBottom: `1px solid ${DARK_BROWN}`,
                    padding: "0.5rem 0",
                    opacity: 0.85,
                  }}
                >
                  {recipe.prepTime && (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6rem", opacity: 0.6, fontFamily: "'Outfit', sans-serif" }}>Prep</p>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.8rem" }}>{recipe.prepTime}</p>
                    </div>
                  )}
                  {recipe.cookTime && (
                    <>
                      {recipe.prepTime && <div style={{ width: 1, backgroundColor: DARK_BROWN, opacity: 0.3 }} />}
                      <div style={{ textAlign: "center" }}>
                        <p style={{ textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6rem", opacity: 0.6, fontFamily: "'Outfit', sans-serif" }}>Cook</p>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.8rem" }}>{recipe.cookTime}</p>
                      </div>
                    </>
                  )}
                  {recipe.totalTime && (
                    <>
                      {(recipe.prepTime || recipe.cookTime) && <div style={{ width: 1, backgroundColor: DARK_BROWN, opacity: 0.3 }} />}
                      <div style={{ textAlign: "center" }}>
                        <p style={{ textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6rem", opacity: 0.6, fontFamily: "'Outfit', sans-serif" }}>Total</p>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.8rem" }}>{recipe.totalTime}</p>
                      </div>
                    </>
                  )}
                  {recipe.yields && (
                    <>
                      {(recipe.prepTime || recipe.cookTime || recipe.totalTime) && <div style={{ width: 1, backgroundColor: DARK_BROWN, opacity: 0.3 }} />}
                      <div style={{ textAlign: "center" }}>
                        <p style={{ textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6rem", opacity: 0.6, fontFamily: "'Outfit', sans-serif" }}>Yield</p>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.8rem" }}>{recipe.yields}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Hero image */}
            {recipe.imagePath && (
              <div
                className="w-full overflow-hidden mb-6"
                style={{ border: `3px solid ${DARK_BROWN}`, borderRadius: 0, aspectRatio: "21/9" }}
              >
                <img src={recipe.imagePath} alt={recipe.title} className="w-full h-full object-cover" />
              </div>
            )}

            <OrnamentalDivider />

            {/* Body: The Manifest + Method of Preparation */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">

              {/* The Manifest (Ingredients) */}
              <div className="md:col-span-4">
                <div
                  className="h-full"
                  style={{
                    backgroundColor: PARCHMENT,
                    padding: "1.5rem",
                    borderLeft: `4px solid ${CLARET}`,
                    boxShadow: "inset 0 0 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between mb-4" style={{ borderBottom: `2px solid ${DARK_BROWN}`, paddingBottom: "0.5rem" }}>
                    <h2
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1.25rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: DARK_BROWN,
                        fontWeight: 700,
                      }}
                    >
                      The Manifest
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleGrams}
                      disabled={convertToGrams.isPending}
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: "0.7rem",
                        color: showGrams ? CLARET : "hsl(var(--muted-foreground))",
                        backgroundColor: showGrams ? `${CLARET}15` : undefined,
                      }}
                    >
                      {convertToGrams.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Scale className="h-3 w-3 mr-1" />}
                      {showGrams ? "Volume" : "Grams"}
                    </Button>
                  </div>
                  <ul className="space-y-3">
                    {recipe.ingredients.map((ingredient, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 leading-relaxed"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: DARK_BROWN }}
                      >
                        <span style={{ color: CLARET, opacity: 0.7, marginTop: 2 }}>—</span>
                        <span>{getDisplayedIngredient(ingredient, idx)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Method of Preparation (Instructions) */}
              <div className="md:col-span-8 space-y-6">
                <h2
                  className="text-center"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.6rem",
                    color: CLARET,
                    borderBottom: `2px solid ${DARK_BROWN}`,
                    paddingBottom: "0.5rem",
                    opacity: 0.9,
                  }}
                >
                  Method of Preparation
                </h2>
                <ol className="space-y-7">
                  {recipe.instructions.map((instruction, idx) => (
                    <li key={idx} className="flex gap-5">
                      <span
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: "2rem",
                          color: DARK_BROWN,
                          opacity: 0.2,
                          fontWeight: 900,
                          flexShrink: 0,
                          lineHeight: 1,
                          paddingTop: "0.1em",
                          userSelect: "none",
                        }}
                      >
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <p
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1.15rem",
                          lineHeight: 1.75,
                          color: DARK_BROWN,
                        }}
                      >
                        {instruction}
                      </p>
                    </li>
                  ))}
                </ol>

                {/* Proprietor's Notes */}
                {recipe.notes && (
                  <div
                    className="mt-8 p-5"
                    style={{
                      backgroundColor: "#E8DCC4",
                      border: `1px solid ${DARK_BROWN}`,
                      boxShadow: `4px 4px 0 ${DARK_BROWN}`,
                      transform: "rotate(0.5deg)",
                    }}
                  >
                    <h3
                      className="inline-block mb-2 pb-1"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "1rem",
                        fontWeight: 700,
                        borderBottom: `1px solid ${DARK_BROWN}`,
                        color: DARK_BROWN,
                      }}
                    >
                      Proprietor's Notes:
                    </h3>
                    <p
                      className="whitespace-pre-wrap leading-relaxed"
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: "italic",
                        fontSize: "1.1rem",
                        color: "#1a0f0a",
                        opacity: 0.85,
                      }}
                    >
                      {recipe.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mt-10 mb-2" style={{ color: DARK_BROWN, opacity: 0.35, fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "'Outfit', sans-serif" }}>
              ─── ✦ ❧ ✦ ───
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
