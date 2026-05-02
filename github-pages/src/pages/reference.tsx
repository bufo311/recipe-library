import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Scale, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WEIGHT_CHART, BUILTIN_SUBSTITUTIONS } from "@/data/weight-chart";
import { useToast } from "@/hooks/use-toast";

interface UserSubstitution {
  id: string;
  ingredient: string;
  substitute: string;
  notes: string | null;
  createdAt: string;
}

const STORAGE_KEY = "recipe-archiver-substitutions";

function loadSubs(): UserSubstitution[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveSubs(subs: UserSubstitution[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
}

export default function Reference() {
  const [tab, setTab] = useState<"weights" | "substitutions">("weights");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ingredient: "", substitute: "", notes: "" });
  const [showForm, setShowForm] = useState(false);
  const [userSubs, setUserSubs] = useState<UserSubstitution[]>(loadSubs);

  const { toast } = useToast();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ingredient.trim() || !form.substitute.trim()) return;
    const next: UserSubstitution = {
      id: crypto.randomUUID(),
      ingredient: form.ingredient.trim(),
      substitute: form.substitute.trim(),
      notes: form.notes.trim() || null,
      createdAt: new Date().toISOString(),
    };
    const updated = [next, ...userSubs];
    setUserSubs(updated);
    saveSubs(updated);
    setForm({ ingredient: "", substitute: "", notes: "" });
    setShowForm(false);
    toast({ description: "Substitution saved." });
  }

  function handleDelete(id: string) {
    const updated = userSubs.filter((s) => s.id !== id);
    setUserSubs(updated);
    saveSubs(updated);
  }

  const filteredChart = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return WEIGHT_CHART;
    return WEIGHT_CHART.map((cat) => ({
      ...cat,
      entries: cat.entries.filter((e) => e.name.toLowerCase().includes(q)),
    })).filter((cat) => cat.entries.length > 0);
  }, [search]);

  const filteredBuiltins = useMemo(() => {
    const q = search.toLowerCase();
    if (!q || tab !== "substitutions") return BUILTIN_SUBSTITUTIONS;
    return BUILTIN_SUBSTITUTIONS.filter(
      (s) => s.ingredient.toLowerCase().includes(q) || s.substitute.toLowerCase().includes(q)
    );
  }, [search, tab]);

  const filteredUserSubs = useMemo(() => {
    const q = search.toLowerCase();
    if (!q || tab !== "substitutions") return userSubs;
    return userSubs.filter(
      (s) => s.ingredient.toLowerCase().includes(q) || s.substitute.toLowerCase().includes(q)
    );
  }, [search, userSubs, tab]);

  function fmt(v: number | null) {
    if (v === null) return <span className="text-muted-foreground/40">—</span>;
    return <span>{v}g</span>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-medium tracking-tight mb-1">Reference</h1>
          <p className="text-sm text-muted-foreground">
            King Arthur weight chart and kitchen substitutions.
          </p>
        </div>

        <div className="flex items-center gap-1 border-b border-border/50 mb-6">
          <button
            onClick={() => { setTab("weights"); setSearch(""); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === "weights"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Scale className="w-3.5 h-3.5" />
            Weight Chart
          </button>
          <button
            onClick={() => { setTab("substitutions"); setSearch(""); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === "substitutions"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Shuffle className="w-3.5 h-3.5" />
            Substitutions
          </button>
        </div>

        {tab === "weights" && (
          <div>
            <div className="mb-5">
              <Input
                placeholder="Search ingredients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Source: King Arthur Baking weight chart. All values per cup, tablespoon, and teaspoon.
            </p>
            <div className="space-y-6">
              {filteredChart.map((cat) => (
                <div key={cat.label}>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    {cat.label}
                  </h2>
                  <div className="border border-border/50 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border/50">
                          <th className="text-left px-4 py-2 font-medium text-muted-foreground">Ingredient</th>
                          <th className="text-right px-4 py-2 font-medium text-muted-foreground w-20">1 cup</th>
                          <th className="text-right px-4 py-2 font-medium text-muted-foreground w-20">1 tbsp</th>
                          <th className="text-right px-4 py-2 font-medium text-muted-foreground w-20">1 tsp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cat.entries.map((entry, i) => (
                          <tr
                            key={entry.name}
                            className={cn(
                              "border-b border-border/30 last:border-0",
                              i % 2 === 0 ? "" : "bg-muted/10"
                            )}
                          >
                            <td className="px-4 py-2.5 text-foreground">{entry.name}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{fmt(entry.cup)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{fmt(entry.tbsp)}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{fmt(entry.tsp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {filteredChart.length === 0 && (
                <p className="text-muted-foreground text-sm py-6 text-center">
                  No ingredients match "{search}"
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "substitutions" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <Input
                placeholder="Search substitutions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForm(!showForm)}
                className="ml-3 shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add mine
              </Button>
            </div>

            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="border border-border/50 rounded-lg p-4 mb-6 space-y-3 bg-muted/10"
              >
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Ingredient / what you have
                  </label>
                  <Input
                    placeholder="e.g. Sour cream (1 cup)"
                    value={form.ingredient}
                    onChange={(e) => setForm((f) => ({ ...f, ingredient: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Substitute with
                  </label>
                  <Input
                    placeholder="e.g. 1 cup plain Greek yogurt"
                    value={form.substitute}
                    onChange={(e) => setForm((f) => ({ ...f, substitute: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Notes <span className="font-normal">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Any tips or caveats…"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm">Save</Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => { setShowForm(false); setForm({ ingredient: "", substitute: "", notes: "" }); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {filteredUserSubs.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  My substitutions
                </h2>
                <div className="space-y-2">
                  {filteredUserSubs.map((sub) => (
                    <div
                      key={sub.id}
                      className="border border-border/50 rounded-lg px-4 py-3 flex gap-3 items-start group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{sub.ingredient}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{sub.substitute}</p>
                        {sub.notes && (
                          <p className="text-xs text-muted-foreground/70 mt-1 italic">{sub.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors mt-0.5 shrink-0"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                Common substitutions
              </h2>
              <div className="space-y-2">
                {filteredBuiltins.map((sub, i) => (
                  <div
                    key={i}
                    className="border border-border/30 rounded-lg px-4 py-3"
                  >
                    <p className="text-sm font-medium text-foreground">{sub.ingredient}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{sub.substitute}</p>
                    {sub.notes && (
                      <p className="text-xs text-muted-foreground/70 mt-1 italic">{sub.notes}</p>
                    )}
                  </div>
                ))}
                {filteredBuiltins.length === 0 && filteredUserSubs.length === 0 && (
                  <p className="text-muted-foreground text-sm py-6 text-center">
                    No substitutions match "{search}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
