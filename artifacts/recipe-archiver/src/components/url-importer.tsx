import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useScrapeRecipe, useCreateRecipe, getListRecipesQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Loader2, Plus, Search, BookMarked, Globe, Trash2, Clock, Users, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export function UrlImporter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [scrapedData, setScrapedData] = useState<any>(null);

  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: { url: "" },
  });

  const scrapeRecipe = useScrapeRecipe({
    mutation: {
      onSuccess: (data) => {
        setScrapedData(data);
        toast({ title: "Recipe parsed! Review and save." });
      },
      onError: () => {
        toast({ title: "Could not parse recipe from URL.", variant: "destructive" });
      }
    }
  });

  const createRecipe = useCreateRecipe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRecipesQueryKey() });
        toast({ title: "Recipe saved to your cookbook." });
        setScrapedData(null);
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to save recipe.", variant: "destructive" });
      }
    }
  });

  const onSubmit = (values: z.infer<typeof urlSchema>) => {
    setScrapedData(null);
    scrapeRecipe.mutate({ data: values });
  };

  const handleSave = () => {
    if (!scrapedData) return;
    createRecipe.mutate({
      data: {
        title: scrapedData.title,
        sourceUrl: scrapedData.sourceUrl,
        ingredients: scrapedData.ingredients,
        instructions: scrapedData.instructions,
        imagePath: scrapedData.imagePath,
        yields: scrapedData.yields,
        totalTime: scrapedData.totalTime,
        prepTime: scrapedData.prepTime,
        cookTime: scrapedData.cookTime,
      }
    });
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <div className="mb-6">
        <h2 className="text-2xl font-serif text-primary mb-2">Import a Recipe</h2>
        <p className="text-muted-foreground">Paste a URL from any food blog. We'll extract just the recipe—no life stories or ads.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-3">
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                      placeholder="https://..." 
                      className="pl-10 h-12 text-base" 
                      {...field} 
                      disabled={scrapeRecipe.isPending || createRecipe.isPending}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" className="h-12 px-6" disabled={scrapeRecipe.isPending || createRecipe.isPending}>
            {scrapeRecipe.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Import"}
          </Button>
        </form>
      </Form>

      {scrapedData && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="border border-primary/20 bg-primary/5 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="flex gap-6 items-start relative z-10">
              {scrapedData.imagePath && (
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 shadow-sm">
                  <img src={scrapedData.imagePath} alt={scrapedData.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">{scrapedData.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><BookMarked className="h-4 w-4" /> {scrapedData.ingredients.length} ingredients</span>
                  {scrapedData.totalTime && <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {scrapedData.totalTime}</span>}
                  {scrapedData.yields && <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {scrapedData.yields}</span>}
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={createRecipe.isPending}>
                    {createRecipe.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookMarked className="h-4 w-4 mr-2" />}
                    Save to Cookbook
                  </Button>
                  <Button variant="outline" onClick={() => setScrapedData(null)} disabled={createRecipe.isPending}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
