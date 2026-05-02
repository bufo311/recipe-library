import { Layout } from "@/components/layout";
import { RecipeForm, type RecipeFormValues } from "@/components/recipe-form";
import { useCreateRecipe, getListRecipesQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function RecipeNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createRecipe = useCreateRecipe({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
        toast({ title: "Recipe saved successfully" });
        setLocation(`/recipe/${data.id}`);
      },
      onError: () => {
        toast({ title: "Failed to save recipe", variant: "destructive" });
      }
    }
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
        ingredients: values.ingredients.map(i => i.value),
        instructions: values.instructions.map(i => i.value),
      }
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-serif mb-8 text-primary">New Recipe</h1>
        <div className="bg-card rounded-xl p-8 shadow-sm border border-border">
          <RecipeForm onSubmit={handleSubmit} isSubmitting={createRecipe.isPending} />
        </div>
      </div>
    </Layout>
  );
}
