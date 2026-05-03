import { useState } from "react";
import { Layout } from "@/components/layout";
import { LabelFrame } from "@/components/label-frame";
import { RecipeForm, type RecipeFormValues } from "@/components/recipe-form";
import { useCreateRecipe, getListRecipesQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { consumePendingImport } from "@/lib/import-store";

function buildDefaultValues(): Partial<RecipeFormValues> | undefined {
  const imp = consumePendingImport();
  if (!imp) return undefined;
  return {
    title: imp.title,
    sourceUrl: imp.sourceUrl,
    imagePath: imp.imagePath ?? "",
    yields: imp.yields ?? "",
    totalTime: imp.totalTime ?? "",
    prepTime: imp.prepTime ?? "",
    cookTime: imp.cookTime ?? "",
    course: imp.course ?? "",
    cuisine: imp.cuisine ?? "",
    attribute: imp.attribute,
    ingredients: imp.ingredients.length > 0 ? imp.ingredients.map((v) => ({ value: v })) : [{ value: "" }],
    instructions: imp.instructions.length > 0 ? imp.instructions.map((v) => ({ value: v })) : [{ value: "" }],
  };
}

export default function RecipeNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [defaultValues] = useState<Partial<RecipeFormValues> | undefined>(buildDefaultValues);

  const createRecipe = useCreateRecipe({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
        toast({ title: "Recipe saved successfully" });
        setLocation(`/recipe/${data.id}`);
      },
      onError: () => {
        toast({ title: "Failed to save recipe", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (values: RecipeFormValues) => {
    createRecipe.mutate({
      data: {
        title: values.title,
        sourceUrl: values.sourceUrl || undefined,
        imagePath: values.imagePath || undefined,
        yields: values.yields || undefined,
        category: values.category || undefined,
        totalTime: values.totalTime || undefined,
        prepTime: values.prepTime || undefined,
        cookTime: values.cookTime || undefined,
        notes: values.notes || undefined,
        course: values.course || undefined,
        cuisine: values.cuisine || undefined,
        attribute: values.attribute || [],
        ingredients: values.ingredients.map((i) => i.value),
        instructions: values.instructions.map((i) => i.value),
      },
    });
  };

  const isImport = !!defaultValues;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-primary">
            {isImport ? "Review Imported Recipe" : "New Recipe"}
          </h1>
          {isImport && (
            <p className="text-muted-foreground mt-2">
              We've filled in what we found. Check the guessed tags, make any corrections, then save.
            </p>
          )}
        </div>
        <LabelFrame variant={2}>
          <div className="bg-card p-8">
            <RecipeForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              isSubmitting={createRecipe.isPending}
            />
          </div>
        </LabelFrame>
      </div>
    </Layout>
  );
}
