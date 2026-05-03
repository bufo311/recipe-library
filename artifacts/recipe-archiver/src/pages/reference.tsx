import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, Scale, Shuffle } from "lucide-react";
import { WEIGHT_CHART, BUILTIN_SUBSTITUTIONS } from "@/data/weight-chart";
import { useToast } from "@/hooks/use-toast";

interface UserSubstitution {
  id: number; ingredient: string; substitute: string; notes: string | null; createdAt: string;
}

const MAROON = "#4A1520";
const TEAL   = "#3D7A72";
const GOLD   = "#C8A020";
const ROSE   = "#C05870";
const CREAM  = "#F5EEE0";
const PARCH  = "#E8D5A8";
const BLACK  = "#140A04";
const INK    = "#1E0E04";
const SAGE   = "#5E7A58";

const EGG_DART_DARK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12'%3E%3Crect width='20' height='12' fill='%23140A04'/%3E%3Cellipse cx='10' cy='6' rx='8' ry='3.5' fill='%23C8A020' opacity='0.3'/%3E%3Cellipse cx='10' cy='6' rx='5.5' ry='2' fill='%23140A04'/%3E%3Ccircle cx='0' cy='6' r='2' fill='%23C8A020' opacity='0.45'/%3E%3Ccircle cx='20' cy='6' r='2' fill='%23C8A020' opacity='0.45'/%3E%3C/svg%3E")`;
const EGG_DART_MAROON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='12'%3E%3Crect width='20' height='12' fill='%234A1520'/%3E%3Cellipse cx='10' cy='6' rx='8' ry='3.5' fill='%23C8A020' opacity='0.28'/%3E%3Cellipse cx='10' cy='6' rx='5.5' ry='2' fill='%234A1520'/%3E%3Ccircle cx='0' cy='6' r='2' fill='%23C8A020' opacity='0.4'/%3E%3Ccircle cx='20' cy='6' r='2' fill='%23C8A020' opacity='0.4'/%3E%3C/svg%3E")`;
const CABLE_TEAL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='10'%3E%3Crect width='20' height='10' fill='%233D7A72'/%3E%3Cpath d='M0 5 Q5 1 10 5 Q15 9 20 5' fill='none' stroke='%23F5EEE0' stroke-width='0.9' opacity='0.35'/%3E%3Cpath d='M0 5 Q5 9 10 5 Q15 1 20 5' fill='none' stroke='%23F5EEE0' stroke-width='0.9' opacity='0.35'/%3E%3C/svg%3E")`;
const CHEVRON_GOLD = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='8'%3E%3Crect width='16' height='8' fill='%23C8A020'/%3E%3Cpath d='M0 4 L4 1 L8 4 L12 1 L16 4 L12 7 L8 4 L4 7 Z' fill='none' stroke='%23140A04' stroke-width='0.7' opacity='0.35'/%3E%3C/svg%3E")`;

const MILLS_SHADOW = `1px 1px 0 #0A1A08, 2px 2px 0 #0A1A08, 3px 3px 0 rgba(0,0,0,0.3)`;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchSubstitutions(): Promise<UserSubstitution[]> {
  const res = await fetch(`${BASE}/api/substitutions`);
  if (!res.ok) throw new Error("Failed to fetch substitutions");
  return res.json();
}
async function createSubstitution(data: { ingredient: string; substitute: string; notes?: string }): Promise<UserSubstitution> {
  const res = await fetch(`${BASE}/api/substitutions`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save substitution");
  return res.json();
}
async function deleteSubstitution(id: number): Promise<void> {
  const res = await fetch(`${BASE}/api/substitutions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete substitution");
}

export default function Reference() {
  const [tab, setTab] = useState<"weights" | "substitutions">("weights");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ ingredient: "", substitute: "", notes: "" });
  const [showForm, setShowForm] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userSubs = [] } = useQuery({ queryKey: ["/api/substitutions"], queryFn: fetchSubstitutions });
  const createMutation = useMutation({
    mutationFn: createSubstitution,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/substitutions"] });
      setForm({ ingredient: "", substitute: "", notes: "" });
      setShowForm(false);
      toast({ description: "Substitution saved." });
    },
    onError: () => toast({ description: "Failed to save.", variant: "destructive" }),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteSubstitution,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/substitutions"] }),
    onError: () => toast({ description: "Failed to delete.", variant: "destructive" }),
  });

  const filteredChart = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return WEIGHT_CHART;
    return WEIGHT_CHART.map(cat => ({ ...cat, entries: cat.entries.filter(e => e.name.toLowerCase().includes(q)) }))
      .filter(cat => cat.entries.length > 0);
  }, [search]);

  const filteredBuiltins = useMemo(() => {
    const q = search.toLowerCase();
    if (!q || tab !== "substitutions") return BUILTIN_SUBSTITUTIONS;
    return BUILTIN_SUBSTITUTIONS.filter(s => s.ingredient.toLowerCase().includes(q) || s.substitute.toLowerCase().includes(q));
  }, [search, tab]);

  const filteredUserSubs = useMemo(() => {
    const q = search.toLowerCase();
    if (!q || tab !== "substitutions") return userSubs;
    return userSubs.filter(s => s.ingredient.toLowerCase().includes(q) || s.substitute.toLowerCase().includes(q));
  }, [search, userSubs, tab]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ingredient.trim() || !form.substitute.trim()) return;
    createMutation.mutate({ ingredient: form.ingredient.trim(), substitute: form.substitute.trim(), notes: form.notes.trim() || undefined });
  }

  function fmt(v: number | null) {
    if (v === null) return <span style={{ color: INK, opacity: 0.25 }}>—</span>;
    return <span>{v}g</span>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">

        {/* Page title */}
        <div style={{ border: `2px solid ${BLACK}`, marginBottom: 28 }}>
          <div style={{ height: 12, backgroundImage: EGG_DART_DARK, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 8, backgroundImage: CHEVRON_GOLD, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 3, backgroundColor: ROSE }} />
          <div style={{ backgroundColor: SAGE, padding: "0.75rem 1.5rem", borderBottom: `3px solid ${BLACK}` }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "2rem",
              fontWeight: 900, color: CREAM, textTransform: "uppercase", letterSpacing: "0.1em",
              textShadow: MILLS_SHADOW,
            }}>
              Reference
            </h1>
          </div>
          <div style={{ height: 3, backgroundColor: ROSE }} />
          <div style={{ backgroundColor: PARCH, padding: "0.5rem 1.5rem", borderBottom: `2px solid ${BLACK}` }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontSize: "0.95rem", color: INK, opacity: 0.7 }}>
              King Arthur weight chart &amp; kitchen substitutions
            </p>
          </div>
          <div style={{ height: 10, backgroundImage: CABLE_TEAL, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 5, backgroundColor: ROSE }} />
        </div>

        {/* Tab bar */}
        <div style={{ backgroundColor: PARCH, border: `2px solid ${BLACK}`,
          borderBottom: "none", display: "flex" }}>
          {[
            { id: "weights",       label: "Weight Chart",  icon: <Scale   className="w-3.5 h-3.5" /> },
            { id: "substitutions", label: "Substitutions", icon: <Shuffle className="w-3.5 h-3.5" /> },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id as "weights" | "substitutions"); setSearch(""); }}
              className="flex items-center gap-1.5 px-5 py-3 transition-colors"
              style={{
                fontFamily: "'Playfair Display', serif", fontWeight: 700,
                fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase",
                borderBottom: tab === t.id ? `3px solid ${TEAL}` : `3px solid transparent`,
                color: tab === t.id ? TEAL : INK,
                backgroundColor: tab === t.id ? CREAM : "transparent",
                opacity: tab === t.id ? 1 : 0.55,
              }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div style={{ backgroundColor: CREAM, border: `2px solid ${BLACK}`,
          borderTop: `3px solid ${TEAL}`, padding: "1.5rem" }}>

          {/* Weight Chart */}
          {tab === "weights" && (
            <div>
              <div className="mb-5">
                <Input placeholder="Search ingredients…" value={search}
                  onChange={e => setSearch(e.target.value)} className="max-w-sm"
                  style={{ border: `2px solid ${BLACK}`, borderRadius: 0,
                    backgroundColor: "#FFF9EB", color: INK, fontFamily: "'Outfit', sans-serif" }} />
              </div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.68rem",
                textTransform: "uppercase", letterSpacing: "0.12em", color: INK,
                opacity: 0.45, marginBottom: 20 }}>
                Source: King Arthur Baking — values per cup, tablespoon &amp; teaspoon
              </p>
              <div className="space-y-8">
                {filteredChart.map(cat => (
                  <div key={cat.label}>
                    {/* Category band */}
                    <div style={{ height: 10, backgroundImage: CABLE_TEAL, backgroundRepeat: "repeat-x" }} />
                    <div style={{ backgroundColor: TEAL, padding: "0.3rem 0.85rem",
                      borderBottom: `2px solid ${BLACK}` }}>
                      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.25em", color: CREAM }}>
                        {cat.label}
                      </h2>
                    </div>
                    <div style={{ border: `2px solid ${BLACK}`, borderTop: "none", overflow: "hidden" }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: PARCH, borderBottom: `2px solid ${BLACK}` }}>
                            <th className="text-left px-4 py-2.5"
                              style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                                textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700,
                                color: INK, opacity: 0.65 }}>Ingredient</th>
                            {["1 cup", "1 tbsp", "1 tsp"].map(h => (
                              <th key={h} className="text-right px-4 py-2.5 w-20"
                                style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                                  textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700,
                                  color: INK, opacity: 0.65 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {cat.entries.map((entry, i) => (
                            <tr key={entry.name} style={{
                              backgroundColor: i % 2 === 0 ? CREAM : "#EFE5CC",
                              borderBottom: `1px solid rgba(30,14,4,0.08)` }}>
                              <td className="px-4 py-2.5"
                                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: INK }}>
                                {entry.name}
                              </td>
                              {[entry.cup, entry.tbsp, entry.tsp].map((v, vi) => (
                                <td key={vi} className="px-4 py-2.5 text-right tabular-nums"
                                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.82rem", color: INK }}>
                                  {fmt(v)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
                {filteredChart.length === 0 && (
                  <p className="text-center py-8"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                      fontSize: "1rem", color: INK, opacity: 0.5 }}>
                    No ingredients match "{search}"
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Substitutions */}
          {tab === "substitutions" && (
            <div>
              <div className="flex items-center justify-between mb-5 gap-3">
                <Input placeholder="Search substitutions…" value={search}
                  onChange={e => setSearch(e.target.value)} className="max-w-sm"
                  style={{ border: `2px solid ${BLACK}`, borderRadius: 0,
                    backgroundColor: "#FFF9EB", color: INK, fontFamily: "'Outfit', sans-serif" }} />
                <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}
                  className="shrink-0"
                  style={{ border: `2px solid ${BLACK}`, borderRadius: 0, backgroundColor: PARCH,
                    color: INK, fontFamily: "'Outfit', sans-serif", fontSize: "0.72rem" }}>
                  <Plus className="w-3.5 h-3.5 mr-1" />Add mine
                </Button>
              </div>

              {showForm && (
                <form onSubmit={handleSubmit}
                  style={{ border: `2px solid ${BLACK}`, backgroundColor: PARCH,
                    padding: "1.1rem", marginBottom: 24 }}
                  className="space-y-3">
                  {[
                    { key: "ingredient", label: "Ingredient / what you have", placeholder: "e.g. Sour cream (1 cup)", required: true },
                    { key: "substitute", label: "Substitute with", placeholder: "e.g. 1 cup plain Greek yogurt", required: true },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                        textTransform: "uppercase", letterSpacing: "0.12em",
                        color: INK, opacity: 0.6, display: "block", marginBottom: 4 }}>
                        {f.label}
                      </label>
                      <Input placeholder={f.placeholder} value={form[f.key as keyof typeof form]}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                        required={f.required}
                        style={{ border: `1px solid ${BLACK}`, borderRadius: 0,
                          backgroundColor: CREAM, color: INK, fontFamily: "'Outfit', sans-serif" }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                      textTransform: "uppercase", letterSpacing: "0.12em",
                      color: INK, opacity: 0.6, display: "block", marginBottom: 4 }}>
                      Notes <span style={{ textTransform: "none", opacity: 0.7 }}>(optional)</span>
                    </label>
                    <Textarea placeholder="Any tips or caveats…" value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                      className="resize-none"
                      style={{ border: `1px solid ${BLACK}`, borderRadius: 0,
                        backgroundColor: CREAM, color: INK, fontFamily: "'Outfit', sans-serif" }} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={createMutation.isPending}
                      style={{ backgroundColor: BLACK, color: GOLD, borderRadius: 0,
                        fontFamily: "'Outfit', sans-serif", border: "none" }}>
                      {createMutation.isPending ? "Saving…" : "Save"}
                    </Button>
                    <Button type="button" size="sm" variant="ghost"
                      onClick={() => { setShowForm(false); setForm({ ingredient: "", substitute: "", notes: "" }); }}
                      style={{ color: INK, fontFamily: "'Outfit', sans-serif", borderRadius: 0 }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {filteredUserSubs.length > 0 && (
                <div className="mb-6">
                  <div style={{ height: 10, backgroundImage: CABLE_TEAL, backgroundRepeat: "repeat-x" }} />
                  <div style={{ backgroundColor: MAROON, padding: "0.3rem 0.85rem",
                    borderBottom: `2px solid ${BLACK}` }}>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.25em", color: CREAM }}>
                      My Substitutions
                    </h2>
                  </div>
                  <div style={{ border: `2px solid ${BLACK}`, borderTop: "none" }}>
                    {filteredUserSubs.map((sub, i) => (
                      <div key={sub.id} className="flex gap-3 items-start"
                        style={{ padding: "0.85rem 1rem",
                          backgroundColor: i % 2 === 0 ? CREAM : PARCH,
                          borderBottom: i < filteredUserSubs.length - 1 ? `1px solid rgba(30,14,4,0.1)` : "none" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700,
                            fontSize: "0.95rem", color: INK }}>{sub.ingredient}</p>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem",
                            color: TEAL, marginTop: 2 }}>{sub.substitute}</p>
                          {sub.notes && (
                            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                              fontSize: "0.88rem", color: INK, opacity: 0.55, marginTop: 3 }}>{sub.notes}</p>
                          )}
                        </div>
                        <button onClick={() => deleteMutation.mutate(sub.id)} title="Delete"
                          style={{ flexShrink: 0, marginTop: 3 }}>
                          <Trash2 className="w-3.5 h-3.5" style={{ color: ROSE, opacity: 0.7 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ height: 10, backgroundImage: CABLE_TEAL, backgroundRepeat: "repeat-x" }} />
                <div style={{ backgroundColor: TEAL, padding: "0.3rem 0.85rem",
                  borderBottom: `2px solid ${BLACK}` }}>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.25em", color: CREAM }}>
                    Common Substitutions
                  </h2>
                </div>
                <div style={{ border: `2px solid ${BLACK}`, borderTop: "none" }}>
                  {filteredBuiltins.map((sub, i) => (
                    <div key={i}
                      style={{ padding: "0.85rem 1rem",
                        backgroundColor: i % 2 === 0 ? CREAM : PARCH,
                        borderBottom: i < filteredBuiltins.length - 1 ? `1px solid rgba(30,14,4,0.1)` : "none" }}>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700,
                        fontSize: "0.95rem", color: INK }}>{sub.ingredient}</p>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem",
                        color: TEAL, marginTop: 2 }}>{sub.substitute}</p>
                      {sub.notes && (
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                          fontSize: "0.88rem", color: INK, opacity: 0.55, marginTop: 3 }}>{sub.notes}</p>
                      )}
                    </div>
                  ))}
                  {filteredBuiltins.length === 0 && filteredUserSubs.length === 0 && (
                    <p className="text-center py-8"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
                        fontSize: "1rem", color: INK, opacity: 0.5 }}>
                      No substitutions match "{search}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom rule */}
        <div style={{ height: 12, backgroundImage: EGG_DART_MAROON, backgroundRepeat: "repeat-x" }} />
        <div style={{ height: 8, backgroundImage: CHEVRON_GOLD, backgroundRepeat: "repeat-x" }} />
        <div style={{ display: "flex", height: 6 }}>
          <div style={{ flex: 1, backgroundColor: ROSE  }} />
          <div style={{ flex: 2, backgroundColor: GOLD  }} />
          <div style={{ flex: 1, backgroundColor: TEAL  }} />
          <div style={{ flex: 2, backgroundColor: GOLD  }} />
          <div style={{ flex: 1, backgroundColor: ROSE  }} />
        </div>
      </div>
    </Layout>
  );
}
