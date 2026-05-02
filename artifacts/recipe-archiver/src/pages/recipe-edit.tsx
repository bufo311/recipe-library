import { Layout } from "@/components/layout";
import { RecipeForm, type RecipeFormValues } from "@/components/recipe-form";
import { useGetRecipe, useUpdateRecipe, getGetRecipeQueryKey, getListRecipesQueryKey } from "@workspace/api-client-react";
import { useLocation, useParams } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function RecipeEdit() {
  const { id } = useParams();
  const recipeId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recipe, isLoading } = useGetRecipe(recipeId, {
    query: { enabled: !!recipeId, queryKey: getGetRecipeQueryKey(recipeId) }
  });

  const updateRecipe = useUpdateRecipe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetRecipeQueryKey(recipeId) });
        queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
        toast({ title: "Recipe updated successfully" });
        setLocation(`/recipe/${recipeId}`);
      },
      onError: () => {
        toast({ title: "Failed to update recipe", variant: "destructive" });
      }
    }
  });

  const handleSubmit = (values: RecipeFormValues) => {
    updateRecipe.mutate({
      id: recipeId,
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
        ingredients: values.ingredients.map(i => i.value),
        instructions: values.instructions.map(i => i.value),
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const defaultValues: Partial<RecipeFormValues> = {
    title: recipe.title,
    sourceUrl: recipe.sourceUrl || "",
    imagePath: recipe.imagePath || "",
    yields: recipe.yields || "",
    category: recipe.category || "",
    totalTime: recipe.totalTime || "",
    prepTime: recipe.prepTime || "",
    cookTime: recipe.cookTime || "",
    notes: recipe.notes || "",
    course: recipe.course || "",
    cuisine: recipe.cuisine || "",
    attribute: recipe.attribute || [],
    ingredients: recipe.ingredients.map(i => ({ value: i })),
    instructions: recipe.instructions.map(i => ({ value: i })),
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-serif mb-8 text-primary">Edit Recipe</h1>
        <div className="bg-card rounded-xl p-8 shadow-sm border border-border">
          <RecipeForm defaultValues={defaultValues} onSubmit={handleSubmit} isSubmitting={updateRecipe.isPending} />
        </div>
      </div>
    </Layout>
  );
}
