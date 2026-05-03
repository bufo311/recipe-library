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
import { LabelFrame } from "@/components/label-frame";
import { useTheme } from "@/lib/theme-context";

const urlSchema = z.object({ url: z.string().url("Please enter a valid URL") });

export function UrlImporter() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { colors: c } = useTheme();
  const MILLS_SHADOW = `1px 1px 0 rgba(0,0,0,0.5), 2px 2px 0 rgba(0,0,0,0.3)`;

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
      onError: (err) => toast({ title: err.message || "Could not parse recipe from URL.", variant: "destructive" }),
    },
  });

  const onSubmit = (values: z.infer<typeof urlSchema>) => {
    scrapeRecipe.mutate({ data: values });
  };

  return (
    <LabelFrame>
      {/* Header — matches The Ledger */}
      <div style={{
        backgroundColor: c.sage,
        padding: "0.55rem 1rem",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        borderBottom: `2px solid ${c.gold}`,
      }}>
        <Globe className="h-3.5 w-3.5" style={{ color: c.cream, opacity: 0.7 }} />
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "0.8rem",
          fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.22em",
          color: c.cream, textShadow: MILLS_SHADOW,
        }}>Import a Receipt</h2>
      </div>

      {/* Body */}
      <div style={{ backgroundColor: c.parch, padding: "0.9rem 1rem 1rem" }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
          fontSize: "0.88rem", color: c.ink, opacity: 0.65, marginBottom: "0.75rem",
        }}>
          Paste a URL from any food blog. We'll extract just the recipe—no life stories or ads.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
            <FormField control={form.control} name="url" render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                      style={{ color: c.ink, opacity: 0.35 }} />
                    <Input
                      placeholder="https://..."
                      className="pl-9 h-10"
                      style={{
                        border: `2px solid ${c.black}`, borderRadius: 0,
                        backgroundColor: c.cream, color: c.ink,
                        fontFamily: "'Outfit', sans-serif", fontSize: "0.88rem",
                      }}
                      {...field}
                      disabled={scrapeRecipe.isPending}
                    />
                  </div>
                </FormControl>
                <FormMessage style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.72rem" }} />
              </FormItem>
            )} />
            <Button
              type="submit"
              className="h-10 px-5 shrink-0"
              disabled={scrapeRecipe.isPending}
              style={{
                backgroundColor: scrapeRecipe.isPending ? `${c.maroon}80` : c.maroon,
                color: c.cream, borderRadius: 0,
                fontFamily: "'Playfair Display', serif", fontWeight: 700,
                fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase",
                border: `2px solid ${c.black}`,
                textShadow: "1px 1px 0 rgba(0,0,0,0.4)",
              }}
            >
              {scrapeRecipe.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Extracting…</>
              ) : (
                "Import"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </LabelFrame>
  );
}
