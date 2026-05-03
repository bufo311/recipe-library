import React from "react";
import { Layout } from "@/components/layout";
import { LabelFrame } from "@/components/label-frame";
import {
  useGetRecipe, useDeleteRecipe, useConvertToGrams,
  getGetRecipeQueryKey, getListRecipesQueryKey,
} from "@/lib/api-client";
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
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/lib/theme-context";
import type { ThemeColors } from "@/lib/theme";

import banner1Raw from "@/assets/banner-1.svg?raw";
import banner2Raw from "@/assets/banner-2.svg?raw";
import banner3Raw from "@/assets/banner-3.svg?raw";

// ---------------------------------------------------------------------------
// Banner colour palette — 100 curated Victorian hues as [h, s, l].
// Back colour is automatically derived as same h+s but l-18 (darker fold).
// ---------------------------------------------------------------------------
const PALETTE: readonly [number, number, number][] = [
  // Crimsons & reds
  [0,65,38],[0,75,32],[5,68,40],[8,72,35],[12,65,38],[15,60,40],
  // Russet & terracotta
  [20,70,38],[25,72,40],[28,68,40],[32,75,38],[36,70,40],[40,72,38],
  // Amber & gold
  [42,72,40],[46,70,42],[50,68,40],[54,65,42],[58,62,42],
  // Yellow-green & chartreuse
  [62,55,40],[68,52,40],[74,55,38],[80,50,40],
  // Sage & mid-greens
  [90,48,38],[100,52,36],[110,55,36],[118,52,35],[125,55,33],[130,58,33],
  [138,55,33],[145,52,35],[150,58,33],
  // Dark forest greens
  [95,55,28],[120,60,26],[140,58,28],
  // Teals
  [158,55,35],[162,58,33],[168,60,32],[174,58,35],[178,62,32],[183,60,35],
  // Cerulean & aqua
  [188,58,38],[193,60,38],[198,62,40],[202,58,42],
  // Blues
  [206,58,40],[212,62,40],[218,65,40],[222,62,42],[228,60,42],
  [234,62,40],[238,60,40],[242,58,42],
  // Deep navy
  [215,70,28],[225,72,28],[232,68,30],
  // Blue-purples
  [246,52,42],[250,55,42],[254,52,42],[258,50,42],
  // Purples & violets
  [262,48,42],[267,52,40],[272,55,40],[276,52,42],[280,48,42],[284,52,40],
  // Mauves & orchids
  [288,46,42],[293,48,40],[298,50,40],[302,48,42],[306,45,42],
  // Roses & pinks
  [312,52,38],[318,55,38],[324,58,40],[330,55,40],[336,55,40],
  [342,58,40],[348,60,40],[354,62,40],
  // Deep plum & burgundy
  [300,55,28],[320,58,30],[340,62,28],[350,65,30],
  // Muted / dusty variants (lower saturation — more faded Victorian feel)
  [0,42,46],[30,40,46],[65,38,44],[120,38,42],[180,42,40],
  [210,40,44],[260,38,44],[310,40,44],
  // Extra warm neutrals
  [22,55,42],[35,52,44],[48,58,40],[72,48,40],[155,45,38],
  [195,50,40],[235,50,42],[275,44,42],[325,48,42],[345,52,42],
];

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function pickPalette(seed: number): [number, number, number] {
  const s = ((seed | 0) >>> 0) || 1;
  // Different LCG step from pickBanner so shape and colour are independent.
  const mixed = (Math.imul(s, 2246822519) + 1823119183) >>> 0;
  return PALETTE[mixed % PALETTE.length];
}

// Derive a full coordinated 5-color set from a single palette hue.
// main/back share the hue. border is a warm analogous shift (+28°).
// detail is near-complementary (+160°). warm is a mid analogous (+48°).
function deriveColors(seed: number) {
  const [h, s, l] = pickPalette(seed);
  return {
    main:   hslToHex(h, s, l),
    back:   hslToHex(h, s, Math.max(8, l - 18)),
    border: hslToHex((h + 28) % 360, Math.max(10, s - 5),  Math.min(85, l + 10)),
    detail: hslToHex((h + 160) % 360, Math.max(10, s - 15), Math.min(80, l + 5)),
    warm:   hslToHex((h + 48) % 360, Math.max(10, s - 8),  Math.min(82, l + 12)),
  };
}

// Per-banner: orig is the set of original hex values for each recolorable role.
// All roles shift together from a single seed so the palette is always coherent.
type BannerOrig = { main: string; back: string; border: string; detail: string; warm?: string };
type Banner = {
  raw: string;
  orig: BannerOrig;
  curve: string;
  leftPct: number;
  topPct: number;
  widthPct: number;
};
const BANNERS: Banner[] = [
  {
    raw: banner1Raw,
    orig: { main: "#b6402f", back: "#5c5637", border: "#908365", detail: "#b5c0af" },
    curve: "M 61.8 91.6 C 118.2 103.8 187.1 19.8 239.4 56.3", leftPct: -26.7, topPct: -14.7, widthPct: 94.2,
  },
  {
    raw: banner2Raw,
    orig: { main: "#53996e", back: "#215741", border: "#cb5f4f", detail: "#66867f", warm: "#c3a87b" },
    curve: "M 45.4 90.4 C 110.0 118.6 177.3 60.9 238.0 68.7", leftPct: -24.6, topPct: -21.9, widthPct: 96.1,
  },
  {
    raw: banner3Raw,
    orig: { main: "#e0d37b", back: "#5d4b24", border: "#96853f", detail: "#ac67aa" },
    curve: "M 46.8 53.6 C 116.3 25.7 167.9 99.3 237.4 84.7", leftPct: -27.4, topPct: -10.0, widthPct: 99.4,
  },
];

export function pickBanner(seed: number): Banner {
  const s = ((seed | 0) >>> 0) || 1;
  const mixed = (Math.imul(s, 1664525) + 1013904223) >>> 0;
  return BANNERS[mixed % BANNERS.length];
}

function TitleBanner({ title, c, banner, seed }: { title: string; c: ThemeColors; banner: Banner; seed: number }) {
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

  const { bannerSrc, textFill, textStroke } = useMemo(() => {
    const d = deriveColors(seed);
    const { orig } = banner;
    let svg = banner.raw
      .replaceAll(orig.main, d.main)
      .replaceAll(orig.back, d.back)
      .replaceAll(orig.border, d.border)
      .replaceAll(orig.detail, d.detail);
    if (orig.warm) svg = svg.replaceAll(orig.warm, d.warm);
    return {
      bannerSrc: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
      textFill: d.detail,
      textStroke: d.border,
    };
  }, [banner, seed]);

  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "288 / 144" }}>
      <img src={bannerSrc} alt="" style={{ width: "100%", height: "100%", display: "block",
        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.35))" }} />
      <svg viewBox="0 0 288 144" preserveAspectRatio="xMidYMid meet"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs><path ref={pathRef} id="banner-curve" d={banner.curve} fill="none" /></defs>
        <text ref={textRef} fontFamily="'Playfair Display', serif" fontWeight={700} fontSize={fontSize}
          fill={textFill} stroke={textStroke} strokeWidth="2.5" paintOrder="stroke fill"
          textAnchor="middle" letterSpacing="0.3">
          <textPath href="#banner-curve" startOffset="50%">{title}</textPath>
        </text>
      </svg>
    </div>
  );
}

function WaxSeal({ lines, c }: { lines: string[]; c: ThemeColors }) {
  const shown = lines.slice(0, 2);
  if (!shown.length) return null;
  const longest = Math.max(...shown.map((l) => l.length));
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
    query: { enabled: !!recipeId, queryKey: getGetRecipeQueryKey(recipeId) },
  });
  const deleteRecipe = useDeleteRecipe({
    mutation: {
      onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
        toast({ title: "Recipe deleted" }); setLocation("/"); },
      onError: () => toast({ title: "Failed to delete recipe", variant: "destructive" }),
    },
  });
  const convertToGrams = useConvertToGrams({
    mutation: {
      onSuccess: () => setShowGrams(true),
      onError: () => toast({ title: "Failed to convert measurements", variant: "destructive" }),
    },
  });
  const handleToggleGrams = () => {
    if (showGrams) { setShowGrams(false); return; }
    if (convertToGrams.data) { setShowGrams(true); return; }
    convertToGrams.mutate({ id: recipeId });
  };

  if (isLoading) return <Layout><div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin" style={{ color: c.teal }} /></div></Layout>;
  if (!recipe) return <Layout><div className="text-center py-24"><h1 className="text-2xl font-serif">Recipe not found</h1></div></Layout>;

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
            {/* Banner: in-flow on mobile (full width, no overhang), absolute BANNER 1 placement on sm+ */}
            {(() => {
              const banner = pickBanner(recipe.id);
              return (
                <div
                  className="relative w-auto -mx-4 pointer-events-none z-30 mb-3 sm:mx-0 sm:mb-0 sm:absolute sm:left-[var(--bnr-l)] sm:top-[var(--bnr-t)] sm:w-[var(--bnr-w)]"
                  style={{ "--bnr-l": `${banner.leftPct}%`, "--bnr-t": `${banner.topPct}%`, "--bnr-w": `${banner.widthPct}%` } as React.CSSProperties}>
                  <TitleBanner title={recipe.title} c={c} banner={banner} seed={recipe.id} />
                </div>
              );
            })()}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start items-center gap-4 relative">
              <div className="flex-1 order-2 sm:order-1 sm:min-h-[90px]" />
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
                {recipe.sourceUrl && (
                  <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                    style={{ fontSize: "0.68rem", color: c.gold, fontFamily: "'Outfit', sans-serif", opacity: 0.8 }}>
                    Original Source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
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
                { label: "Course",  val: recipe.course     },
                { label: "Cuisine", val: recipe.cuisine    },
                { label: "Added By", val: recipe.cook       },
                { label: "Prep",    val: recipe.prepTime   },
                { label: "Cook Time", val: recipe.cookTime },
                { label: "Yield",   val: recipe.yields     },
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
                      lineHeight: 1.78, color: c.ink, minWidth: 0, overflowWrap: "break-word",
                      wordBreak: "break-word" }}>{instruction}</p>
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
