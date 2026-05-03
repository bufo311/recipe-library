import React from "react";
import { Layout } from "@/components/layout";
import { LabelFrame } from "@/components/label-frame";
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
import { useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme-context";
import type { ThemeColors } from "@/lib/theme";

import banner1Svg from "@/assets/banner-1.svg";
import banner2Svg from "@/assets/banner-2.svg";
import banner3Svg from "@/assets/banner-3.svg";

// Each banner's text-curve is hand-tuned to follow its ribbon shape (viewBox 0 0 288 144).
// To add a new banner, append { src, curve } here and it'll automatically join the rotation.
const BANNERS: { src: string; curve: string }[] = [
  { src: banner1Svg, curve: "M 59.8 94.9 C 116.2 109.2 185.1 23.1 237.4 59.6" },
  // TODO: tune curves for banners 2 and 3 (placeholder = flat horizontal across middle)
  { src: banner2Svg, curve: "M 50 72 L 238 72" },
  { src: banner3Svg, curve: "M 50 72 L 238 72" },
];

function pickBanner(seed: number) {
  const s = ((seed | 0) >>> 0) || 1;
  // Single-step LCG to spread sequential ids across banner choices.
  const mixed = (Math.imul(s, 1664525) + 1013904223) >>> 0;
  return BANNERS[mixed % BANNERS.length];
}

function TitleBanner({ title, c, seed }: { title: string; c: ThemeColors; seed: number }) {
  const banner = pickBanner(seed);
  const pathRef = useRef<SVGPathElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const len = title.length;
  const initialSize = len > 36 ? 11 : len > 28 ? 13 : len > 20 ? 15 : len > 12 ? 18 : 22;
  const [fontSize, setFontSize] = useState(initialSize);
  useLayoutEffect(() => {
    setFontSize(initialSize);
  }, [title, initialSize]);
  useLayoutEffect(() => {
    const path = pathRef.current;
    const text = textRef.current;
    if (!path || !text) return;
    const max = path.getTotalLength() * 0.92;
    const w = text.getComputedTextLength();
    if (w > max && fontSize > 6) {
      setFontSize((s) => Math.max(6, s * (max / w)));
    }
  }, [title, fontSize]);
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "288 / 144" }}>
      <img src={banner.src} alt="" style={{ width: "100%", height: "100%", display: "block",
        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.35))" }} />
      <svg viewBox="0 0 288 144" preserveAspectRatio="xMidYMid meet"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs><path ref={pathRef} id="banner-curve" d={banner.curve} fill="none" /></defs>
        <text ref={textRef} fontFamily="'Playfair Display', serif" fontWeight={700} fontSize={fontSize}
          fill={c.ink} textAnchor="middle" letterSpacing="0.3">
          <textPath href="#banner-curve" startOffset="50%">{title}</textPath>
        </text>
      </svg>
    </div>
  );
}

function WaxSeal({ lines, c }: { lines: string[]; c: ThemeColors }) {
  const shown = lines.slice(0, 2);
  if (!shown.length) return null;
  const longest = Math.max(...shown.map(l => l.length));
  const fontSize = longest > 8 ? "0.46rem" : longest > 6 ? "0.52rem" : "0.6rem";
  return (
    <div style={{
      backgroundColor: c.maroon, color: c.cream, borderRadius: "50%",
      width: 84, height: 84, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      fontSize, lineHeight: 1.15, textTransform: "uppercase", letterSpacing: "0.5px",
      boxShadow: "inset 0 0 14px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.4)",
      border: `3px solid rgba(0,0,0,0.4)`, outline: `2px solid ${c.gold}`, outlineOffset: -7,
      transform: "rotate(-10deg)", fontWeight: "bold",
      fontFamily: "'Playfair Display', serif", padding: "0.35rem", flexShrink: 0,
      overflow: "hidden",
    }}>
      {shown.map((l, i) => (<span key={i} style={{ display: "block" }}>{l}</span>))}
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
  const { colors: c, patterns: p } = useTheme();
  const MILLS_SHADOW = `1px 1px 0 rgba(0,0,0,0.5), 2px 2px 0 rgba(0,0,0,0.3)`;

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
    const ci = convertToGrams.data.convertedIngredients[index];
    if (ci?.hasConversion && ci.converted) return formatWithOriginal(ci.converted, ingredient);
    return ingredient;
  };

  if (isLoading) return <Layout><div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin" style={{ color: c.teal }} /></div></Layout>;
  if (!recipe) return <Layout><div className="text-center py-24"><h1 className="text-2xl font-serif">Recipe not found</h1></div></Layout>;

  const sealLines = [recipe.course, recipe.cuisine ?? recipe.category].filter((v): v is string => !!v).slice(0, 2);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <LabelFrame variant={6}>

          {/* Internal top accent bands */}
          <div style={{ height: 8, backgroundImage: p.chevronGold, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 3, backgroundColor: c.rose }} />

          {/* Title zone */}
          <div className="relative overflow-visible px-4 sm:px-8 py-6 sm:min-h-[320px]"
            style={{ backgroundColor: c.sage }}>
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Ccircle cx='2' cy='2' r='0.5' fill='%23000' opacity='0.06'/%3E%3C/svg%3E")` }} />
            {/* Banner: in-flow on mobile (full width, no overhang), absolute BANNER 1 placement on sm+ */}
            <div className="relative w-auto -mx-4 pointer-events-none z-30 mb-3 sm:mx-0 sm:mb-0 sm:absolute sm:left-[-33%] sm:top-[-14.3%] sm:w-[87.5%]">
              <TitleBanner title={recipe.title} c={c} seed={recipe.id} />
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start items-center gap-4 relative">
              <div className="flex-1 order-2 sm:order-1 sm:min-h-[90px]">
                {recipe.sourceUrl && (
                  <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 sm:absolute sm:bottom-0 sm:left-0"
                    style={{ fontSize: "0.72rem", color: c.gold, fontFamily: "'Outfit', sans-serif", opacity: 0.85 }}>
                    Original Source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div className="flex flex-col items-center sm:items-end gap-3 shrink-0 order-1 sm:order-2">
                {sealLines.length > 0 && <WaxSeal lines={sealLines} c={c} />}
                <div className="flex gap-2 mt-1">
                  <Button variant="ghost" size="sm" asChild
                    style={{ color: c.cream, border: `1px solid ${c.cream}`, borderRadius: 0,
                      fontFamily: "'Outfit', sans-serif", fontSize: "0.68rem", opacity: 0.8 }}>
                    <Link href={`/recipe/${recipe.id}/edit`}><Edit3 className="h-3.5 w-3.5 mr-1" />Edit</Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm"
                        style={{ color: c.rose, border: `1px solid ${c.rose}`, borderRadius: 0,
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
                        <AlertDialogAction style={{ backgroundColor: c.maroon, color: c.cream }}
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

          {/* Post-title bands */}
          <div style={{ height: 3, backgroundColor: c.rose }} />
          <div style={{ height: 10, backgroundImage: p.cableTeal, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 12, backgroundImage: p.eggDartMaroon, backgroundRepeat: "repeat-x" }} />

          {/* Info band */}
          <div style={{ backgroundColor: c.teal, padding: "0.5rem 2rem",
            borderTop: `2px solid ${c.black}`, borderBottom: `2px solid ${c.black}` }}>
            <div className="flex gap-6 flex-wrap">
              {[
                { label: "Course",   val: recipe.course     },
                { label: "Cuisine",  val: recipe.cuisine    },
                { label: "Added By", val: recipe.cook       },
                { label: "Prep",     val: recipe.prepTime   },
                { label: "Cook Time",val: recipe.cookTime   },
                { label: "Yield",    val: recipe.yields     },
              ].filter(x => x.val).map((x, i) => (
                <div key={x.label} className={i > 0 ? "border-l border-white border-opacity-20 pl-4" : ""}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.5rem",
                    textTransform: "uppercase", letterSpacing: "0.15em", color: c.cream, opacity: 0.65 }}>{x.label}</p>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700,
                    fontSize: "0.82rem", color: c.cream }}>{x.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          {recipe.imagePath && (
            <div style={{ backgroundColor: c.powder, overflow: "hidden", maxHeight: 320,
              borderBottom: `3px solid ${c.black}`, backgroundImage: p.powderTile }}>
              <img src={recipe.imagePath} alt={recipe.title}
                className="w-full object-cover" style={{ filter: "sepia(0.1) contrast(1.05)" }} />
            </div>
          )}

          {/* Body columns */}
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="md:col-span-4" style={{ backgroundColor: c.maroon, borderRight: `3px solid ${c.black}` }}>
              <div style={{ height: 12, backgroundImage: p.eggDartMaroon, backgroundRepeat: "repeat-x",
                borderBottom: `1px solid ${c.black}` }} />
              <div style={{ backgroundColor: c.black, padding: "0.45rem 1rem",
                borderBottom: `2px solid ${c.gold}`,
                display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.85rem",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em",
                  color: c.cream, textShadow: MILLS_SHADOW }}>The Manifest</h2>
                <Button variant="ghost" size="sm" onClick={handleToggleGrams}
                  disabled={convertToGrams.isPending}
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem",
                    color: c.gold, backgroundColor: "transparent", padding: "0.1rem 0.3rem" }}>
                  {convertToGrams.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Scale className="h-3 w-3 mr-1" />}
                  {showGrams ? "Volume" : "Grams"}
                </Button>
              </div>
              <ul className="space-y-3 p-5">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex gap-2 leading-relaxed">
                    <span style={{ color: c.gold, opacity: 0.7, marginTop: 2, flexShrink: 0 }}>—</span>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem",
                      color: c.cream, opacity: 0.92 }}>
                      {getDisplayedIngredient(ingredient, idx)}
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ height: 12, backgroundImage: p.eggDartMaroon, backgroundRepeat: "repeat-x",
                borderTop: `1px solid ${c.black}`, marginTop: 8 }} />
            </div>

            <div className="md:col-span-8" style={{ backgroundColor: c.cream }}>
              <div style={{ height: 12, backgroundImage: p.eggDartDark, backgroundRepeat: "repeat-x",
                borderBottom: `1px solid ${c.black}` }} />
              <div style={{ backgroundColor: c.sage, padding: "0.45rem 1.25rem",
                borderBottom: `2px solid ${c.black}`, textAlign: "center" }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.85rem",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em",
                  color: c.cream, textShadow: MILLS_SHADOW }}>Method of Preparation</h2>
              </div>
              <ol className="space-y-7 p-6">
                {recipe.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex gap-5">
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "2.2rem",
                      color: c.maroon, opacity: 0.2, fontWeight: 900, flexShrink: 0,
                      lineHeight: 1, userSelect: "none" }}>
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem",
                      lineHeight: 1.78, color: c.ink }}>{instruction}</p>
                  </li>
                ))}
              </ol>
              {recipe.notes && (
                <div style={{ margin: "0 1.5rem 1.5rem", padding: "1.1rem",
                  backgroundColor: c.parch, border: `2px solid ${c.gold}`,
                  boxShadow: `4px 4px 0 ${c.maroon}`, transform: "rotate(0.35deg)" }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.9rem",
                    fontWeight: 700, color: c.maroon, borderBottom: `1px solid ${c.ink}`,
                    paddingBottom: "0.25rem", marginBottom: "0.5rem", display: "inline-block" }}>
                    Proprietor's Notes:
                  </h3>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                    fontSize: "1.08rem", color: c.ink, lineHeight: 1.72, whiteSpace: "pre-wrap" }}>
                    {recipe.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom accent bands */}
          <div style={{ height: 8, backgroundImage: p.chevronGold, backgroundRepeat: "repeat-x" }} />
          <div style={{ display: "flex", height: 5 }}>
            <div style={{ flex: 1, backgroundColor: c.rose  }} />
            <div style={{ flex: 2, backgroundColor: c.gold  }} />
            <div style={{ flex: 1, backgroundColor: c.teal  }} />
            <div style={{ flex: 2, backgroundColor: c.gold  }} />
            <div style={{ flex: 1, backgroundColor: c.rose  }} />
          </div>

        </LabelFrame>
      </div>
    </Layout>
  );
}
