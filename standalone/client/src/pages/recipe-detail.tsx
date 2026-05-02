import React from "react";
import { Layout } from "@/components/layout";
import {
  useGetRecipe, useDeleteRecipe, useConvertToGrams,
  getGetRecipeQueryKey, getListRecipesQueryKey,
} from "@/lib/api-client";
import { useLocation, useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Edit3, Trash2, Clock, Users, ExternalLink, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function RecipeDetail() {
  const { id } = useParams();
  const recipeId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showGrams, setShowGrams] = useState(false);

  const { data: recipe, isLoading } = useGetRecipe(recipeId, {
    query: { enabled: !!recipeId, queryKey: getGetRecipeQueryKey(recipeId) },
  });

  const deleteRecipe = useDeleteRecipe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
        toast({ title: "Recipe deleted" });
        setLocation("/");
      },
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

  if (isLoading) {
    return <Layout><div className="container mx-auto px-4 py-24 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  if (!recipe) {
    return <Layout><div className="container mx-auto px-4 py-24 text-center"><h1 className="text-2xl font-serif">Recipe not found</h1></div></Layout>;
  }

  const formatWithOriginal = (converted: string, original: string): React.ReactNode => {
    const volumePattern = /([\d\s½⅓⅔¼¾⅛⅜⅝⅞\/\.]+\s*(?:cups?|tablespoons?|teaspoons?|tbsps?|tsps?))/i;
    const volumeMatch = original.match(volumePattern);
    const gramMatch = converted.match(/^(\d+g)\s+(.+)$/);
    if (!gramMatch) return converted;
    const [, grams, ingredientName] = gramMatch;
    return (
      <>
        <span>{grams}</span>
        {volumeMatch && <span className="text-muted-foreground/60 text-sm"> ({volumeMatch[1].trim()})</span>}
        <span> {ingredientName}</span>
      </>
    );
  };

  const getDisplayedIngredient = (ingredient: string, index: number): React.ReactNode => {
    if (!showGrams || !convertToGrams.data) return ingredient;
    const convertedInfo = convertToGrams.data.convertedIngredients[index];
    if (convertedInfo?.hasConversion && convertedInfo.converted) {
      return formatWithOriginal(convertedInfo.converted, ingredient);
    }
    return ingredient;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
          <div>
            {recipe.category && <Badge variant="secondary" className="mb-4 font-normal tracking-wide uppercase text-xs">{recipe.category}</Badge>}
            <h1 className="text-4xl md:text-5xl font-serif text-foreground font-bold tracking-tight">{recipe.title}</h1>
            {recipe.sourceUrl && (
              <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2">
                Original Recipe <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/recipe/${recipe.id}/edit`}><Edit3 className="h-4 w-4 mr-2" /> Edit</Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Recipe?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete your saved recipe.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => deleteRecipe.mutate({ id: recipe.id })}>
                    {deleteRecipe.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {recipe.imagePath && (
          <div className="w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden mb-12 bg-muted/50 border border-border/50">
            <img src={recipe.imagePath} alt={recipe.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-wrap gap-6 md:gap-12 py-6 mb-12 border-y border-border/50 text-sm">
          {(recipe.prepTime || recipe.cookTime || recipe.totalTime) && (
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary opacity-80" />
              <div>
                {recipe.prepTime && <p><span className="font-medium text-foreground">Prep:</span> {recipe.prepTime}</p>}
                {recipe.cookTime && <p><span className="font-medium text-foreground">Cook:</span> {recipe.cookTime}</p>}
                {recipe.totalTime && <p><span className="font-medium text-foreground">Total:</span> {recipe.totalTime}</p>}
              </div>
            </div>
          )}
          {recipe.yields && (
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary opacity-80" />
              <div>
                <p className="font-medium text-foreground">Yields</p>
                <p className="text-muted-foreground">{recipe.yields}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
          <div className="md:col-span-4 space-y-8">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <h2 className="text-2xl font-serif text-primary">Ingredients</h2>
              <Button variant="ghost" size="sm" onClick={handleToggleGrams}
                className={showGrams ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}
                disabled={convertToGrams.isPending}>
                {convertToGrams.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Scale className="h-4 w-4 mr-2" />}
                {showGrams ? "Show Volume" : "To Grams"}
              </Button>
            </div>
            <ul className="space-y-3 font-serif text-lg text-foreground/90">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="flex gap-3 leading-relaxed">
                  <span className="text-primary/60 mt-1.5">•</span>
                  <span>{getDisplayedIngredient(ingredient, idx)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-8 space-y-8">
            <h2 className="text-2xl font-serif text-primary border-b border-border/50 pb-2">Instructions</h2>
            <ol className="space-y-8 text-foreground/90">
              {recipe.instructions.map((instruction, idx) => (
                <li key={idx} className="flex gap-6">
                  <span className="font-serif text-3xl text-primary/30 font-medium shrink-0 pt-0.5 select-none">{(idx + 1).toString().padStart(2, "0")}</span>
                  <p className="text-lg leading-relaxed font-sans">{instruction}</p>
                </li>
              ))}
            </ol>
            {recipe.notes && (
              <div className="mt-12 p-6 bg-secondary/10 rounded-xl border border-secondary/20">
                <h3 className="text-xl font-serif text-secondary-foreground font-medium mb-3">Chef's Notes</h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{recipe.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
