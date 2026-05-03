import { useState, useMemo } from "react";
import { Layout } from "@/components/layout";
import { LabelFrame } from "@/components/label-frame";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Scale, Shuffle } from "lucide-react";
import { WEIGHT_CHART, BUILTIN_SUBSTITUTIONS } from "@/data/weight-chart";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme-context";

interface UserSubstitution {
  id: string; ingredient: string; substitute: string; notes: string | null; createdAt: string;
}

const STORAGE_KEY = "recipe-archiver-substitutions";

function loadSubs(): UserSubstitution[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}
function saveSubs(subs: UserSubstitution[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subs));
}

export default function Reference() {
  const { colors: c, patterns: p } = useTheme();
  const MILLS_SHADOW = `1px 1px 0 rgba(0,0,0,0.5), 2px 2px 0 rgba(0,0,0,0.3)`;

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
      id: crypto.randomUUID(), ingredient: form.ingredient.trim(),
      substitute: form.substitute.trim(), notes: form.notes.trim() || null,
      createdAt: new Date().toISOString(),
    };
    const updated = [next, ...userSubs];
    setUserSubs(updated); saveSubs(updated);
    setForm({ ingredient: "", substitute: "", notes: "" });
    setShowForm(false);
    toast({ description: "Substitution saved." });
  }

  function handleDelete(id: string) {
    const updated = userSubs.filter(s => s.id !== id);
    setUserSubs(updated); saveSubs(updated);
  }

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

  function fmt(v: number | null) {
    if (v === null) return <span style={{ color: c.ink, opacity: 0.25 }}>—</span>;
    return <span>{v}g</span>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-3xl">

        {/* Page title */}
        <LabelFrame style={{ marginBottom: 28 }} variant={4}>
          <div style={{ height: 8, backgroundImage: p.chevronGold, backgroundRepeat: "repeat-x" }} />
          <div style={{ height: 3, backgroundColor: c.rose }} />
          <div style={{ backgroundColor: c.sage, padding: "0.75rem 1.5rem", borderBottom: `3px solid ${c.black}` }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem",
              fontWeight: 900, color: c.cream, textTransform: "uppercase", letterSpacing: "0.1em",
              textShadow: MILLS_SHADOW }}>Reference</h1>
          </div>
          <div style={{ height: 3, backgroundColor: c.rose }} />
          <div style={{ backgroundColor: c.parch, padding: "0.5rem 1.5rem" }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontSize: "0.95rem", color: c.ink, opacity: 0.7 }}>
              King Arthur weight chart &amp; kitchen substitutions
            </p>
          </div>
        </LabelFrame>

        {/* Tabs */}
        <div style={{ backgroundColor: c.parch, border: `2px solid ${c.black}`, borderBottom: "none", display: "flex" }}>
          {[
            { id: "weights",       label: "Weight Chart",  icon: <Scale   className="w-3.5 h-3.5" /> },
            { id: "substitutions", label: "Substitutions", icon: <Shuffle className="w-3.5 h-3.5" /> },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id as "weights" | "substitutions"); setSearch(""); }}
              className="flex items-center gap-1.5 px-5 py-3 transition-colors"
              style={{
                fontFamily: "'Playfair Display', serif", fontWeight: 700,
                fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase",
                borderBottom: tab === t.id ? `3px solid ${c.teal}` : `3px solid transparent`,
                color: tab === t.id ? c.teal : c.ink,
                backgroundColor: tab === t.id ? c.cream : "transparent",
                opacity: tab === t.id ? 1 : 0.55,
              }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div style={{ backgroundColor: c.cream, border: `2px solid ${c.black}`,
          borderTop: `3px solid ${c.teal}`, padding: "1.5rem" }}>

          {tab === "weights" && (
            <div>
              <div className="mb-5">
                <Input placeholder="Search ingredients…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm"
                  style={{ border: `2px solid ${c.black}`, borderRadius: 0, backgroundColor: "#FFF9EB", color: c.ink, fontFamily: "'Outfit', sans-serif" }} />
              </div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.68rem",
                textTransform: "uppercase", letterSpacing: "0.12em", color: c.ink, opacity: 0.45, marginBottom: 20 }}>
                Source: King Arthur Baking — values per cup, tablespoon &amp; teaspoon
              </p>
              <div className="space-y-6">
                {filteredChart.map((cat, catIdx) => {
                  const rowA = catIdx % 2 === 0 ? c.cream : c.parch;
                  const rowB = catIdx % 2 === 0 ? c.parch : c.cream;
                  return (
                  <LabelFrame key={cat.label} variant={catIdx % 7}>
                    <div style={{ height: 10, backgroundImage: p.cableTeal, backgroundRepeat: "repeat-x" }} />
                    <div style={{ backgroundColor: c.teal, padding: "0.3rem 0.85rem", borderBottom: `2px solid ${c.black}` }}>
                      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", fontWeight: 700,
                        textTransform: "uppercase", letterSpacing: "0.25em", color: c.cream }}>{cat.label}</h2>
                    </div>
                    <div style={{ overflow: "hidden" }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: rowB, borderBottom: `2px solid ${c.black}` }}>
                            <th className="text-left px-4 py-2.5"
                              style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                                textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700,
                                color: c.ink, opacity: 0.65 }}>Ingredient</th>
                            {["1 cup","1 tbsp","1 tsp"].map(h => (
                              <th key={h} className="text-right px-4 py-2.5 w-20"
                                style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                                  textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700,
                                  color: c.ink, opacity: 0.65 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {cat.entries.map((entry, i) => (
                            <tr key={entry.name} style={{
                              backgroundColor: i % 2 === 0 ? rowA : rowB,
                              borderBottom: `1px solid rgba(30,14,4,0.08)` }}>
                              <td className="px-4 py-2.5"
                                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: c.ink }}>
                                {entry.name}</td>
                              {[entry.cup,entry.tbsp,entry.tsp].map((v,vi) => (
                                <td key={vi} className="px-4 py-2.5 text-right tabular-nums"
                                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.82rem", color: c.ink }}>
                                  {fmt(v)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </LabelFrame>
                  );
                })}
                {filteredChart.length === 0 && (
                  <p className="text-center py-8"
                    style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: c.ink, opacity: 0.5 }}>
                    No ingredients match "{search}"
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === "substitutions" && (
            <div>
              <div className="flex items-center justify-between mb-5 gap-3">
                <Input placeholder="Search substitutions…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm"
                  style={{ border: `2px solid ${c.black}`, borderRadius: 0, backgroundColor: "#FFF9EB", color: c.ink, fontFamily: "'Outfit', sans-serif" }} />
                <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="shrink-0"
                  style={{ border: `2px solid ${c.black}`, borderRadius: 0, backgroundColor: c.parch,
                    color: c.ink, fontFamily: "'Outfit', sans-serif", fontSize: "0.72rem" }}>
                  <Plus className="w-3.5 h-3.5 mr-1" />Add mine
                </Button>
              </div>

              {showForm && (
                <form onSubmit={handleSubmit}
                  style={{ border: `2px solid ${c.black}`, backgroundColor: c.parch, padding: "1.1rem", marginBottom: 24 }}
                  className="space-y-3">
                  {[
                    { key: "ingredient", label: "Ingredient / what you have", ph: "e.g. Sour cream (1 cup)", req: true },
                    { key: "substitute", label: "Substitute with", ph: "e.g. 1 cup plain Greek yogurt", req: true },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                        textTransform: "uppercase", letterSpacing: "0.12em",
                        color: c.ink, opacity: 0.6, display: "block", marginBottom: 4 }}>{f.label}</label>
                      <Input placeholder={f.ph} value={form[f.key as keyof typeof form]}
                        onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} required={f.req}
                        style={{ border: `1px solid ${c.black}`, borderRadius: 0,
                          backgroundColor: c.cream, color: c.ink, fontFamily: "'Outfit', sans-serif" }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem",
                      textTransform: "uppercase", letterSpacing: "0.12em",
                      color: c.ink, opacity: 0.6, display: "block", marginBottom: 4 }}>
                      Notes <span style={{ textTransform: "none", opacity: 0.7 }}>(optional)</span>
                    </label>
                    <Textarea placeholder="Any tips or caveats…" value={form.notes}
                      onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="resize-none"
                      style={{ border: `1px solid ${c.black}`, borderRadius: 0,
                        backgroundColor: c.cream, color: c.ink, fontFamily: "'Outfit', sans-serif" }} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm"
                      style={{ backgroundColor: c.black, color: c.gold, borderRadius: 0,
                        fontFamily: "'Outfit', sans-serif", border: "none" }}>Save</Button>
                    <Button type="button" size="sm" variant="ghost"
                      onClick={() => { setShowForm(false); setForm({ ingredient: "", substitute: "", notes: "" }); }}
                      style={{ color: c.ink, fontFamily: "'Outfit', sans-serif", borderRadius: 0 }}>Cancel</Button>
                  </div>
                </form>
              )}

              {filteredUserSubs.length > 0 && (
                <div className="mb-6">
                  <div style={{ height: 10, backgroundImage: p.cableTeal, backgroundRepeat: "repeat-x" }} />
                  <div style={{ backgroundColor: c.maroon, padding: "0.3rem 0.85rem", borderBottom: `2px solid ${c.black}` }}>
                    <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", fontWeight: 700,
                      textTransform: "uppercase", letterSpacing: "0.25em", color: c.cream }}>My Substitutions</h2>
                  </div>
                  <div style={{ border: `2px solid ${c.black}`, borderTop: "none" }}>
                    {filteredUserSubs.map((sub, i) => (
                      <div key={sub.id} className="flex gap-3 items-start"
                        style={{ padding: "0.85rem 1rem",
                          backgroundColor: i % 2 === 0 ? c.cream : c.parch,
                          borderBottom: i < filteredUserSubs.length - 1 ? `1px solid rgba(30,14,4,0.1)` : "none" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.95rem", color: c.ink }}>{sub.ingredient}</p>
                          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: c.teal, marginTop: 2 }}>{sub.substitute}</p>
                          {sub.notes && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.88rem", color: c.ink, opacity: 0.55, marginTop: 3 }}>{sub.notes}</p>}
                        </div>
                        <button onClick={() => handleDelete(sub.id)} title="Delete" style={{ flexShrink: 0, marginTop: 3 }}>
                          <Trash2 className="w-3.5 h-3.5" style={{ color: c.rose, opacity: 0.7 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ height: 10, backgroundImage: p.cableTeal, backgroundRepeat: "repeat-x" }} />
                <div style={{ backgroundColor: c.teal, padding: "0.3rem 0.85rem", borderBottom: `2px solid ${c.black}` }}>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.25em", color: c.cream }}>Common Substitutions</h2>
                </div>
                <div style={{ border: `2px solid ${c.black}`, borderTop: "none" }}>
                  {filteredBuiltins.map((sub, i) => (
                    <div key={i}
                      style={{ padding: "0.85rem 1rem",
                        backgroundColor: i % 2 === 0 ? c.cream : c.parch,
                        borderBottom: i < filteredBuiltins.length - 1 ? `1px solid rgba(30,14,4,0.1)` : "none" }}>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "0.95rem", color: c.ink }}>{sub.ingredient}</p>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", color: c.teal, marginTop: 2 }}>{sub.substitute}</p>
                      {sub.notes && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "0.88rem", color: c.ink, opacity: 0.55, marginTop: 3 }}>{sub.notes}</p>}
                    </div>
                  ))}
                  {filteredBuiltins.length === 0 && filteredUserSubs.length === 0 && (
                    <p className="text-center py-8"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1rem", color: c.ink, opacity: 0.5 }}>
                      No substitutions match "{search}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 12, backgroundImage: p.eggDartMaroon, backgroundRepeat: "repeat-x" }} />
        <div style={{ height: 8, backgroundImage: p.chevronGold, backgroundRepeat: "repeat-x" }} />
        <div style={{ display: "flex", height: 6 }}>
          <div style={{ flex: 1, backgroundColor: c.rose  }} />
          <div style={{ flex: 2, backgroundColor: c.gold  }} />
          <div style={{ flex: 1, backgroundColor: c.teal  }} />
          <div style={{ flex: 2, backgroundColor: c.gold  }} />
          <div style={{ flex: 1, backgroundColor: c.rose  }} />
        </div>
      </div>
    </Layout>
  );
}
