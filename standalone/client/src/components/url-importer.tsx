import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useScrapeRecipe } from "@/lib/api-client";
import { useLocation } from "wouter";
import { Loader2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { setPendingImport } from "@/lib/import-store";

const urlSchema = z.object({ url: z.string().url("Please enter a valid URL") });

export function UrlImporter() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: { url: "" },
  });

  const scrapeRecipe = useScrapeRecipe({
    mutation: {
      onSuccess: (data) => {
        setPendingImport({
          title: data.title,
          sourceUrl: data.sourceUrl,
          ingredients: data.ingredients,
          instructions: data.instructions,
          imagePath: data.imagePath ?? null,
          yields: data.yields ?? null,
          totalTime: data.totalTime ?? null,
          prepTime: data.prepTime ?? null,
          cookTime: data.cookTime ?? null,
          course: data.course ?? null,
          cuisine: data.cuisine ?? null,
          attribute: data.attribute ?? [],
        });
        setLocation("/recipe/new");
      },
      onError: () => toast({ title: "Could not parse recipe from URL.", variant: "destructive" }),
    },
  });

  const onSubmit = (values: z.infer<typeof urlSchema>) => {
    scrapeRecipe.mutate({ data: values });
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-primary mb-2">Import a Recipe</h2>
        <p className="text-muted-foreground">Paste a URL from any food blog. We'll extract just the recipe—no life stories or ads.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
          <FormField control={form.control} name="url" render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="https://..." className="pl-10 h-12 text-base" {...field} disabled={scrapeRecipe.isPending} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" size="lg" className="h-12 px-6" disabled={scrapeRecipe.isPending}>
            {scrapeRecipe.isPending ? <><Loader2 className="h-5 w-5 animate-spin mr-2" />Extracting…</> : "Import"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
