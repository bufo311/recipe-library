import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { uploadImage } from "@/lib/image-upload";
import { Plus, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const recipeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  sourceUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imagePath: z.string().optional().or(z.literal("")),
  yields: z.string().optional().or(z.literal("")),
  category: z.string().optional().or(z.literal("")),
  totalTime: z.string().optional().or(z.literal("")),
  prepTime: z.string().optional().or(z.literal("")),
  cookTime: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  ingredients: z.array(z.object({ value: z.string().min(1, "Cannot be empty") })).min(1, "At least one ingredient is required"),
  instructions: z.array(z.object({ value: z.string().min(1, "Cannot be empty") })).min(1, "At least one instruction is required"),
});

export type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  defaultValues?: Partial<RecipeFormValues>;
  onSubmit: (values: RecipeFormValues) => void;
  isSubmitting?: boolean;
}

export function RecipeForm({ defaultValues, onSubmit, isSubmitting }: RecipeFormProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      sourceUrl: defaultValues?.sourceUrl || "",
      imagePath: defaultValues?.imagePath || "",
      yields: defaultValues?.yields || "",
      category: defaultValues?.category || "",
      totalTime: defaultValues?.totalTime || "",
      prepTime: defaultValues?.prepTime || "",
      cookTime: defaultValues?.cookTime || "",
      notes: defaultValues?.notes || "",
      ingredients: defaultValues?.ingredients?.length ? defaultValues.ingredients : [{ value: "" }],
      instructions: defaultValues?.instructions?.length ? defaultValues.instructions : [{ value: "" }],
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file);
      form.setValue("imagePath", url);
      toast({ title: "Image uploaded successfully" });
    } catch (err) {
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Grandma's Apple Pie" className="text-xl font-serif h-14" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="sourceUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dessert, Dinner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="prepTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prep Time</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 15 mins" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cookTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cook Time</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 45 mins" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="totalTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Time</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 1 hour" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="yields"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yields</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 4 servings" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Recipe Image</FormLabel>
              <div className="flex items-center gap-4">
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="flex-1" />
                {isUploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              {form.watch("imagePath") && (
                <div className="mt-4 relative aspect-video w-full rounded-md overflow-hidden bg-muted">
                  <img src={form.watch("imagePath")} alt="Preview" className="object-cover w-full h-full" />
                </div>
              )}
            </FormItem>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-serif border-b border-border/50 pb-2">Ingredients</h3>
          <div className="space-y-3">
            {form.watch("ingredients").map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`ingredients.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input placeholder="e.g. 2 cups all-purpose flour" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const ingredients = form.getValues("ingredients");
                          if (ingredients.length > 1) {
                            form.setValue("ingredients", ingredients.filter((_, i) => i !== index));
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.setValue("ingredients", [...form.getValues("ingredients"), { value: "" }]);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Ingredient
          </Button>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-serif border-b border-border/50 pb-2">Instructions</h3>
          <div className="space-y-4">
            {form.watch("instructions").map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`instructions.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-4">
                      <div className="flex-none pt-2 text-xl font-serif text-muted-foreground font-medium">
                        {(index + 1).toString().padStart(2, "0")}
                      </div>
                      <div className="flex-1 flex gap-2">
                        <FormControl>
                          <Textarea placeholder="Step instructions..." className="min-h-[80px]" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const instructions = form.getValues("instructions");
                            if (instructions.length > 1) {
                              form.setValue("instructions", instructions.filter((_, i) => i !== index));
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.setValue("instructions", [...form.getValues("instructions"), { value: "" }]);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Step
          </Button>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-serif border-b border-border/50 pb-2">Notes</h3>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="Any additional notes, tips, or variations..." className="min-h-[120px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-6 border-t border-border/50">
          <Button type="submit" size="lg" className="w-full text-lg h-14" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Save Recipe
          </Button>
        </div>
      </form>
    </Form>
  );
}
